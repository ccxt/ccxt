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
                Symbol("auth/api_key/login") => 100,
                Symbol("auth/wallet/login") => 100
            )
        ),
        Symbol("publicMarket") => Dict{Symbol, Any}(
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("full/v1/instrument") => 4,
                Symbol("full/v1/all_instruments") => 4,
                Symbol("full/v1/instruments") => 4,
                Symbol("full/v1/currency") => 12,
                Symbol("full/v1/margin_rules") => 12,
                Symbol("full/v1/mini") => 4,
                Symbol("full/v1/ticker") => 4,
                Symbol("full/v1/book") => 12,
                Symbol("full/v1/trade") => 12,
                Symbol("full/v1/trade_history") => 12,
                Symbol("full/v1/kline") => 12,
                Symbol("full/v1/funding") => 12
            )
        ),
        Symbol("privateTrading") => Dict{Symbol, Any}(
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("full/v1/create_order") => 5,
                Symbol("full/v1/cancel_order") => 5,
                Symbol("full/v1/cancel_on_disconnect") => 100,
                Symbol("full/v1/cancel_all_orders") => 50,
                Symbol("full/v1/order") => rlOrders,
                Symbol("full/v1/order_history") => rlOrders,
                Symbol("full/v1/open_orders") => rlOrders,
                Symbol("full/v1/fill_history") => rlOrders,
                Symbol("full/v1/positions") => rlOrders,
                Symbol("full/v1/funding_payment_history") => rlOthers,
                Symbol("full/v1/get_sub_accounts") => rlOthers,
                Symbol("full/v1/account_summary") => rlOthers,
                Symbol("full/v1/account_history") => rlOthers,
                Symbol("full/v1/aggregated_account_summary") => rlOthers,
                Symbol("full/v1/funding_account_summary") => rlOthers,
                Symbol("full/v1/transfer") => 100,
                Symbol("full/v1/deposit_history") => 100,
                Symbol("full/v1/transfer_history") => 100,
                Symbol("full/v1/withdrawal") => 100,
                Symbol("full/v1/withdrawal_history") => 100,
                Symbol("full/v1/add_position_margin") => rlOthers,
                Symbol("full/v1/get_position_margin_limits") => rlOthers,
                Symbol("full/v1/set_position_config") => rlOthers,
                Symbol("full/v1/set_initial_leverage") => rlOthers,
                Symbol("full/v1/get_all_initial_leverage") => rlOthers,
                Symbol("full/v1/set_derisk_mm_ratio") => rlOthers,
                Symbol("full/v1/vault_burn_tokens") => rlOthers,
                Symbol("full/v1/vault_invest") => rlOthers,
                Symbol("full/v1/vault_investor_summary") => rlOthers,
                Symbol("full/v1/vault_redeem") => rlOthers,
                Symbol("full/v1/vault_redeem_cancel") => rlOthers,
                Symbol("full/v1/vault_view_redemption_queue") => rlOthers,
                Symbol("full/v1/vault_manager_investor_history") => rlOthers,
                Symbol("full/v1/authorize_builder") => rlOthers,
                Symbol("full/v1/get_authorized_builders") => rlOthers,
                Symbol("full/v1/builder_fill_history") => rlOthers
            )
        )
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("accountId") => nothing,
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("ARBONE") => "42161",
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
function signIn(self::Grvt, params=Dict())
    if functions.ccxtruthy(@functions.ccxt_or(self.privateKey == nothing, self.privateKey == ""))
        throw(PermissionDenied("Private key is required for this operation. If you used joined GRVT through email registration instead of Web3 wallet, then read: https://github.com/ccxt/ccxt/wiki/FAQ#how-to-use-the-grvt-exchange-in-ccxt"));
    end
    Base.fetch(self.signInWithPrivateKey(params));
    Base.fetch(self.initializeClient(params));
    Base.fetch(self.loadAccountInfos());
    return true

end
function signInWithApiKey(self::Grvt, params=Dict())
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
function signInWithPrivateKey(self::Grvt, params=Dict())
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
function initializeClient(self::Grvt, params=Dict())
    builderFee = self.safeBool(params, "builderFee", self.safeBool(self.options, "builderFee", true));
    if functions.ccxtruthy(!functions.ccxtruthy(builderFee))
            return false
    end
    approvedBuilderFee = self.safeBool(self.options, "approvedBuilderFee", false);
    if functions.ccxtruthy(approvedBuilderFee)
            return true
    end
    results = Base.fetch(asyncmap(Base.fetch, [self.privateTradingPostFullV1GetAuthorizedBuilders(), self.loadAccountInfos()]));
    currentBuilders = get(results, 1, nothing);
    approvedBuilder = self.safeList(currentBuilders, "results", []);
    len = length(approvedBuilder);
    found = false;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, len))
        builderInfo = self.safeDict(approvedBuilder, i, Dict{Symbol, Any}());
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
function fetchMarkets(self::Grvt, params=Dict())
    marketsPromise = self.publicMarketPostFullV1AllInstruments(params);
    promises = [marketsPromise];
    if functions.ccxtruthy(@functions.ccxt_or(!functions.ccxtruthy(self.isEmptyString(self.apiKey)), !functions.ccxtruthy(self.isEmptyString(self.privateKey))))
                push!(promises, self.signIn());
    end
    results = Base.fetch(asyncmap(Base.fetch, promises));
    response = get(results, 1, nothing);
    result = self.safeList(response, "result", []);
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
        Symbol("base") => self.parseNumber(self.parsePrecision(safeString(market, "base_decimals"))),
        Symbol("quote") => self.parseNumber(self.parsePrecision(safeString(market, "quote_decimals")))
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
function fetchCurrencies(self::Grvt, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("") => ""
    );
    response = Base.fetch(self.publicMarketPostFullV1Currency(request));
    responseResult = self.safeList(response, "result", []);
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
    Symbol("precision") => self.parseNumber(self.parsePrecision(safeString(rawCurrency, "balance_decimals"))),
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
function fetchTicker(self::Grvt, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instrument") => self.marketId(symbol)
    );
    response = Base.fetch(self.publicMarketPostFullV1Ticker(extend(request, params)));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    return self.parseTicker(result, market)

end
function parseTicker(self::Grvt, ticker, market=nothing)
    marketId = safeString(ticker, "instrument");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("info") => ticker,
    Symbol("symbol") => self.safeSymbol(marketId, market),
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
function fetchOrderBook(self::Grvt, symbol, limit=nothing, params=Dict())
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
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    timestamp = self.parse8601(safeString(result, "event_time"));
    marketId = safeString(result, "instrument");
    return self.parseOrderBook(result, self.safeSymbol(marketId), timestamp, "bids", "asks", "price", "size")

end
function fetchTrades(self::Grvt, symbol, since=nothing, limit=nothing, params=Dict())
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
    (request, params) = self.handleUntilOptionString("end_time", request, params, 1000000);
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_time")] = numberToString(since * 1000000);
    end
    response = Base.fetch(self.publicMarketPostFullV1TradeHistory(extend(request, params)));
    result = self.safeList(response, "result", []);
    return self.parseTrades(result, market, since, limit)

end
function parseTrade(self::Grvt, trade, market=nothing)
    marketId = safeString(trade, "instrument");
    market = self.safeMarket(marketId, market);
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
), market)

end
function fetchOHLCV(self::Grvt, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
    maxLimit = 1000;
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOHLCV", "paginate", false);
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchOHLCV", symbol, since, limit, timeframe, params, maxLimit))
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
    (request, params) = self.handleUntilOptionString("end_time", request, params, 1000000);
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_time")] = numberToString(since * 1000000);
    end
    response = Base.fetch(self.publicMarketPostFullV1Kline(extend(request, params)));
    candles = self.safeList(response, "result", []);
    return self.parseOHLCVs(candles, market, timeframe, since, limit)

end
function parseOHLCV(self::Grvt, ohlcv, market=nothing)
    return [safeIntegerProduct(ohlcv, "open_time", 0.000001), self.safeNumber(ohlcv, "open"), self.safeNumber(ohlcv, "high"), self.safeNumber(ohlcv, "low"), self.safeNumber(ohlcv, "close"), self.safeNumber(ohlcv, "volume_b")]

end
function fetchFundingRateHistory(self::Grvt, symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
    request = Dict{Symbol, Any}(
        Symbol("instrument") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 1000);
    end
    (request, params) = self.handleUntilOptionString("end_time", request, params, 1000000);
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_time")] = numberToString(since * 1000000);
    end
    response = Base.fetch(self.publicMarketPostFullV1Funding(extend(request, params)));
    result = self.safeList(response, "result", []);
    return self.parseFundingRateHistories(result, market)

end
function parseFundingRateHistory(self::Grvt, rawItem, market=nothing)
    marketId = safeString(rawItem, "instrument");
    ts = safeIntegerProduct(rawItem, "funding_time", 0.000001);
    return Dict{Symbol, Any}(
    Symbol("info") => rawItem,
    Symbol("symbol") => self.safeSymbol(marketId, market),
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
function fetchBalance(self::Grvt, params=Dict())
    Base.fetch(self.loadMarketsAndSignIn());
    request = Dict{Symbol, Any}(
        Symbol("sub_account_id") => self.getSubAccountId(params)
    );
    response = Base.fetch(self.privateTradingPostFullV1AccountSummary(extend(request, params)));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    return self.parseBalance(result)

end
function parseBalance(self::Grvt, response)
    timestamp = safeIntegerProduct(response, "event_time", 0.000001);
    result = Dict{Symbol, Any}(
        Symbol("info") => response,
        Symbol("timestamp") => timestamp,
        Symbol("datetime") => self.iso8601(timestamp)
    );
    spotBalances = self.safeList(response, "spot_balances", []);
    availableBalance = safeString(response, "available_balance");
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(spotBalances)))
        balance = get(spotBalances, i + 1, nothing);
        currencyId = safeString(balance, "currency");
        code = self.safeCurrencyCode(currencyId);
        account = self.account();
        account[Symbol("total")] = safeString(balance, "balance");
        account[Symbol("free")] = availableBalance;
        result[Symbol(code)] = account;
        i += 1
    end
    return self.safeBalance(result)

end
function fetchDeposits(self::Grvt, code=nothing, since=nothing, limit=nothing, params=Dict())
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
    (request, params) = self.handleUntilOptionString("end_time", request, params, 1000000);
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_time")] = numberToString(since * 1000000);
    end
    useTransfersEndpoint = self.safeBool(self.options, "useTransfersEndpointForDepositsWithdrawals", true);
    if functions.ccxtruthy(useTransfersEndpoint)
        transfers = Base.fetch(self.internalFetchTransfers(extend(request, params), currency, since, limit));
        filteredResults = self.filterTransfersByType(transfers, "deposit", true);
        transactions = self.getListFromObjectValues(get(filteredResults, 1, nothing), "info");
            return self.parseTransactions(transactions, currency, since, limit)
    else
        response = Base.fetch(self.privateTradingPostFullV1DepositHistory(extend(request, params)));
        result = self.safeList(response, "result", []);
        return self.parseTransactions(result, currency, since, limit)
    end

end
function fetchWithdrawals(self::Grvt, code=nothing, since=nothing, limit=nothing, params=Dict())
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
    (request, params) = self.handleUntilOptionString("end_time", request, params, 1000000);
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_time")] = numberToString(since * 1000000);
    end
    useTransfersEndpoint = self.safeBool(self.options, "useTransfersEndpointForDepositsWithdrawals", true);
    if functions.ccxtruthy(useTransfersEndpoint)
        transfers = Base.fetch(self.internalFetchTransfers(extend(request, params), currency, since, limit));
        filteredResults = self.filterTransfersByType(transfers, "withdrawal", true);
        transactions = self.getListFromObjectValues(get(filteredResults, 1, nothing), "info");
            return self.parseTransactions(transactions, currency, since, limit)
    else
        response = Base.fetch(self.privateTradingPostFullV1WithdrawalHistory(extend(request, params)));
        result = self.safeList(response, "result", []);
        return self.parseTransactions(result, currency, since, limit)
    end

end
function internalFetchTransfers(self::Grvt, req, currency=nothing, since=nothing, limit=nothing)
    response = Base.fetch(self.privateTradingPostFullV1TransferHistory(req));
    rows = self.safeList(response, "result", []);
    transfers = self.parseTransfers(rows, currency, since, limit);
    return transfers

end
function parseTransaction(self::Grvt, transaction, currency=nothing)
    direction = nothing;
    txId = nothing;
    networkCode = nothing;
    addressFrom = safeString(transaction, "from_account_id");
    addressTo = safeString(transaction, "to_account_id");
    currencyId = safeString(transaction, "currency");
    code = self.safeCurrencyCode(currencyId, currency);
    if functions.ccxtruthy(ccxt_in("transfer_metadata", transaction))
        metaData = omitZero(safeString(transaction, "transfer_metadata"));
        if functions.ccxtruthy(metaData != nothing)
            parsedMeta = self.parseJson(metaData);
            direction = safeStringLower(parsedMeta, "direction");
            txId = safeString(parsedMeta, "provider_tx_id");
            networkCode = self.networkIdToCode(safeString(parsedMeta, "chainid"), code);
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
function fetchTransfers(self::Grvt, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(code == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchTransfers() requires a code argument")));
    end
    Base.fetch(self.loadMarketsAndSignIn());
    request = Dict{Symbol, Any}();
    currency = self.currency(code);
    maxLimit = 1000;
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchTransfers", "paginate", false);
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchTransfers", nothing, since, limit, params, maxLimit))
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 1000);
    end
    (request, params) = self.handleUntilOptionString("end_time", request, params, 1000000);
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_time")] = numberToString(since * 1000000);
    end
    response = Base.fetch(self.privateTradingPostFullV1TransferHistory(extend(request, params)));
    rows = self.safeList(response, "result", []);
    transfers = self.parseTransfers(rows, currency, since, limit);
    filteredResults = self.filterTransfersByType(transfers, "internal", false);
    return get(filteredResults, 2, nothing)

end
function filterTransfersByType(self::Grvt, transfers, transferType, onlyMainAccount=true)
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
function transfer(self::Grvt, code, amount, fromAccount, toAccount, params=Dict())
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
    request = self.createSignedRequest(request, "EIP712_TRANSFER_TYPE", currency);
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
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    return self.parseTransfer(result, currency)

end
function parseTransfer(self::Grvt, transfer, currency=nothing)
    currencyId = safeString(transfer, "currency");
    code = self.safeCurrencyCode(currencyId, currency);
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
    result1 = self.safeDict(get(responses, 1, nothing), "result", Dict{Symbol, Any}());
    mainAccountId = safeString(result1, "main_account_id");
    self.options[Symbol("userMainAccountId")] = mainAccountId;
    if functions.ccxtruthy(accountIsUndefined)
        subAccountIds = self.safeList(get(responses, 2, nothing), "sub_account_ids", []);
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
function withdraw(self::Grvt, code, amount, address, tag=nothing, params=Dict())
    self.checkAddress(address);
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
    networkId = self.networkCodeToId(networkCode, code);
    if functions.ccxtruthy(networkId == nothing)
        throw(BadRequest(string(self.id, " withdraw() requires a network parameter")));
    end
    request[Symbol("signature")][Symbol("chain_id")] = networkId;
    request = self.createSignedRequest(request, "EIP712_WITHDRAWAL_TYPE", currency);
    response = Base.fetch(self.privateTradingPostFullV1Withdrawal(extend(request, query)));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    return self.parseTransaction(result, currency)

end
function createOrder(self::Grvt, symbol, type_var, side, amount, price=nothing, params=Dict())
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
    isReduceOnly = self.safeBool(params, "reduceOnly", false);
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
    postOnly = self.isPostOnly(isMarketOrder, nothing, params);
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
                Symbol("close_position") => self.safeBool(params, "closePosition", false)
            )
        );
        params = omit(params, ["triggerDirection", "triggerPriceType", "closePosition"]);
    end
    eipType = "EIP712_ORDER_TYPE";
    builderFee = self.safeBool(params, "builderFee", self.safeBool(self.options, "builderFee", true));
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
    data = self.safeDict(response, "result", Dict{Symbol, Any}());
    return self.parseOrder(data, market)

end
function convertToBigIntCustom(self::Grvt, x)
    return ccxt_parseInt(x)

end
function eipMessageForOrder(self::Grvt, order, structureType)
    priceMultiplier = "1000000000";
    orderLegs = self.safeList(order, "legs", []);
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
            powerNum = functions.ccxtruthy(limitDecLengthStr == "0") ? 0 : self.convertToBigIntCustom(limitDecLengthStr);
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
    if functions.ccxtruthy(@functions.ccxt_and(structureType == "EIP712_ORDER_WITH_BUILDER_TYPE", self.safeBool(self.options, "builderFee", true)))
        returnValue[Symbol("builder")] = get(order, Symbol("builder"), nothing);
        returnValue[Symbol("builderFee")] = self.parseToInt(self.convertToBigIntCustom(self.feeAmountMultiplier()) * ccxt_toNumber(get(order, Symbol("builder_fee"), nothing)));
    end
    return returnValue

end
function fetchMyTrades(self::Grvt, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.loadMarketsAndSignIn());
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchMyTrades", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchMyTrades", symbol, since, limit, params))
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
    (request, params) = self.handleUntilOptionString("end_time", request, params, 1000000);
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_time")] = numberToString(since * 1000000);
    end
    response = Base.fetch(self.privateTradingPostFullV1FillHistory(extend(request, params)));
    result = self.safeList(response, "result", []);
    return self.parseTrades(result, nothing, since, limit)

end
function fetchPositions(self::Grvt, symbols=nothing, params=Dict())
    Base.fetch(self.loadMarketsAndSignIn());
    request = Dict{Symbol, Any}(
        Symbol("sub_account_id") => self.getSubAccountId(params)
    );
    if functions.ccxtruthy(symbols != nothing)
        symbols = self.marketSymbols(symbols);
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
    result = self.safeList(response, "result", []);
    return self.parsePositions(result, symbols)

end
function parsePosition(self::Grvt, position, market=nothing)
    marketId = safeString(position, "instrument");
    timestamp = safeIntegerProduct(position, "event_time", 0.000001);
    sizeRaw = safeString(position, "size");
    isLong = (stringGe(sizeRaw, "0"));
    side = functions.ccxtruthy(isLong) ? "long" : "short";
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => nothing,
    Symbol("symbol") => self.safeSymbol(marketId, market),
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
function fetchLeverages(self::Grvt, symbols=nothing, params=Dict())
    Base.fetch(self.loadMarketsAndSignIn());
    request = Dict{Symbol, Any}(
        Symbol("sub_account_id") => self.getSubAccountId(params)
    );
    response = Base.fetch(self.privateTradingPostFullV1GetAllInitialLeverage(extend(request, params)));
    results = self.safeList(response, "results", []);
    return self.parseLeverages(results, symbols)

end
function setLeverage(self::Grvt, leverage, symbol=nothing, params=Dict())
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
    return self.parseLeverage(response, market)

end
function parseLeverage(self::Grvt, leverage, market=nothing)
    marketId = safeString(leverage, "instrument");
    leverageValue = self.safeNumber(leverage, "leverage");
    marginType = safeStringLower(leverage, "margin_type");
    return Dict{Symbol, Any}(
    Symbol("info") => leverage,
    Symbol("symbol") => self.safeSymbol(marketId, market),
    Symbol("marginMode") => marginType,
    Symbol("longLeverage") => leverageValue,
    Symbol("shortLeverage") => leverageValue
)

end
function fetchMarginModes(self::Grvt, symbols=nothing, params=Dict())
    Base.fetch(self.loadMarketsAndSignIn());
    request = Dict{Symbol, Any}(
        Symbol("sub_account_id") => self.getSubAccountId(params)
    );
    response = Base.fetch(self.privateTradingPostFullV1GetAllInitialLeverage(extend(request, params)));
    results = self.safeList(response, "results", []);
    return self.parseLeverages(results, symbols)

end
function parseMarginMode(self::Grvt, marginMode, market=nothing)
    marketId = safeString(marginMode, "symbol");
    return Dict{Symbol, Any}(
    Symbol("info") => marginMode,
    Symbol("symbol") => self.safeSymbol(marketId, market),
    Symbol("marginMode") => safeStringLower(marginMode, "margin_type")
)

end
function fetchFundingHistory(self::Grvt, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.loadMarketsAndSignIn());
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchFundingHistory", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchFundingHistory", symbol, since, limit, params, 1000))
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
    (request, params) = self.handleUntilOptionString("end_time", request, params, 1000000);
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_time")] = numberToString(since * 1000000);
    end
    response = Base.fetch(self.privateTradingPostFullV1FundingPaymentHistory(extend(request, params)));
    result = self.safeList(response, "result", []);
    return self.parseIncomes(result, market, since, limit)

end
function parseIncome(self::Grvt, income, market=nothing)
    marketId = safeString(income, "instrument");
    currencyId = safeString(income, "currency");
    timestamp = safeIntegerProduct(income, "event_time", 0.000001);
    return Dict{Symbol, Any}(
    Symbol("info") => income,
    Symbol("symbol") => self.safeSymbol(marketId, market),
    Symbol("code") => self.safeCurrencyCode(currencyId),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("id") => safeString(income, "tx_id"),
    Symbol("amount") => self.safeNumber(income, "amount")
)

end
function fetchOrders(self::Grvt, symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
    (request, params) = self.handleUntilOptionString("end_time", request, params, 1000000);
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_time")] = numberToString(since * 1000000);
    end
    response = Base.fetch(self.privateTradingPostFullV1OrderHistory(extend(request, params)));
    result = self.safeList(response, "result", []);
    return self.parseOrders(result, market, since, limit)

end
function fetchOpenOrders(self::Grvt, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.loadMarketsAndSignIn());
    request = Dict{Symbol, Any}(
        Symbol("sub_account_id") => self.getSubAccountId(params)
    );
    response = Base.fetch(self.privateTradingPostFullV1OpenOrders(extend(request, params)));
    result = self.safeList(response, "result", []);
    return self.parseOrders(result, nothing, since, limit)

end
function fetchOrder(self::Grvt, id, symbol=nothing, params=Dict())
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
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    return self.parseOrder(result)

end
function parseOrder(self::Grvt, order, market=nothing)
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
    legs = self.safeList(order, "legs", []);
    metadata = self.safeDict(order, "metadata", Dict{Symbol, Any}());
    stateObj = self.safeDict(order, "state", Dict{Symbol, Any}());
    filledAmounts = self.safeList(stateObj, "traded_size", []);
    avgPrices = self.safeList(stateObj, "avg_fill_price", []);
    primaryOrderIndex = 0;
    firstLeg = self.safeDict(legs, primaryOrderIndex);
    if functions.ccxtruthy(firstLeg != nothing)
        marketId = safeString(firstLeg, "instrument");
        market = self.safeMarket(marketId, market);
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
), market)

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
function cancelAllOrders(self::Grvt, symbol=nothing, params=Dict())
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
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    return self.parseOrders([result])

end
function cancelOrder(self::Grvt, id, symbol=nothing, params=Dict())
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
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
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
function createSignedRequest(self::Grvt, request, structureType, currencyObj=nothing, signerAddress=nothing)
    messageData = nothing;
    if functions.ccxtruthy(structureType == "EIP712_TRANSFER_TYPE")
        amountMultiplier = self.convertToBigIntCustom("1000000");
        amountInt = get(request, Symbol("num_tokens"), nothing) * amountMultiplier;
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
function handleUntilOptionString(self::Grvt, key, request, params, multiplier=1)
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
function sign(self::Grvt, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    query = omit(params, self.extractParams(path));
    url = get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing) + path;
    queryString = "";
    if functions.ccxtruthy(method == "GET")
        if functions.ccxtruthy(length(objectKeys(query)))
            queryString = self.urlencode(query);
            url += string("?", queryString);
        end
    elseif functions.ccxtruthy(method == "POST")
        body = json(params);
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

# Property resolution is shared by every generated exchange; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Grvt, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function privateEdgePostAuthApiKeyLogin(self::Grvt, params=Dict(), context=Dict())
    return request(self, "auth/api_key/login", "privateEdge", "POST", params, nothing, nothing, Dict(Symbol("cost") => 100))
end

function privateEdgePostAuthWalletLogin(self::Grvt, params=Dict(), context=Dict())
    return request(self, "auth/wallet/login", "privateEdge", "POST", params, nothing, nothing, Dict(Symbol("cost") => 100))
end

function publicMarketPostFullV1Instrument(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/instrument", "publicMarket", "POST", params, nothing, nothing, Dict(Symbol("cost") => 4))
end

function publicMarketPostFullV1AllInstruments(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/all_instruments", "publicMarket", "POST", params, nothing, nothing, Dict(Symbol("cost") => 4))
end

function publicMarketPostFullV1Instruments(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/instruments", "publicMarket", "POST", params, nothing, nothing, Dict(Symbol("cost") => 4))
end

function publicMarketPostFullV1Currency(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/currency", "publicMarket", "POST", params, nothing, nothing, Dict(Symbol("cost") => 12))
end

function publicMarketPostFullV1MarginRules(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/margin_rules", "publicMarket", "POST", params, nothing, nothing, Dict(Symbol("cost") => 12))
end

function publicMarketPostFullV1Mini(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/mini", "publicMarket", "POST", params, nothing, nothing, Dict(Symbol("cost") => 4))
end

function publicMarketPostFullV1Ticker(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/ticker", "publicMarket", "POST", params, nothing, nothing, Dict(Symbol("cost") => 4))
end

function publicMarketPostFullV1Book(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/book", "publicMarket", "POST", params, nothing, nothing, Dict(Symbol("cost") => 12))
end

function publicMarketPostFullV1Trade(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/trade", "publicMarket", "POST", params, nothing, nothing, Dict(Symbol("cost") => 12))
end

function publicMarketPostFullV1TradeHistory(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/trade_history", "publicMarket", "POST", params, nothing, nothing, Dict(Symbol("cost") => 12))
end

function publicMarketPostFullV1Kline(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/kline", "publicMarket", "POST", params, nothing, nothing, Dict(Symbol("cost") => 12))
end

function publicMarketPostFullV1Funding(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/funding", "publicMarket", "POST", params, nothing, nothing, Dict(Symbol("cost") => 12))
end

function privateTradingPostFullV1CreateOrder(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/create_order", "privateTrading", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateTradingPostFullV1CancelOrder(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/cancel_order", "privateTrading", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateTradingPostFullV1CancelOnDisconnect(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/cancel_on_disconnect", "privateTrading", "POST", params, nothing, nothing, Dict(Symbol("cost") => 100))
end

function privateTradingPostFullV1CancelAllOrders(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/cancel_all_orders", "privateTrading", "POST", params, nothing, nothing, Dict(Symbol("cost") => 50))
end

function privateTradingPostFullV1Order(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/order", "privateTrading", "POST", params, nothing, nothing, Dict())
end

function privateTradingPostFullV1OrderHistory(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/order_history", "privateTrading", "POST", params, nothing, nothing, Dict())
end

function privateTradingPostFullV1OpenOrders(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/open_orders", "privateTrading", "POST", params, nothing, nothing, Dict())
end

function privateTradingPostFullV1FillHistory(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/fill_history", "privateTrading", "POST", params, nothing, nothing, Dict())
end

function privateTradingPostFullV1Positions(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/positions", "privateTrading", "POST", params, nothing, nothing, Dict())
end

function privateTradingPostFullV1FundingPaymentHistory(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/funding_payment_history", "privateTrading", "POST", params, nothing, nothing, Dict())
end

function privateTradingPostFullV1GetSubAccounts(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/get_sub_accounts", "privateTrading", "POST", params, nothing, nothing, Dict())
end

function privateTradingPostFullV1AccountSummary(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/account_summary", "privateTrading", "POST", params, nothing, nothing, Dict())
end

function privateTradingPostFullV1AccountHistory(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/account_history", "privateTrading", "POST", params, nothing, nothing, Dict())
end

function privateTradingPostFullV1AggregatedAccountSummary(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/aggregated_account_summary", "privateTrading", "POST", params, nothing, nothing, Dict())
end

function privateTradingPostFullV1FundingAccountSummary(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/funding_account_summary", "privateTrading", "POST", params, nothing, nothing, Dict())
end

function privateTradingPostFullV1Transfer(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/transfer", "privateTrading", "POST", params, nothing, nothing, Dict(Symbol("cost") => 100))
end

function privateTradingPostFullV1DepositHistory(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/deposit_history", "privateTrading", "POST", params, nothing, nothing, Dict(Symbol("cost") => 100))
end

function privateTradingPostFullV1TransferHistory(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/transfer_history", "privateTrading", "POST", params, nothing, nothing, Dict(Symbol("cost") => 100))
end

function privateTradingPostFullV1Withdrawal(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/withdrawal", "privateTrading", "POST", params, nothing, nothing, Dict(Symbol("cost") => 100))
end

function privateTradingPostFullV1WithdrawalHistory(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/withdrawal_history", "privateTrading", "POST", params, nothing, nothing, Dict(Symbol("cost") => 100))
end

function privateTradingPostFullV1AddPositionMargin(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/add_position_margin", "privateTrading", "POST", params, nothing, nothing, Dict())
end

function privateTradingPostFullV1GetPositionMarginLimits(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/get_position_margin_limits", "privateTrading", "POST", params, nothing, nothing, Dict())
end

function privateTradingPostFullV1SetPositionConfig(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/set_position_config", "privateTrading", "POST", params, nothing, nothing, Dict())
end

function privateTradingPostFullV1SetInitialLeverage(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/set_initial_leverage", "privateTrading", "POST", params, nothing, nothing, Dict())
end

function privateTradingPostFullV1GetAllInitialLeverage(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/get_all_initial_leverage", "privateTrading", "POST", params, nothing, nothing, Dict())
end

function privateTradingPostFullV1SetDeriskMmRatio(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/set_derisk_mm_ratio", "privateTrading", "POST", params, nothing, nothing, Dict())
end

function privateTradingPostFullV1VaultBurnTokens(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/vault_burn_tokens", "privateTrading", "POST", params, nothing, nothing, Dict())
end

function privateTradingPostFullV1VaultInvest(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/vault_invest", "privateTrading", "POST", params, nothing, nothing, Dict())
end

function privateTradingPostFullV1VaultInvestorSummary(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/vault_investor_summary", "privateTrading", "POST", params, nothing, nothing, Dict())
end

function privateTradingPostFullV1VaultRedeem(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/vault_redeem", "privateTrading", "POST", params, nothing, nothing, Dict())
end

function privateTradingPostFullV1VaultRedeemCancel(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/vault_redeem_cancel", "privateTrading", "POST", params, nothing, nothing, Dict())
end

function privateTradingPostFullV1VaultViewRedemptionQueue(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/vault_view_redemption_queue", "privateTrading", "POST", params, nothing, nothing, Dict())
end

function privateTradingPostFullV1VaultManagerInvestorHistory(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/vault_manager_investor_history", "privateTrading", "POST", params, nothing, nothing, Dict())
end

function privateTradingPostFullV1AuthorizeBuilder(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/authorize_builder", "privateTrading", "POST", params, nothing, nothing, Dict())
end

function privateTradingPostFullV1GetAuthorizedBuilders(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/get_authorized_builders", "privateTrading", "POST", params, nothing, nothing, Dict())
end

function privateTradingPostFullV1BuilderFillHistory(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/builder_fill_history", "privateTrading", "POST", params, nothing, nothing, Dict())
end

function Grvt(; kwargs...)
    inst = Grvt(Exchange(), describe, eipDefinitions, usesPrivateKey, signIn, signInWithApiKey, signInWithPrivateKey, initializeClient, fetchMarkets, parseMarket, fetchCurrencies, parseCurrency, fetchTicker, parseTicker, fetchOrderBook, fetchTrades, parseTrade, fetchOHLCV, parseOHLCV, fetchFundingRateHistory, parseFundingRateHistory, getSubAccountId, fetchBalance, parseBalance, fetchDeposits, fetchWithdrawals, internalFetchTransfers, parseTransaction, fetchTransfers, filterTransfersByType, transfer, parseTransfer, loadAccountInfos, withdraw, createOrder, convertToBigIntCustom, eipMessageForOrder, fetchMyTrades, fetchPositions, parsePosition, fetchLeverages, setLeverage, parseLeverage, fetchMarginModes, parseMarginMode, fetchFundingHistory, parseIncome, fetchOrders, fetchOpenOrders, fetchOrder, parseOrder, parseTimeInForce, timeInForceToInt, parseOrderStatus, cancelAllOrders, cancelOrder, eipDomainData, feeAmountMultiplier, createSignedRequest, formatSignatureRS, defaultSignature, handleUntilOptionString, requestId, sign, handleErrors, privateEdgePostAuthApiKeyLogin, privateEdgePostAuthWalletLogin, publicMarketPostFullV1Instrument, publicMarketPostFullV1AllInstruments, publicMarketPostFullV1Instruments, publicMarketPostFullV1Currency, publicMarketPostFullV1MarginRules, publicMarketPostFullV1Mini, publicMarketPostFullV1Ticker, publicMarketPostFullV1Book, publicMarketPostFullV1Trade, publicMarketPostFullV1TradeHistory, publicMarketPostFullV1Kline, publicMarketPostFullV1Funding, privateTradingPostFullV1CreateOrder, privateTradingPostFullV1CancelOrder, privateTradingPostFullV1CancelOnDisconnect, privateTradingPostFullV1CancelAllOrders, privateTradingPostFullV1Order, privateTradingPostFullV1OrderHistory, privateTradingPostFullV1OpenOrders, privateTradingPostFullV1FillHistory, privateTradingPostFullV1Positions, privateTradingPostFullV1FundingPaymentHistory, privateTradingPostFullV1GetSubAccounts, privateTradingPostFullV1AccountSummary, privateTradingPostFullV1AccountHistory, privateTradingPostFullV1AggregatedAccountSummary, privateTradingPostFullV1FundingAccountSummary, privateTradingPostFullV1Transfer, privateTradingPostFullV1DepositHistory, privateTradingPostFullV1TransferHistory, privateTradingPostFullV1Withdrawal, privateTradingPostFullV1WithdrawalHistory, privateTradingPostFullV1AddPositionMargin, privateTradingPostFullV1GetPositionMarginLimits, privateTradingPostFullV1SetPositionConfig, privateTradingPostFullV1SetInitialLeverage, privateTradingPostFullV1GetAllInitialLeverage, privateTradingPostFullV1SetDeriskMmRatio, privateTradingPostFullV1VaultBurnTokens, privateTradingPostFullV1VaultInvest, privateTradingPostFullV1VaultInvestorSummary, privateTradingPostFullV1VaultRedeem, privateTradingPostFullV1VaultRedeemCancel, privateTradingPostFullV1VaultViewRedemptionQueue, privateTradingPostFullV1VaultManagerInvestorHistory, privateTradingPostFullV1AuthorizeBuilder, privateTradingPostFullV1GetAuthorizedBuilders, privateTradingPostFullV1BuilderFillHistory)
    desc = inst.describe()
    for (k, v) in desc
        inst[Symbol(k)] = v
    end
    return inst
end
