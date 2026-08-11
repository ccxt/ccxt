@kwdef mutable struct Pacifica <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    initializeClient::Function = initializeClient
    handleBuilderFeeApproval::Function = handleBuilderFeeApproval
    fetchMarkets::Function = fetchMarkets
    fetchSwapMarkets::Function = fetchSwapMarkets
    parseMarket::Function = parseMarket
    fetchBalance::Function = fetchBalance
    fetchLeverage::Function = fetchLeverage
    parseLeverageFromSetting::Function = parseLeverageFromSetting
    parseLeverageFromMarket::Function = parseLeverageFromMarket
    fetchAccountSettings::Function = fetchAccountSettings
    loadAccountSettings::Function = loadAccountSettings
    parseAccountSettings::Function = parseAccountSettings
    fetchMarginMode::Function = fetchMarginMode
    parseMarginModeFromSetting::Function = parseMarginModeFromSetting
    fetchOrderBook::Function = fetchOrderBook
    fetchFundingRates::Function = fetchFundingRates
    parseFundingRate::Function = parseFundingRate
    fetchOHLCV::Function = fetchOHLCV
    parseOHLCV::Function = parseOHLCV
    fetchTrades::Function = fetchTrades
    fetchMyTrades::Function = fetchMyTrades
    parseTrade::Function = parseTrade
    createOrder::Function = createOrder
    createOrderRequest::Function = createOrderRequest
    batchOrdersRequest::Function = batchOrdersRequest
    createOrdersRequest::Function = createOrdersRequest
    createOrders::Function = createOrders
    cancelOrders::Function = cancelOrders
    cancelOrdersRequest::Function = cancelOrdersRequest
    cancelAllOrders::Function = cancelAllOrders
    cancelAllOrdersRequest::Function = cancelAllOrdersRequest
    cancelOrder::Function = cancelOrder
    cancelOrderRequest::Function = cancelOrderRequest
    editOrder::Function = editOrder
    editOrderRequest::Function = editOrderRequest
    fetchFundingRateHistory::Function = fetchFundingRateHistory
    fetchTickers::Function = fetchTickers
    parseTicker::Function = parseTicker
    fetchClosedOrders::Function = fetchClosedOrders
    fetchCanceledOrders::Function = fetchCanceledOrders
    fetchCanceledAndClosedOrders::Function = fetchCanceledAndClosedOrders
    fetchOpenOrders::Function = fetchOpenOrders
    fetchOrders::Function = fetchOrders
    addPaginationCursorToResult::Function = addPaginationCursorToResult
    fetchOrder::Function = fetchOrder
    parseOrderStatus::Function = parseOrderStatus
    mapTimeInForce::Function = mapTimeInForce
    mapSide::Function = mapSide
    parseOrderType::Function = parseOrderType
    parseOrder::Function = parseOrder
    fetchPosition::Function = fetchPosition
    fetchPositions::Function = fetchPositions
    parsePosition::Function = parsePosition
    setMarginMode::Function = setMarginMode
    setLeverage::Function = setLeverage
    withdraw::Function = withdraw
    fetchTradingFee::Function = fetchTradingFee
    parseTradingFee::Function = parseTradingFee
    fetchOpenInterests::Function = fetchOpenInterests
    fetchOpenInterest::Function = fetchOpenInterest
    parseOpenInterest::Function = parseOpenInterest
    fetchLedger::Function = fetchLedger
    parseLedgerEntry::Function = parseLedgerEntry
    parseLedgerEntryType::Function = parseLedgerEntryType
    fetchFundingHistory::Function = fetchFundingHistory
    parseIncome::Function = parseIncome
    transfer::Function = transfer
    parseTransfer::Function = parseTransfer
    createSubAccount::Function = createSubAccount
    bindAgentWallet::Function = bindAgentWallet
    createApiKey::Function = createApiKey
    revokeApiKey::Function = revokeApiKey
    fetchApiKeys::Function = fetchApiKeys
    approveBuilderCode::Function = approveBuilderCode
    fetchBuilderApprovals::Function = fetchBuilderApprovals
    revokeBuilderCode::Function = revokeBuilderCode
    handleOriginAndSingleAddress::Function = handleOriginAndSingleAddress
    handleErrors::Function = handleErrors
    sign::Function = sign
    calculateRateLimiterCost::Function = calculateRateLimiterCost
    sortJsonKeys::Function = sortJsonKeys
    prepareMessage::Function = prepareMessage
    signMessage::Function = signMessage
    postActionRequest::Function = postActionRequest

# Generated REST endpoint fields
    publicGetInfo::Function = publicGetInfo
    publicGetInfoFees::Function = publicGetInfoFees
    publicGetInfoPrices::Function = publicGetInfoPrices
    publicGetKline::Function = publicGetKline
    publicGetKlineMark::Function = publicGetKlineMark
    publicGetBook::Function = publicGetBook
    publicGetTrades::Function = publicGetTrades
    publicGetFundingRateHistory::Function = publicGetFundingRateHistory
    publicGetLoanPool::Function = publicGetLoanPool
    publicGetAccount::Function = publicGetAccount
    publicGetAccountLoan::Function = publicGetAccountLoan
    publicGetAccountSettings::Function = publicGetAccountSettings
    publicGetPositions::Function = publicGetPositions
    publicGetTradesHistory::Function = publicGetTradesHistory
    publicGetFundingHistory::Function = publicGetFundingHistory
    publicGetPortfolio::Function = publicGetPortfolio
    publicGetAccountBalanceHistory::Function = publicGetAccountBalanceHistory
    publicGetAccountSpotBalanceHistory::Function = publicGetAccountSpotBalanceHistory
    publicGetAccountSpotAssetDepositHistory::Function = publicGetAccountSpotAssetDepositHistory
    publicGetAccountSpotAssetWithdrawHistory::Function = publicGetAccountSpotAssetWithdrawHistory
    publicGetAccountSpotAssetWithdrawPending::Function = publicGetAccountSpotAssetWithdrawPending
    publicGetOrders::Function = publicGetOrders
    publicGetOrdersHistory::Function = publicGetOrdersHistory
    publicGetOrdersHistoryById::Function = publicGetOrdersHistoryById
    publicGetSpotAssets::Function = publicGetSpotAssets
    publicGetSpotAssetsBridgeInfo::Function = publicGetSpotAssetsBridgeInfo
    publicGetSpotAssetsBridgeParametersSymbol::Function = publicGetSpotAssetsBridgeParametersSymbol
    publicGetLakeList::Function = publicGetLakeList
    publicGetAccountBuilderCodesApprovals::Function = publicGetAccountBuilderCodesApprovals
    privatePostAccountLeverage::Function = privatePostAccountLeverage
    privatePostAccountMargin::Function = privatePostAccountMargin
    privatePostAccountWithdraw::Function = privatePostAccountWithdraw
    privatePostAccountSettingsAutoLendDisabled::Function = privatePostAccountSettingsAutoLendDisabled
    privatePostAccountSettingsSpot::Function = privatePostAccountSettingsSpot
    privatePostAccountSpotAssetWithdraw::Function = privatePostAccountSpotAssetWithdraw
    privatePostAccountSubaccountCreate::Function = privatePostAccountSubaccountCreate
    privatePostAccountSubaccountList::Function = privatePostAccountSubaccountList
    privatePostAccountSubaccountTransfer::Function = privatePostAccountSubaccountTransfer
    privatePostAccountSubaccountSpotAssetTransfer::Function = privatePostAccountSubaccountSpotAssetTransfer
    privatePostPositionsAddIsolatedMargin::Function = privatePostPositionsAddIsolatedMargin
    privatePostOrdersCreate::Function = privatePostOrdersCreate
    privatePostOrdersCreateMarket::Function = privatePostOrdersCreateMarket
    privatePostOrdersStopCreate::Function = privatePostOrdersStopCreate
    privatePostPositionsTpsl::Function = privatePostPositionsTpsl
    privatePostOrdersCancel::Function = privatePostOrdersCancel
    privatePostOrdersCancelAll::Function = privatePostOrdersCancelAll
    privatePostOrdersStopCancel::Function = privatePostOrdersStopCancel
    privatePostOrdersEdit::Function = privatePostOrdersEdit
    privatePostOrdersBatch::Function = privatePostOrdersBatch
    privatePostAccountBuilderCodesApprove::Function = privatePostAccountBuilderCodesApprove
    privatePostAccountBuilderCodesRevoke::Function = privatePostAccountBuilderCodesRevoke
    privatePostAgentBind::Function = privatePostAgentBind
    privatePostAccountApiKeysCreate::Function = privatePostAccountApiKeysCreate
    privatePostAccountApiKeysRevoke::Function = privatePostAccountApiKeysRevoke
    privatePostAccountApiKeys::Function = privatePostAccountApiKeys
    privatePostLakeAddBlacklist::Function = privatePostLakeAddBlacklist
    privatePostLakeAddMaxLeverage::Function = privatePostLakeAddMaxLeverage
    privatePostLakeAddWhitelist::Function = privatePostLakeAddWhitelist
    privatePostLakeClaimManager::Function = privatePostLakeClaimManager
    privatePostLakeClaimReferralCode::Function = privatePostLakeClaimReferralCode
    privatePostLakeCreate::Function = privatePostLakeCreate
    privatePostLakeDeposit::Function = privatePostLakeDeposit
    privatePostLakeRemoveBlacklist::Function = privatePostLakeRemoveBlacklist
    privatePostLakeRemoveMaxLeverage::Function = privatePostLakeRemoveMaxLeverage
    privatePostLakeRemoveWhitelist::Function = privatePostLakeRemoveWhitelist
    privatePostLakeUpdateDepositCap::Function = privatePostLakeUpdateDepositCap
    privatePostLakeWithdraw::Function = privatePostLakeWithdraw

end
function describe(self::Pacifica, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "pacifica",
    Symbol("name") => "Pacifica",
    Symbol("countries") => [],
    Symbol("version") => "v1",
    Symbol("isSandboxModeEnabled") => false,
    Symbol("rateLimit") => 600,
    Symbol("certified") => false,
    Symbol("pro") => true,
    Symbol("dex") => true,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => true,
        Symbol("margin") => false,
        Symbol("swap") => true,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("addMargin") => false,
        Symbol("borrowCrossMargin") => false,
        Symbol("borrowIsolatedMargin") => false,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelAllOrdersAfter") => false,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => true,
        Symbol("cancelOrdersForSymbols") => nothing,
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => false,
        Symbol("createMarketBuyOrderWithCost") => false,
        Symbol("createMarketOrderWithCost") => false,
        Symbol("createMarketSellOrderWithCost") => false,
        Symbol("createOrder") => true,
        Symbol("createOrders") => true,
        Symbol("createOrderWithTakeProfitAndStopLoss") => true,
        Symbol("createReduceOnlyOrder") => true,
        Symbol("createStopOrder") => true,
        Symbol("editOrder") => true,
        Symbol("editOrders") => false,
        Symbol("fetchAccounts") => false,
        Symbol("fetchBalance") => true,
        Symbol("fetchBorrowInterest") => false,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchCanceledAndClosedOrders") => true,
        Symbol("fetchCanceledOrders") => true,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => false,
        Symbol("fetchDepositAddress") => false,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDeposits") => false,
        Symbol("fetchDepositWithdrawFee") => false,
        Symbol("fetchDepositWithdrawFees") => false,
        Symbol("fetchFundingHistory") => true,
        Symbol("fetchFundingRate") => false,
        Symbol("fetchFundingRateHistory") => true,
        Symbol("fetchFundingRates") => true,
        Symbol("fetchIndexOHLCV") => false,
        Symbol("fetchIsolatedBorrowRate") => false,
        Symbol("fetchIsolatedBorrowRates") => false,
        Symbol("fetchLedger") => true,
        Symbol("fetchLeverage") => true,
        Symbol("fetchLeverageTiers") => false,
        Symbol("fetchLiquidations") => false,
        Symbol("fetchMarginMode") => true,
        Symbol("fetchMarketLeverageTiers") => false,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => false,
        Symbol("fetchMyLiquidations") => false,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterest") => true,
        Symbol("fetchOpenInterestHistory") => false,
        Symbol("fetchOpenInterests") => true,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrders") => true,
        Symbol("fetchOrderTrades") => false,
        Symbol("fetchPosition") => true,
        Symbol("fetchPositionMode") => false,
        Symbol("fetchPositions") => true,
        Symbol("fetchPositionsRisk") => false,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchStatus") => nothing,
        Symbol("fetchTicker") => "emulated",
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => nothing,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => true,
        Symbol("fetchTradingFees") => false,
        Symbol("fetchTransfer") => false,
        Symbol("fetchTransfers") => false,
        Symbol("fetchWithdrawal") => false,
        Symbol("fetchWithdrawals") => false,
        Symbol("reduceMargin") => false,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("sandbox") => true,
        Symbol("setLeverage") => true,
        Symbol("setMarginMode") => true,
        Symbol("setPositionMode") => false,
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
        Symbol("8h") => "8h",
        Symbol("12h") => "12h",
        Symbol("1d") => "1d",
        Symbol("1w") => "1w",
        Symbol("1M") => "1M"
    ),
    Symbol("hostname") => "pacifica.fi",
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/03ed021f-cdec-43c8-acb4-941f1282f610",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => "https://api.{hostname}",
            Symbol("private") => "https://api.{hostname}"
        ),
        Symbol("test") => Dict{Symbol, Any}(
            Symbol("public") => "https://test-api.{hostname}",
            Symbol("private") => "https://test-api.{hostname}"
        ),
        Symbol("www") => "https://www.pacifica.fi",
        Symbol("doc") => "https://docs.pacifica.fi/api-documentation/api/rest-api",
        Symbol("fees") => "https://docs.pacifica.fi/trading-on-pacifica/trading-fees",
        Symbol("referral") => "https://app.pacifica.fi?referral=ccxt"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("info/fees") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("info/prices") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("kline") => Dict{Symbol, Any}(
    Symbol("cost") => 12
),
                Symbol("kline/mark") => Dict{Symbol, Any}(
    Symbol("cost") => 12
),
                Symbol("book") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("funding_rate/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("loan_pool") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/loan") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/settings") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("positions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trades/history") => Dict{Symbol, Any}(
    Symbol("cost") => 12
),
                Symbol("funding/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("portfolio") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/balance/history") => Dict{Symbol, Any}(
    Symbol("cost") => 12
),
                Symbol("account/spot_balance/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/spot_asset/deposit/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/spot_asset/withdraw/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/spot_asset/withdraw/pending") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/history") => Dict{Symbol, Any}(
    Symbol("cost") => 12
),
                Symbol("orders/history_by_id") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("spot_assets") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("spot_assets/bridge/info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("spot_assets/bridge/parameters/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("lake/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/builder_codes/approvals") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("account/leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/margin") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/withdraw") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/settings/auto_lend_disabled") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/settings/spot") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/spot_asset/withdraw") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/subaccount/create") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/subaccount/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/subaccount/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/subaccount/spot_asset/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("positions/add_isolated_margin") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/create") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/create_market") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/stop/create") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("positions/tpsl") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 0.5
),
                Symbol("orders/cancel_all") => Dict{Symbol, Any}(
    Symbol("cost") => 0.5
),
                Symbol("orders/stop/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 0.5
),
                Symbol("orders/edit") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/batch") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/builder_codes/approve") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/builder_codes/revoke") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("agent/bind") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/api_keys/create") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/api_keys/revoke") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/api_keys") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("lake/add_blacklist") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("lake/add_max_leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("lake/add_whitelist") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("lake/claim_manager") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("lake/claim_referral_code") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("lake/create") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("lake/deposit") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("lake/remove_blacklist") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("lake/remove_max_leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("lake/remove_whitelist") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("lake/update_deposit_cap") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("lake/withdraw") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("swap") => Dict{Symbol, Any}(
            Symbol("taker") => self.parseNumber("0.0004"),
            Symbol("maker") => self.parseNumber("0.00015")
        ),
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("taker") => self.parseNumber("0.0004"),
            Symbol("maker") => self.parseNumber("0.00015")
        )
    ),
    Symbol("requiredCredentials") => Dict{Symbol, Any}(
        Symbol("apiKey") => false,
        Symbol("secret") => false,
        Symbol("walletAddress") => false,
        Symbol("privateKey") => true
    ),
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("0") => ExchangeError,
            Symbol("1") => ExchangeError,
            Symbol("2") => ExchangeError,
            Symbol("3") => ExchangeError,
            Symbol("4") => InvalidOrder,
            Symbol("5") => InsufficientFunds,
            Symbol("6") => OrderNotFound,
            Symbol("7") => InvalidOrder,
            Symbol("8") => InvalidOrder,
            Symbol("9") => InsufficientFunds,
            Symbol("10") => InvalidOrder,
            Symbol("11") => ExchangeError,
            Symbol("12") => ExchangeError,
            Symbol("13") => ExchangeError,
            Symbol("14") => ExchangeError,
            Symbol("15") => BadRequest,
            Symbol("16") => InvalidOrder,
            Symbol("17") => InvalidOrder,
            Symbol("18") => InvalidOrder,
            Symbol("19") => InvalidOrder,
            Symbol("20") => InvalidOrder,
            Symbol("21") => InvalidOrder,
            Symbol("22") => InvalidOrder,
            Symbol("23") => InvalidOrder,
            Symbol("24") => ExchangeError,
            Symbol("25") => InvalidOrder,
            Symbol("26") => ExchangeError,
            Symbol("27") => ExchangeError,
            Symbol("28") => InvalidOrder,
            Symbol("29") => InvalidOrder,
            Symbol("30") => InvalidOrder,
            Symbol("31") => PermissionDenied,
            Symbol("32") => PermissionDenied,
            Symbol("33") => BadRequest,
            Symbol("34") => PermissionDenied,
            Symbol("35") => PermissionDenied,
            Symbol("36") => InvalidOrder,
            Symbol("37") => InvalidOrder,
            Symbol("38") => PermissionDenied,
            Symbol("39") => BadRequest,
            Symbol("40") => PermissionDenied,
            Symbol("41") => InvalidOrder,
            Symbol("42") => ExchangeError,
            Symbol("43") => InvalidOrder,
            Symbol("44") => InvalidOrder,
            Symbol("45") => InvalidOrder,
            Symbol("46") => InvalidOrder,
            Symbol("47") => OrderNotFound,
            Symbol("48") => InvalidOrder,
            Symbol("49") => InvalidOrder,
            Symbol("50") => BadRequest,
            Symbol("51") => NotSupported,
            Symbol("52") => InvalidOrder,
            Symbol("53") => InvalidOrder,
            Symbol("54") => ExchangeError,
            Symbol("55") => ExchangeError,
            Symbol("56") => ExchangeError,
            Symbol("59") => InvalidOrder,
            Symbol("61") => InsufficientFunds,
            Symbol("62") => InsufficientFunds,
            Symbol("63") => ExchangeError,
            Symbol("64") => BadRequest,
            Symbol("65") => InsufficientFunds,
            Symbol("66") => ExchangeError,
            Symbol("67") => ExchangeError,
            Symbol("68") => InvalidOrder,
            Symbol("69") => InvalidOrder,
            Symbol("70") => InsufficientFunds,
            Symbol("71") => ExchangeError,
            Symbol("72") => PermissionDenied,
            Symbol("73") => PermissionDenied,
            Symbol("74") => PermissionDenied,
            Symbol("75") => InvalidOrder,
            Symbol("76") => PermissionDenied,
            Symbol("77") => BadRequest,
            Symbol("78") => InsufficientFunds,
            Symbol("79") => ExchangeError,
            Symbol("80") => InvalidOrder,
            Symbol("81") => BadRequest,
            Symbol("82") => InvalidOrder,
            Symbol("83") => ExchangeNotAvailable,
            Symbol("84") => BadRequest,
            Symbol("85") => BadRequest,
            Symbol("86") => BadRequest,
            Symbol("87") => PermissionDenied,
            Symbol("88") => BadRequest,
            Symbol("89") => BadRequest,
            Symbol("90") => BadRequest,
            Symbol("91") => ExchangeError,
            Symbol("92") => ExchangeNotAvailable,
            Symbol("93") => BadRequest,
            Symbol("94") => InvalidOrder,
            Symbol("95") => ExchangeError,
            Symbol("96") => ExchangeError,
            Symbol("97") => ExchangeError,
            Symbol("99") => InvalidOrder,
            Symbol("100") => PermissionDenied,
            Symbol("101") => ExchangeNotAvailable,
            Symbol("102") => BadRequest,
            Symbol("103") => PermissionDenied,
            Symbol("104") => InvalidOrder,
            Symbol("105") => InvalidOrder,
            Symbol("106") => NotSupported,
            Symbol("107") => NotSupported,
            Symbol("108") => NotSupported,
            Symbol("109") => NotSupported,
            Symbol("110") => BadRequest,
            Symbol("111") => ExchangeNotAvailable,
            Symbol("112") => InvalidOrder,
            Symbol("113") => ExchangeError,
            Symbol("114") => ExchangeError,
            Symbol("115") => ExchangeError,
            Symbol("116") => ExchangeError,
            Symbol("117") => ExchangeError,
            Symbol("118") => ExchangeError,
            Symbol("119") => ExchangeNotAvailable,
            Symbol("120") => PermissionDenied,
            Symbol("121") => InvalidOrder,
            Symbol("400") => BadRequest,
            Symbol("401") => AuthenticationError,
            Symbol("402") => AuthenticationError,
            Symbol("403") => PermissionDenied,
            Symbol("404") => BadRequest,
            Symbol("409") => ExchangeError,
            Symbol("420") => ExchangeError,
            Symbol("422") => ExchangeError,
            Symbol("429") => RateLimitExceeded,
            Symbol("500") => ExchangeError,
            Symbol("503") => ExchangeNotAvailable,
            Symbol("504") => RequestTimeout
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("UNKNOWN") => ExchangeError,
            Symbol("ACCOUNT_NOT_FOUND") => ExchangeError,
            Symbol("BOOK_NOT_FOUND") => ExchangeError,
            Symbol("INVALID_TICK_LEVEL") => InvalidOrder,
            Symbol("INSUFFICIENT_BALANCE") => InsufficientFunds,
            Symbol("ORDER_NOT_FOUND") => OrderNotFound,
            Symbol("OVER_WITHDRAWAL") => InsufficientFunds,
            Symbol("INVALID_LEVERAGE") => ExchangeError,
            Symbol("CANNOT_UPDATE_MARGIN") => ExchangeError,
            Symbol("POSITION_NOT_FOUND") => ExchangeError,
            Symbol("POSITION_TPSL_LIMIT_EXCEEDED") => InvalidOrder
        )
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("commonCurrencies") => Dict{Symbol, Any}(),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("agentAddress") => nothing,
        Symbol("apiKey") => nothing,
        Symbol("builderCode") => "CCXT",
        Symbol("feeRate") => "0.01",
        Symbol("builderFee") => true,
        Symbol("batchOrdersMax") => 10,
        Symbol("defaultType") => "swap",
        Symbol("defaultSlippage") => "0.5",
        Symbol("expiryWindow") => 5000,
        Symbol("maxCostHugeWithApiKey") => 4,
        Symbol("marketHelperProps") => [],
        Symbol("defaultMarginMode") => "cross",
        Symbol("builderSupportOperations") => Dict{Symbol, Any}(
            Symbol("create_market_order") => true,
            Symbol("create_limit_order") => true,
            Symbol("create_stop_order") => true,
            Symbol("set_position_tpsl") => true
        )
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("default") => Dict{Symbol, Any}(
            Symbol("sandbox") => true,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("triggerPrice") => false,
                Symbol("triggerPriceType") => nothing,
                Symbol("triggerDirection") => false,
                Symbol("stopLossPrice") => false,
                Symbol("takeProfitPrice") => false,
                Symbol("attachedStopLossTakeProfit") => Dict{Symbol, Any}(
                    Symbol("triggerPriceType") => Dict{Symbol, Any}(
                        Symbol("last") => false,
                        Symbol("mark") => false,
                        Symbol("index") => false
                    ),
                    Symbol("triggerPrice") => true,
                    Symbol("type") => true,
                    Symbol("price") => true
                ),
                Symbol("timeInForce") => Dict{Symbol, Any}(
                    Symbol("IOC") => true,
                    Symbol("FOK") => false,
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
            Symbol("createOrders") => Dict{Symbol, Any}(
                Symbol("max") => 10
            ),
            Symbol("editOrder") => Dict{Symbol, Any}(
                Symbol("side") => false,
                Symbol("type") => false
            ),
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => nothing,
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
                Symbol("limit") => 3950
            ),
            Symbol("fetchLedger") => Dict{Symbol, Any}(
                Symbol("code") => false
            )
        ),
        Symbol("forPerps") => Dict{Symbol, Any}(
            Symbol("extends") => "default",
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("stopLossPrice") => true,
                Symbol("takeProfitPrice") => true,
                Symbol("attachedStopLossTakeProfit") => nothing
            )
        ),
        Symbol("spot") => nothing,
        Symbol("swap") => Dict{Symbol, Any}(
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("extends") => "forPerps"
            ),
            Symbol("inverse") => Dict{Symbol, Any}(
                Symbol("extends") => "forPerps"
            )
        ),
        Symbol("future") => Dict{Symbol, Any}(
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("extends") => "forPerps"
            ),
            Symbol("inverse") => Dict{Symbol, Any}(
                Symbol("extends") => "forPerps"
            )
        )
    )
))

end
function initializeClient(self::Pacifica, )
    try
        Base.fetch(self.handleBuilderFeeApproval());
    catch e
        return false

    end
    return true

end
function handleBuilderFeeApproval(self::Pacifica, )
    if functions.ccxtruthy(self.isSandboxModeEnabled)
            return false
    end
    buildFee = self.safeBool(self.options, "builderFee", true);
    if functions.ccxtruthy(!functions.ccxtruthy(buildFee))
            return false
    end
    approvedBuilderFee = self.safeBool(self.options, "approvedBuilderFee", false);
    if functions.ccxtruthy(approvedBuilderFee)
            return true
    end
    try
        builder = safeString(self.options, "builderCode", "CCXT");
        maxFeeRate = safeString(self.options, "feeRate", "0.01");
        Base.fetch(self.approveBuilderCode(builder, maxFeeRate));
        self.options[Symbol("approvedBuilderFee")] = true;
    catch e
        self.options[Symbol("builderFee")] = false;

    end
    return true

end
function fetchMarkets(self::Pacifica, params=Dict())
    response = Base.fetch(self.publicGetInfo(params));
    markets = self.safeList(response, "data", []);
    return self.parseMarkets(markets)

end
function fetchSwapMarkets(self::Pacifica, params=Dict())
    markets = Base.fetch(self.fetchMarkets(params));
    return filterBy(markets, "type", "swap")

end
function parseMarket(self::Pacifica, market)
    id = safeString(market, "symbol");
    baseId = safeString(market, "base_asset", id);
    instrumentType = safeString(market, "instrument_type");
    isSpot = (instrumentType == "spot");
    isSwap = !functions.ccxtruthy(isSpot);
    quoteId = "USDC";
    settleId = nothing;
    type_var = "spot";
    linear = nothing;
    inverse = nothing;
    contractSize = nothing;
    minLeverage = nothing;
    maxLeverage = nothing;
    crossMargin = nothing;
    isolatedMargin = nothing;
    if functions.ccxtruthy(id == nothing)
        throw(ExchangeError(string(self.id, " parseMarket() missing id")));
    end
    if functions.ccxtruthy(isSpot)
        idParts = split(id, "-");
        quoteId = safeString(idParts, 1, quoteId);
    end
    isolatedOnly = self.safeBool(market, "isolated_only", false);
    if functions.ccxtruthy(isSwap)
        settleId = quoteId;
        type_var = "swap";
        linear = true;
        inverse = false;
        contractSize = self.parseNumber("1");
        minLeverage = 1;
        maxLeverage = safeInteger(market, "max_leverage");
        crossMargin = !functions.ccxtruthy(isolatedOnly);
        isolatedMargin = true;
    end
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    settle = self.safeCurrencyCode(settleId);
    symbol = string(base, "/", quote_var);
    if functions.ccxtruthy(isSwap)
        symbol = string(symbol, ":", settle);
    end
    fees = self.safeDict(self.fees, type_var, Dict{Symbol, Any}());
    taker = self.safeNumber(fees, "taker");
    maker = self.safeNumber(fees, "maker");
    amountPrecision = self.safeNumber(market, "lot_size");
    pricePrecision = self.safeNumber(market, "tick_size");
    active = true;
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
    Symbol("spot") => isSpot,
    Symbol("margin") => false,
    Symbol("swap") => isSwap,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => active,
    Symbol("contract") => isSwap,
    Symbol("linear") => linear,
    Symbol("inverse") => inverse,
    Symbol("taker") => taker,
    Symbol("maker") => maker,
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
            Symbol("min") => minLeverage,
            Symbol("max") => maxLeverage
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "min_tick"),
            Symbol("max") => self.safeNumber(market, "max_tick")
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "min_order_size"),
            Symbol("max") => self.safeNumber(market, "max_order_size")
        )
    ),
    Symbol("created") => safeInteger(market, "created_at"),
    Symbol("marginModes") => Dict{Symbol, Any}(
        Symbol("cross") => crossMargin,
        Symbol("isolated") => isolatedMargin
    ),
    Symbol("info") => market
))

end
function fetchBalance(self::Pacifica, params=Dict())
    userAccount = nothing;
    (userAccount, params) = self.handleOriginAndSingleAddress("fetchBalance", params);
    request = Dict{Symbol, Any}(
        Symbol("account") => userAccount
    );
    response = Base.fetch(self.publicGetAccount(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    result = Dict{Symbol, Any}(
        Symbol("info") => data
    );
    result[Symbol("free")] = Dict{Symbol, Any}();
    result[Symbol("used")] = Dict{Symbol, Any}();
    result[Symbol("total")] = Dict{Symbol, Any}();
    totalBalance = self.safeNumber(data, "account_equity");
    usedMargin = self.safeNumber(data, "total_margin_used");
    freeBalance = self.safeNumber(data, "available_to_spend");
    result[Symbol("total")][Symbol("USDC")] = totalBalance;
    result[Symbol("used")][Symbol("USDC")] = usedMargin;
    result[Symbol("free")][Symbol("USDC")] = freeBalance;
    timestamp = safeInteger(data, "updated_at");
    result[Symbol("timestamp")] = timestamp;
    result[Symbol("datetime")] = self.iso8601(timestamp);
    return self.safeBalance(result)

end
function fetchLeverage(self::Pacifica, symbol, params=Dict())
    Base.fetch(self.loadAccountSettings());
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    userAccount = nothing;
    (userAccount, params) = self.handleOriginAndSingleAddress("fetchLeverage", params);
    cacheAddress = self.walletAddress;
    settings = nothing;
    if functions.ccxtruthy(userAccount == cacheAddress)
        settings = self.handleOption("fetchLeverage", "settings");
    else
        request = Dict{Symbol, Any}(
            Symbol("account") => userAccount
        );
        settings = Base.fetch(self.fetchAccountSettings(extend(request, params)));
    end
    setting = self.safeDict(settings, symbol);
    if functions.ccxtruthy(setting == nothing)
            return self.parseLeverageFromMarket(market)
    else
        return self.parseLeverageFromSetting(symbol, setting)
    end

end
function parseLeverageFromSetting(self::Pacifica, symbol, setting)
    isIsolated = self.safeBool(setting, "isolated", false);
    leverage = safeInteger(setting, "leverage");
    marginMode = functions.ccxtruthy(isIsolated) ? "isolated" : "cross";
    return Dict{Symbol, Any}(
    Symbol("info") => setting,
    Symbol("symbol") => symbol,
    Symbol("marginMode") => marginMode,
    Symbol("longLeverage") => leverage,
    Symbol("shortLeverage") => leverage
)

end
function parseLeverageFromMarket(self::Pacifica, market)
    marketLimits = self.safeDict(market, "limits", Dict{Symbol, Any}());
    leverageLimits = self.safeDict(marketLimits, "leverage", Dict{Symbol, Any}());
    return Dict{Symbol, Any}(
    Symbol("info") => market,
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("marginMode") => self.handleOption("fetchLeverage", "defaultMarginMode", "cross"),
    Symbol("longLeverage") => safeInteger(leverageLimits, "max"),
    Symbol("shortLeverage") => safeInteger(leverageLimits, "max")
)

end
function fetchAccountSettings(self::Pacifica, params=Dict())
    userAccount = nothing;
    (userAccount, params) = self.handleOriginAndSingleAddress("fetchAccountSettings", params);
    request = Dict{Symbol, Any}(
        Symbol("account") => userAccount
    );
    response = Base.fetch(self.publicGetAccountSettings(extend(request, params)));
    return self.parseAccountSettings(self.safeList(response, "data", []))

end
function loadAccountSettings(self::Pacifica, refresh=false, params=Dict())
    settings = self.handleOption("loadAccountSettings", "settings");
    if functions.ccxtruthy(@functions.ccxt_or((settings == nothing), (refresh)))
        self.options[Symbol("settings")] = self.createSafeDictionary();
        settings = Base.fetch(self.fetchAccountSettings(params));
        self.options[Symbol("settings")] = settings;
    end

end
function parseAccountSettings(self::Pacifica, settings)
    settingsLen = length(settings);
    if functions.ccxtruthy(settingsLen == 0)
            return Dict{Symbol, Any}()
    end
    settingsBySymbol = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(settings)))
        marketId = get(get(settings, i + 1, nothing), Symbol("symbol"), nothing);
        market = self.safeMarket(marketId);
        symbol = get(market, Symbol("symbol"), nothing);
        settingsBySymbol[Symbol(symbol)] = get(settings, i + 1, nothing);
        i += 1
    end
    return settingsBySymbol

end
function fetchMarginMode(self::Pacifica, symbol, params=Dict())
    Base.fetch(self.loadAccountSettings());
    userAccount = nothing;
    (userAccount, params) = self.handleOriginAndSingleAddress("fetchMarginMode", params);
    cacheAddress = self.walletAddress;
    settings = nothing;
    if functions.ccxtruthy(userAccount == cacheAddress)
        settings = self.handleOption("fetchMarginMode", "settings");
    else
        request = Dict{Symbol, Any}(
            Symbol("account") => userAccount
        );
        settings = Base.fetch(self.fetchAccountSettings(extend(request, params)));
    end
    setting = self.safeDict(settings, symbol);
    if functions.ccxtruthy(setting == nothing)
            return Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("marginMode") => self.handleOption("fetchMarginMode", "defaultMarginMode", "cross")
)
    else
        return self.parseMarginModeFromSetting(symbol, setting)
    end

end
function parseMarginModeFromSetting(self::Pacifica, symbol, setting)
    isIsolated = self.safeBool(setting, "isolated", false);
    marginMode = functions.ccxtruthy(isIsolated) ? "isolated" : "cross";
    return Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("marginMode") => marginMode,
    Symbol("info") => setting
)

end
function fetchOrderBook(self::Pacifica, symbol, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    aggLevel = nothing;
    (aggLevel, params) = self.handleOptionAndParams(params, "fetchOrderBook", "aggLevel", 1);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("agg_level") => aggLevel
    );
    response = Base.fetch(self.publicGetBook(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    levels = self.safeList(data, "l", []);
    result = Dict{Symbol, Any}(
        Symbol("bids") => self.safeList(levels, 0, []),
        Symbol("asks") => self.safeList(levels, 1, [])
    );
    timestamp = safeInteger(data, "t");
    return self.parseOrderBook(result, self.safeSymbol(nothing, market), timestamp, "bids", "asks", "p", "a")

end
function fetchFundingRates(self::Pacifica, symbols=nothing, params=Dict())
    response = Base.fetch(self.publicGetInfoPrices(params));
    result = self.safeList(response, "data", []);
    return self.parseFundingRates(result, symbols)

end
function parseFundingRate(self::Pacifica, info, market=nothing)
    marketId = safeString(info, "symbol");
    market = self.safeMarket(marketId, market);
    symbol = get(market, Symbol("symbol"), nothing);
    funding = self.safeNumber(info, "funding");
    markPx = self.safeNumber(info, "mark");
    oraclePx = self.safeNumber(info, "oracle");
    nextFundingRate = self.safeNumber(info, "next_funding");
    timestamp = safeInteger(info, "timestamp");
    fundingTimestamp = (floor(milliseconds() / 60 / 60 / 1000) + 1) * 60 * 60 * 1000;
    return Dict{Symbol, Any}(
    Symbol("info") => info,
    Symbol("symbol") => symbol,
    Symbol("markPrice") => markPx,
    Symbol("indexPrice") => oraclePx,
    Symbol("interestRate") => nothing,
    Symbol("estimatedSettlePrice") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("fundingRate") => funding,
    Symbol("fundingTimestamp") => fundingTimestamp,
    Symbol("fundingDatetime") => self.iso8601(fundingTimestamp),
    Symbol("nextFundingRate") => nextFundingRate,
    Symbol("nextFundingTimestamp") => nothing,
    Symbol("nextFundingDatetime") => nothing,
    Symbol("previousFundingRate") => nothing,
    Symbol("previousFundingTimestamp") => nothing,
    Symbol("previousFundingDatetime") => nothing,
    Symbol("interval") => "1h"
)

end
function fetchOHLCV(self::Pacifica, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(since == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOHLCV() requires a \"since\" argument")));
    end
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOHLCV() requires a \"symbol\" argument")));
    end
    defaultMaxLimit = 3950;
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOHLCV", "paginate", false);
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchOHLCV", symbol, since, limit, timeframe, params, defaultMaxLimit))
    end
    tf = safeString(self.timeframes, timeframe, timeframe);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("interval") => tf,
        Symbol("start_time") => since
    );
    (request, params) = self.handleUntilOption("end_time", request, params);
    nowMillis = milliseconds();
    until = safeInteger(request, "end_time");
    if functions.ccxtruthy(until == nothing)
        if functions.ccxtruthy(limit != nothing)
            until = since + (limit * (self.parseTimeframe(tf) * 1000)) - 1;
        end
        if functions.ccxtruthy(until == nothing)
            until = since + (defaultMaxLimit * (self.parseTimeframe(tf) * 1000)) - 1;
        end
        if functions.ccxtruthy(functions.ccxt_gt(until, nowMillis))
            until = nowMillis;
        end
        request[Symbol("end_time")] = until;
    end
    response = Base.fetch(self.publicGetKline(extend(request, params)));
    candles = self.safeList(response, "data", []);
    return self.parseOHLCVs(candles, market, timeframe, since, limit)

end
function parseOHLCV(self::Pacifica, ohlcv, market=nothing)
    return [safeInteger(ohlcv, "t"), self.safeNumber(ohlcv, "o"), self.safeNumber(ohlcv, "h"), self.safeNumber(ohlcv, "l"), self.safeNumber(ohlcv, "c"), self.safeNumber(ohlcv, "v")]

end
function fetchTrades(self::Pacifica, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetTrades(extend(request, params)));
    recentTrades = self.safeList(response, "data", []);
    return self.parseTrades(recentTrades, market, since, limit)

end
function fetchMyTrades(self::Pacifica, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchMyTrades", "paginate", false);
    userAddress = nothing;
    (userAddress, params) = self.handleOriginAndSingleAddress("fetchMyTrades", params);
    defaultLimit = 100;
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchMyTrades", symbol, since, limit, params, "next_cursor", "cursor", nothing, defaultLimit))
    end
    request = Dict{Symbol, Any}();
    (request, params) = self.handleUntilOption("end_time", request, params);
    request[Symbol("account")] = userAddress;
    if functions.ccxtruthy(symbol != nothing)
        request[Symbol("symbol")] = safeString(market, "id");
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_time")] = since;
    end
    response = Base.fetch(self.publicGetTradesHistory(extend(request, params)));
    data = self.addPaginationCursorToResult(response);
    return self.parseTrades(data, market, since, limit)

end
function parseTrade(self::Pacifica, trade, market=nothing)
    eventType = safeString(trade, "event_type");
    timestamp = safeInteger(trade, "created_at");
    price = safeString(trade, "price");
    amount = safeString(trade, "amount");
    symbol = self.safeSymbol(nothing, market);
    id = safeString(trade, "history_id");
    side = safeString(trade, "side");
    if functions.ccxtruthy(side == "open_long")
        side = "buy";
    elseif functions.ccxtruthy(side == "close_long")
        side = "sell";
    else
        if functions.ccxtruthy(side == "open_short")
            side = "sell";
        elseif functions.ccxtruthy(side == "close_short")
            side = "buy";
        end

    end
    fee = safeString(trade, "fee");
    orderId = safeString(trade, "order_id");
    takerOrMaker = nothing;
    if functions.ccxtruthy(eventType != nothing)
        takerOrMaker = functions.ccxtruthy((eventType == "fulfill_maker")) ? "maker" : "taker";
    end
    if functions.ccxtruthy(orderId == nothing)
        takerOrMaker = nothing;
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => symbol,
    Symbol("id") => id,
    Symbol("order") => orderId,
    Symbol("type") => nothing,
    Symbol("side") => side,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("price") => price,
    Symbol("amount") => amount,
    Symbol("cost") => nothing,
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("cost") => fee,
        Symbol("currency") => "USDC",
        Symbol("rate") => nothing
    )
), market)

end
function createOrder(self::Pacifica, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.initializeClient());
    (request, operationType) = self.createOrderRequest(symbol, type_var, side, amount, price, params);
    params = omit(params, ["reduceOnly", "clientOrderId", "stopLimitPrice", "timeInForce", "triggerPrice", "stopLossCloid", "stopLossPrice", "stopLossLimitPrice", "takeProfitCloid", "takeProfitPrice", "takeProfitLimitPrice", "expiryWindow"]);
    response = nothing;
    if functions.ccxtruthy(operationType == "create_market_order")
        response = Base.fetch(self.privatePostOrdersCreateMarket(extend(request, params)));
    elseif functions.ccxtruthy(operationType == "create_stop_order")
        response = Base.fetch(self.privatePostOrdersStopCreate(extend(request, params)));
    else
        if functions.ccxtruthy(operationType == "set_position_tpsl")
            response = Base.fetch(self.privatePostPositionsTpsl(extend(request, params)));
        else
            response = Base.fetch(self.privatePostOrdersCreate(extend(request, params)));
        end

    end
    success = self.safeBool(response, "success", false);
    status = nothing;
    if functions.ccxtruthy(!functions.ccxtruthy(success))
        status = "rejected";
    else
        status = "open";
    end
    order = self.safeDict(response, "data", Dict{Symbol, Any}());
    orderId = safeString(order, "order_id");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => orderId,
    Symbol("status") => status,
    Symbol("info") => response,
    Symbol("symbol") => symbol
))

end
function createOrderRequest(self::Pacifica, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(type_var == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a type argument")));
    end
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a side argument")));
    end
    market = self.market(symbol);
    sigPayload = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("side") => self.mapSide(side)
    );
    operationType = nothing;
    reduceOnly = self.safeBool2(params, "reduceOnly", "reduce_only", false);
    orderType = uppercase(type_var);
    triggerPrice = safeString(params, "triggerPrice");
    stopLossPrice = safeString(params, "stopLossPrice");
    takeProfitPrice = safeString(params, "takeProfitPrice");
    tifRaw = safeStringUpper(params, "timeInForce");
    isMarket = orderType == "MARKET";
    isTakeProfitOrder = (takeProfitPrice != nothing);
    isStopLossOrder = (stopLossPrice != nothing);
    isStopOrder = (triggerPrice != nothing);
    timeInForce = self.mapTimeInForce(tifRaw);
    if functions.ccxtruthy(isMarket)
        operationType = "create_market_order";
        sigPayload[Symbol("reduce_only")] = reduceOnly;
        defaultSlippage = self.handleOption("createOrder", "defaultSlippage", "0.5");
        slippage = safeString2(params, "slippage", "slippage_percent", defaultSlippage);
        sigPayload[Symbol("slippage_percent")] = slippage;
    elseif functions.ccxtruthy(@functions.ccxt_and((@functions.ccxt_or(isTakeProfitOrder, isStopLossOrder)), (price == nothing)))
        operationType = "set_position_tpsl";
    else
        if functions.ccxtruthy(isStopOrder)
            operationType = "create_stop_order";
            sigPayload[Symbol("reduce_only")] = reduceOnly;
            stopClientOrderId = safeString(params, "clientOrderId");
            params = omit(params, ["clientOrderId"]);
            stopPayload = Dict{Symbol, Any}(
                Symbol("amount") => self.amountToPrecision(symbol, amount),
                Symbol("stop_price") => self.priceToPrecision(symbol, triggerPrice)
            );
            if functions.ccxtruthy(stopClientOrderId != nothing)
                stopPayload[Symbol("client_order_id")] = stopClientOrderId;
            end
            if functions.ccxtruthy(price != nothing)
                stopPayload[Symbol("limit_price")] = self.priceToPrecision(symbol, price);
            end
            sigPayload[Symbol("stop_order")] = stopPayload;
        else
            operationType = "create_order";
            sigPayload[Symbol("reduce_only")] = reduceOnly;
            if functions.ccxtruthy(timeInForce == nothing)
                sigPayload[Symbol("tif")] = "GTC";
            else
                sigPayload[Symbol("tif")] = timeInForce;
            end
        end

    end
    if functions.ccxtruthy(isTakeProfitOrder)
        tpPayload = Dict{Symbol, Any}(
            Symbol("stop_price") => self.priceToPrecision(symbol, takeProfitPrice)
        );
        if functions.ccxtruthy(price != nothing)
            tpPayload[Symbol("limit_price")] = self.priceToPrecision(symbol, price);
        end
        sigPayload[Symbol("take_profit")] = tpPayload;
    end
    if functions.ccxtruthy(isStopLossOrder)
        slPayload = Dict{Symbol, Any}(
            Symbol("stop_price") => self.priceToPrecision(symbol, stopLossPrice)
        );
        if functions.ccxtruthy(price != nothing)
            slPayload[Symbol("limit_price")] = self.priceToPrecision(symbol, price);
        end
        sigPayload[Symbol("stop_loss")] = slPayload;
    end
    if functions.ccxtruthy(@functions.ccxt_and(price != nothing, operationType == "create_order"))
        sigPayload[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    if functions.ccxtruthy(@functions.ccxt_and(amount != nothing, (@functions.ccxt_and(operationType != "create_stop_order", operationType != "set_position_tpsl"))))
        sigPayload[Symbol("amount")] = self.amountToPrecision(symbol, amount);
    end
    clientOrderId = safeString(params, "clientOrderId");
    if functions.ccxtruthy(clientOrderId != nothing)
        sigPayload[Symbol("client_order_id")] = clientOrderId;
    end
    request = self.postActionRequest(operationType, sigPayload, params);
    return [request, operationType]

end
function batchOrdersRequest(self::Pacifica, actions)
    lenActions = length(actions);
    maxLen = self.handleOption("batchOrdersRequest", "batchOrdersMax");
    if functions.ccxtruthy(maxLen != nothing)
        if functions.ccxtruthy(functions.ccxt_gt(lenActions, maxLen))
            throw(ExchangeError(string(self.id, " batchOrdersRequest() too many orders to create/cancel. Limit is ", maxLen)));
        end
    end
    return Dict{Symbol, Any}(
    Symbol("actions") => actions
)

end
function createOrdersRequest(self::Pacifica, orders, params=Dict())
    actions = [];
    timestamp = milliseconds();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        order = get(orders, i + 1, nothing);
        symbol = safeString(order, "symbol");
        side = safeString(order, "side");
        price = safeString(order, "price");
        type_var = safeString(order, "type", "limit");
        orderParams = self.safeDict(order, "params", Dict{Symbol, Any}());
        orderParams[Symbol("timestamp")] = timestamp;
        amount = safeString(order, "amount");
        amountNumber = self.parseNumber(amount);
        priceNumber = self.parseNumber(price);
        if functions.ccxtruthy(type_var != "limit")
            throw(NotSupported(string(self.id, " createOrders() supports only type = \"limit\"! Your value type=", type_var)));
        end
        requestList = self.createOrderRequest(symbol, type_var, side, amountNumber, priceNumber, orderParams);
        action = Dict{Symbol, Any}(
            Symbol("type") => "Create",
            Symbol("data") => get(requestList, 1, nothing)
        );
        push!(actions, action);
        i += 1
    end
    return self.batchOrdersRequest(actions)

end
function createOrders(self::Pacifica, orders, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.initializeClient());
    request = self.createOrdersRequest(orders);
    response = Base.fetch(self.privatePostOrdersBatch(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    results = self.safeList(data, "results", []);
    ordersToReturn = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(results)))
        order = get(results, i + 1, nothing);
        error = safeString(order, "error");
        success = self.safeBool(order, "success", false);
        status = nothing;
        if functions.ccxtruthy(@functions.ccxt_or((error != nothing), (!functions.ccxtruthy(success))))
            status = "rejected";
        else
            status = "open";
        end
        orderId = safeString(order, "order_id");
        push!(ordersToReturn, self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => orderId,
    Symbol("status") => status
)));
        i += 1
    end
    return ordersToReturn

end
function cancelOrders(self::Pacifica, ids, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.initializeClient());
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrders() requires a \"symbol\" argument!")));
    end
    request = self.cancelOrdersRequest(ids, symbol, params);
    params = omit(params, ["expiryWindow", "clientOrderIds"]);
    response = Base.fetch(self.privatePostOrdersBatch(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    results = self.safeList(data, "results", []);
    ordersToReturn = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(results)))
        order = get(results, i + 1, nothing);
        error = safeString(order, "error");
        success = self.safeBool(order, "success", false);
        status = nothing;
        if functions.ccxtruthy(@functions.ccxt_or((error != nothing), (!functions.ccxtruthy(success))))
            status = "closed";
        else
            status = "canceled";
        end
        push!(ordersToReturn, self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("status") => status,
    Symbol("symbol") => symbol
)));
        i += 1
    end
    return ordersToReturn

end
function cancelOrdersRequest(self::Pacifica, ids, symbol=nothing, params=Dict())
    actions = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(ids)))
        id = get(ids, i + 1, nothing);
        request = self.cancelOrderRequest(id, symbol, params);
        action = Dict{Symbol, Any}(
            Symbol("type") => "Cancel",
            Symbol("data") => request
        );
        push!(actions, action);
        i += 1
    end
    clientOrderIds = self.safeList(params, "clientOrderIds", []);
    params = omit(params, "clientOrderIds");
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(clientOrderIds)))
        cloid = get(clientOrderIds, i + 1, nothing);
        cloidParams = Dict{Symbol, Any}(
            Symbol("clientOrderId") => cloid
        );
        request = self.cancelOrderRequest(cloid, symbol, extend(cloidParams, params));
        action = Dict{Symbol, Any}(
            Symbol("type") => "Cancel",
            Symbol("data") => request
        );
        push!(actions, action);
        i += 1
    end
    return self.batchOrdersRequest(actions)

end
function cancelAllOrders(self::Pacifica, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.initializeClient());
    request = self.cancelAllOrdersRequest(symbol, params);
    params = omit(params, ["excludeReduceOnly", "expiryWindow"]);
    response = Base.fetch(self.privatePostOrdersCancelAll(extend(request, params)));
    return [self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response
))]

end
function cancelAllOrdersRequest(self::Pacifica, symbol, params=Dict())
    operationType = "cancel_all_orders";
    sigPayload = Dict{Symbol, Any}();
    excludeReduceOnly = self.safeBool(params, "excludeReduceOnly", false);
    sigPayload[Symbol("exclude_reduce_only")] = excludeReduceOnly;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        sigPayload[Symbol("all_symbols")] = false;
        sigPayload[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    else
        sigPayload[Symbol("all_symbols")] = true;
    end
    request = self.postActionRequest(operationType, sigPayload, params);
    return request

end
function cancelOrder(self::Pacifica, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.initializeClient());
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a symbol argument")));
    end
    request = self.cancelOrderRequest(id, symbol, params);
    isStopOrder = self.safeBool2(params, "trigger", "stop", false);
    params = omit(params, ["expiryWindow", "trigger", "stop", "clientOrderId"]);
    response = nothing;
    if functions.ccxtruthy(isStopOrder)
        response = Base.fetch(self.privatePostOrdersStopCancel(extend(request, params)));
    else
        response = Base.fetch(self.privatePostOrdersCancel(extend(request, params)));
    end
    success = self.safeBool(response, "success", false);
    status = functions.ccxtruthy(success) ? "canceled" : "closed";
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("status") => status,
    Symbol("info") => response,
    Symbol("symbol") => symbol
))

end
function cancelOrderRequest(self::Pacifica, id, symbol=nothing, params=Dict())
    market = self.market(symbol);
    isStopOrder = self.safeBool2(params, "trigger", "stop", false);
    operationType = nothing;
    if functions.ccxtruthy(isStopOrder)
        operationType = "cancel_stop_order";
    else
        operationType = "cancel_order";
    end
    clientOrderId = safeString(params, "clientOrderId");
    sigPayload = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(clientOrderId != nothing)
        sigPayload[Symbol("client_order_id")] = clientOrderId;
    else
        sigPayload[Symbol("order_id")] = self.parseToInt(id);
    end
    request = self.postActionRequest(operationType, sigPayload, params);
    return request

end
function editOrder(self::Pacifica, id, symbol, type_var, side, amount=nothing, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.initializeClient());
    market = self.market(symbol);
    request = self.editOrderRequest(id, symbol, type_var, side, amount, price, market, params);
    params = omit(params, ["expiryWindow", "clientOrderId"]);
    response = Base.fetch(self.privatePostOrdersEdit(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    orderId = safeString(data, "order_id");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => orderId,
    Symbol("info") => response,
    Symbol("symbol") => symbol
))

end
function editOrderRequest(self::Pacifica, id, symbol, type_var, side, amount, price, market, params=Dict())
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a side argument")));
    end
    if functions.ccxtruthy(amount == nothing)
        throw(ArgumentsRequired(string(self.id, " editOrder() requires an amount!")));
    end
    if functions.ccxtruthy(price == nothing)
        throw(ArgumentsRequired(string(self.id, " editOrder() requires a price")));
    end
    operationType = "edit_order";
    clientOrderId = safeString(params, "clientOrderId");
    priceNormalized = self.priceToPrecision(symbol, price);
    amountNormalized = self.amountToPrecision(symbol, amount);
    sigPayload = Dict{Symbol, Any}(
        Symbol("symbol") => safeString(market, "id"),
        Symbol("price") => priceNormalized,
        Symbol("amount") => amountNormalized
    );
    if functions.ccxtruthy(@functions.ccxt_and((clientOrderId == nothing), (id == nothing)))
        throw(ArgumentsRequired(string("this.id", "editOrder() requires either \"id\" or \"clientOrderId\"")));
    end
    if functions.ccxtruthy(clientOrderId != nothing)
        sigPayload[Symbol("client_order_id")] = clientOrderId;
    else
        sigPayload[Symbol("order_id")] = self.parseToInt(id);
    end
    request = self.postActionRequest(operationType, sigPayload, params);
    return request

end
function fetchFundingRateHistory(self::Pacifica, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchFundingRateHistory() requires a symbol argument")));
    end
    market = self.market(symbol);
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchFundingRateHistory", "paginate", false);
    defaultLimit = 100;
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchFundingRateHistory", symbol, since, limit, params, "next_cursor", "cursor", nothing, defaultLimit))
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.publicGetFundingRateHistory(extend(request, params)));
    data = self.addPaginationCursorToResult(response);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        entry = get(data, i + 1, nothing);
        timestamp = safeInteger(entry, "created_at");
        push!(result, Dict{Symbol, Any}(
    Symbol("info") => entry,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("fundingRate") => self.safeNumber(entry, "funding_rate"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
));
        i += 1
    end
    sorted = sortBy(result, "timestamp");
    return self.filterBySinceLimit(sorted, since, limit, "timestamp")

end
function fetchTickers(self::Pacifica, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols);
    response = Base.fetch(self.publicGetInfoPrices(params));
    data = self.safeList(response, "data", []);
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        info = get(data, i + 1, nothing);
        ticker = self.parseTicker(info);
        symbol = safeString(ticker, "symbol");
        if functions.ccxtruthy(symbol != nothing)
            result[Symbol(symbol)] = ticker;
        end
        i += 1
    end
    return self.filterByArrayTickers(result, "symbol", symbols)

end
function parseTicker(self::Pacifica, ticker, market=nothing)
    marketId = safeString(ticker, "symbol");
    market = self.safeMarket(marketId, market);
    symbol = get(market, Symbol("symbol"), nothing);
    timestamp = safeInteger(ticker, "timestamp");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("previousClose") => self.safeNumber(ticker, "yesterday_price"),
    Symbol("close") => self.safeNumber(ticker, "mid"),
    Symbol("bid") => nothing,
    Symbol("ask") => nothing,
    Symbol("quoteVolume") => self.safeNumber(ticker, "volume_24h"),
    Symbol("info") => ticker
), market)

end
function fetchClosedOrders(self::Pacifica, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    orders = Base.fetch(self.fetchOrders(symbol, nothing, nothing, params));
    closedOrders = self.filterByArray(orders, "status", ["closed"], false);
    return self.filterBySymbolSinceLimit(closedOrders, symbol, since, limit)

end
function fetchCanceledOrders(self::Pacifica, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    orders = Base.fetch(self.fetchOrders(symbol, nothing, nothing, params));
    closedOrders = self.filterByArray(orders, "status", ["canceled"], false);
    return self.filterBySymbolSinceLimit(closedOrders, symbol, since, limit)

end
function fetchCanceledAndClosedOrders(self::Pacifica, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    orders = Base.fetch(self.fetchOrders(symbol, nothing, nothing, params));
    closedOrders = self.filterByArray(orders, "status", ["canceled", "closed", "rejected"], false);
    return self.filterBySymbolSinceLimit(closedOrders, symbol, since, limit)

end
function fetchOpenOrders(self::Pacifica, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    userAddress = nothing;
    (userAddress, params) = self.handleOriginAndSingleAddress("fetchOpenOrders", params);
    request = Dict{Symbol, Any}(
        Symbol("account") => userAddress
    );
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    response = Base.fetch(self.publicGetOrders(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseOrders(data, market, since, limit)

end
function fetchOrders(self::Pacifica, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOrders", "paginate", false);
    defaultLimit = 100;
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchOrders", symbol, since, limit, params, "next_cursor", "cursor", nothing, defaultLimit))
    end
    userAddress = nothing;
    (userAddress, params) = self.handleOriginAndSingleAddress("fetchOrders", params);
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    request = Dict{Symbol, Any}(
        Symbol("account") => userAddress
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.publicGetOrdersHistory(extend(request, params)));
    data = self.addPaginationCursorToResult(response);
    orders = self.parseOrders(data, market, since, limit);
    return orders

end
function addPaginationCursorToResult(self::Pacifica, response)
    data = self.safeList(response, "data", []);
    paginationCursor = safeString(response, "next_cursor");
    hasMore = self.safeBool(response, "has_more", false);
    dataLength = length(data);
    if functions.ccxtruthy(hasMore)
        if functions.ccxtruthy(@functions.ccxt_and((paginationCursor != nothing), (functions.ccxt_gt(dataLength, 0))))
            first_var = get(data, 1, nothing);
            first_var[Symbol("next_cursor")] = paginationCursor;
            first_var[Symbol("has_more")] = hasMore;
            data[1] = first_var;
        end
    end
    return data

end
function fetchOrder(self::Pacifica, id, symbol=nothing, params=Dict())
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
    response = Base.fetch(self.publicGetOrdersHistoryById(extend(request, params)));
    data = self.safeList(response, "data", []);
    sorted = sortBy(data, "created_at");
    lastIdx = length(sorted);
    lastInfo = Dict{Symbol, Any}();
    if functions.ccxtruthy(functions.ccxt_gt(lastIdx, 0))
        lastInfo = get(sorted, 1, nothing);
    end
    return self.parseOrder(lastInfo, market)

end
function parseOrderStatus(self::Pacifica, status)
    statuses = Dict{Symbol, Any}(
        Symbol("open") => "open",
        Symbol("partially_filled") => "open",
        Symbol("filled") => "closed",
        Symbol("cancelled") => "canceled",
        Symbol("rejected") => "failed"
    );
    return safeString(statuses, status, status)

end
function mapTimeInForce(self::Pacifica, tifRaw)
    tifMap = Dict{Symbol, Any}(
        Symbol("GTC") => "GTC",
        Symbol("IOC") => "IOC",
        Symbol("PO") => "ALO",
        Symbol("POST_ONLY") => "ALO",
        Symbol("PO_TOB") => "TOB",
        Symbol("TOB") => "TOB",
        Symbol("ALO") => "ALO"
    );
    tif = nothing;
    if functions.ccxtruthy(tifRaw != nothing)
        tif = uppercase(tifRaw);
    end
    return safeString(tifMap, tif)

end
function mapSide(self::Pacifica, sideRaw)
    sideMap = Dict{Symbol, Any}(
        Symbol("sell") => "ask",
        Symbol("buy") => "bid"
    );
    return safeString(sideMap, sideRaw, sideRaw)

end
function parseOrderType(self::Pacifica, status)
    statuses = Dict{Symbol, Any}(
        Symbol("stop_limit") => "limit",
        Symbol("stop_market") => "market",
        Symbol("take_profit_limit") => "limit",
        Symbol("stop_loss_limit") => "limit",
        Symbol("take_profit_market") => "market",
        Symbol("stop_loss_market") => "market"
    );
    return safeString(statuses, status, status)

end
function parseOrder(self::Pacifica, order, market=nothing)
    marketId = safeString2(order, "symbol", "s");
    symbol = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.safeMarket(marketId, market);
        symbol = get(market, Symbol("symbol"), nothing);
    end
    timestamp = safeInteger2(order, "created_at", "ct");
    status = safeString2(order, "order_status", "os", "open");
    side = safeString(order, "side", "d");
    if functions.ccxtruthy(side != nothing)
        side = functions.ccxtruthy((side == "bid")) ? "buy" : "sell";
    end
    totalAmount = safeString2(order, "initial_amount", "a");
    filledAmount = safeString2(order, "filled_amount", "f");
    remaining = stringSub(totalAmount, filledAmount);
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => safeString2(order, "order_id", "i"),
    Symbol("clientOrderId") => safeString2(order, "client_order_id", "I"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("lastUpdateTimestamp") => safeInteger2(order, "updated_at", "ut"),
    Symbol("symbol") => symbol,
    Symbol("type") => self.parseOrderType(safeStringLower2(order, "order_type", "ot")),
    Symbol("timeInForce") => nothing,
    Symbol("postOnly") => nothing,
    Symbol("reduceOnly") => self.safeBool2(order, "reduce_only", "r"),
    Symbol("side") => side,
    Symbol("price") => safeString2(order, "price", "lp"),
    Symbol("triggerPrice") => self.safeNumber2(order, "stop_price", "sp"),
    Symbol("amount") => totalAmount,
    Symbol("cost") => nothing,
    Symbol("average") => safeString2(order, "average_filled_price", "p"),
    Symbol("filled") => filledAmount,
    Symbol("remaining") => remaining,
    Symbol("status") => self.parseOrderStatus(status),
    Symbol("fee") => nothing,
    Symbol("trades") => nothing
), market)

end
function fetchPosition(self::Pacifica, symbol, params=Dict())
    positions = Base.fetch(self.fetchPositions([symbol], params));
    return self.safeDict(positions, 0, Dict{Symbol, Any}())

end
function fetchPositions(self::Pacifica, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    userAddress = nothing;
    (userAddress, params) = self.handleOriginAndSingleAddress("fetchPositions", params);
    symbols = self.marketSymbols(symbols);
    request = Dict{Symbol, Any}(
        Symbol("account") => userAddress
    );
    response = Base.fetch(self.publicGetPositions(extend(request, params)));
    data = self.safeList(response, "data", []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        push!(result, self.parsePosition(get(data, i + 1, nothing), nothing));
        i += 1
    end
    return self.filterByArrayPositions(result, "symbol", symbols, false)

end
function parsePosition(self::Pacifica, position, market=nothing)
    marketId = safeString(position, "symbol");
    market = self.safeMarket(marketId, market);
    symbol = get(market, Symbol("symbol"), nothing);
    margin = safeString(position, "margin");
    marginMode = functions.ccxtruthy((@functions.ccxt_and(margin != nothing, margin != "0"))) ? "isolated" : "cross";
    isIsolated = (marginMode == "isolated");
    side = safeString(position, "side");
    if functions.ccxtruthy(side != nothing)
        side = functions.ccxtruthy((side == "bid")) ? "long" : "short";
    end
    createdAt = safeInteger(position, "created_at");
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => nothing,
    Symbol("symbol") => symbol,
    Symbol("timestamp") => createdAt,
    Symbol("datetime") => self.iso8601(createdAt),
    Symbol("isolated") => isIsolated,
    Symbol("hedged") => nothing,
    Symbol("side") => side,
    Symbol("contracts") => self.safeNumber(position, "amount"),
    Symbol("contractSize") => nothing,
    Symbol("entryPrice") => self.safeNumber(position, "entry_price"),
    Symbol("markPrice") => nothing,
    Symbol("notional") => nothing,
    Symbol("leverage") => nothing,
    Symbol("collateral") => margin,
    Symbol("initialMargin") => nothing,
    Symbol("maintenanceMargin") => nothing,
    Symbol("initialMarginPercentage") => nothing,
    Symbol("maintenanceMarginPercentage") => nothing,
    Symbol("unrealizedPnl") => nothing,
    Symbol("liquidationPrice") => nothing,
    Symbol("marginMode") => marginMode,
    Symbol("percentage") => nothing
))

end
function setMarginMode(self::Pacifica, marginMode, symbol=nothing, params=Dict())
    operationType = "update_margin_mode";
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setMarginMode() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    isIsolated = (marginMode == "isolated");
    sigPayload = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("is_isolated") => isIsolated
    );
    request = self.postActionRequest(operationType, sigPayload, params);
    params = omit(params, ["expiryWindow"]);
    response = Base.fetch(self.privatePostAccountMargin(request));
    return response

end
function setLeverage(self::Pacifica, leverage, symbol=nothing, params=Dict())
    operationType = "update_leverage";
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setMarginMode() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    sigPayload = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("leverage") => leverage
    );
    request = self.postActionRequest(operationType, sigPayload, params);
    params = omit(params, ["expiryWindow"]);
    response = Base.fetch(self.privatePostAccountLeverage(request));
    return response

end
function withdraw(self::Pacifica, code, amount, address, tag=nothing, params=Dict())
    operationType = "withdraw";
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    self.checkAddress(address);
    sigPayload = Dict{Symbol, Any}(
        Symbol("amount") => string(amount)
    );
    request = self.postActionRequest(operationType, sigPayload, params);
    params = omit(params, ["expiryWindow"]);
    response = Base.fetch(self.privatePostAccountWithdraw(extend(request, params)));
    return Dict{Symbol, Any}(
    Symbol("info") => response
)

end
function fetchTradingFee(self::Pacifica, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    userAddress = nothing;
    (userAddress, params) = self.handleOriginAndSingleAddress("fetchTradingFee", params);
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("account") => userAddress
    );
    response = Base.fetch(self.publicGetAccount(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseTradingFee(data, market)

end
function parseTradingFee(self::Pacifica, fee, market=nothing)
    symbol = self.safeSymbol(nothing, market);
    return Dict{Symbol, Any}(
    Symbol("info") => fee,
    Symbol("symbol") => symbol,
    Symbol("maker") => self.safeNumber(fee, "maker_fee"),
    Symbol("taker") => self.safeNumber(fee, "taker_fee"),
    Symbol("percentage") => nothing,
    Symbol("tierBased") => nothing
)

end
function fetchOpenInterests(self::Pacifica, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols);
    swapMarkets = Base.fetch(self.fetchSwapMarkets());
    return self.parseOpenInterests(swapMarkets, symbols)

end
function fetchOpenInterest(self::Pacifica, symbol, params=Dict())
    symbol = self.symbol(symbol);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    ois = Base.fetch(self.fetchOpenInterests([symbol], params));
    return get(ois, Symbol(symbol), nothing)

end
function parseOpenInterest(self::Pacifica, interest, market=nothing)
    marketId = safeString(interest, "symbol");
    symbol = nothing;
    if functions.ccxtruthy(marketId != nothing)
        market = self.safeMarket(marketId, market);
        symbol = get(market, Symbol("symbol"), nothing);
    end
    interestValue = nothing;
    markPrice = safeString(interest, "mark");
    openInterest = safeString(interest, "open_interest");
    if functions.ccxtruthy(@functions.ccxt_and((openInterest != nothing), (markPrice != nothing)))
        interestValue = stringMul(openInterest, markPrice);
    end
    timestamp = safeInteger(interest, "timestamp");
    return self.safeOpenInterest(Dict{Symbol, Any}(
    Symbol("symbol") => self.safeSymbol(symbol),
    Symbol("openInterestAmount") => self.parseNumber(openInterest),
    Symbol("openInterestValue") => self.parseNumber(interestValue),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("info") => interest
), market)

end
function fetchLedger(self::Pacifica, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchLedger", "paginate", false);
    userAddress = nothing;
    (userAddress, params) = self.handleOriginAndSingleAddress("fetchLedger", params);
    defaultLimit = 100;
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchLedger", code, since, limit, params, "next_cursor", "cursor", nothing, defaultLimit))
    end
    request = Dict{Symbol, Any}(
        Symbol("account") => userAddress
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.publicGetAccountBalanceHistory(extend(request, params)));
    data = self.addPaginationCursorToResult(response);
    return self.parseLedger(data, nothing, since, limit)

end
function parseLedgerEntry(self::Pacifica, item, currency=nothing)
    timestamp = safeInteger(item, "created_at");
    type_var = safeString(item, "event_type");
    amount = safeString(item, "amount");
    balance = safeString(item, "balance");
    return self.safeLedgerEntry(Dict{Symbol, Any}(
    Symbol("info") => item,
    Symbol("id") => nothing,
    Symbol("direction") => nothing,
    Symbol("account") => nothing,
    Symbol("referenceAccount") => nothing,
    Symbol("referenceId") => nothing,
    Symbol("type") => self.parseLedgerEntryType(type_var),
    Symbol("currency") => nothing,
    Symbol("amount") => self.parseNumber(amount),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("before") => nothing,
    Symbol("after") => self.parseNumber(balance),
    Symbol("status") => nothing,
    Symbol("fee") => nothing
), currency)

end
function parseLedgerEntryType(self::Pacifica, type_var)
    ledgerType = Dict{Symbol, Any}(
        Symbol("subaccount_transfer") => "transfer",
        Symbol("deposit") => "transaction",
        Symbol("deposit_release") => "transaction",
        Symbol("withdraw") => "transaction",
        Symbol("trade") => "trade",
        Symbol("market_liquidation") => "trade",
        Symbol("backstop_liquidation") => "trade",
        Symbol("adl_liquidation") => "trade",
        Symbol("funding") => "funding",
        Symbol("fee") => "fee",
        Symbol("rebate") => "rebate",
        Symbol("cashback") => "cashback",
        Symbol("referral") => "referral",
        Symbol("airdrop") => "airdrop",
        Symbol("payout") => "payout"
    );
    return safeString(ledgerType, type_var, type_var)

end
function fetchFundingHistory(self::Pacifica, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchFundingHistory", "paginate", false);
    userAddress = nothing;
    (userAddress, params) = self.handleOriginAndSingleAddress("fetchFundingHistory", params);
    request = Dict{Symbol, Any}(
        Symbol("account") => userAddress
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    defaultLimit = 100;
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchFundingHistory", symbol, since, limit, params, "next_cursor", "cursor", nothing, defaultLimit))
    end
    response = Base.fetch(self.publicGetFundingHistory(extend(request, params)));
    data = self.addPaginationCursorToResult(response);
    return self.parseIncomes(data, market, since, limit)

end
function parseIncome(self::Pacifica, income, market=nothing)
    id = safeString(income, "history_id");
    timestamp = safeInteger(income, "created_at");
    marketId = safeString(income, "symbol");
    market = self.safeMarket(marketId, market);
    symbol = get(market, Symbol("symbol"), nothing);
    amount = safeString(income, "amount");
    code = self.safeCurrencyCode("USDC");
    rate = self.safeNumber(income, "rate");
    return Dict{Symbol, Any}(
    Symbol("info") => income,
    Symbol("symbol") => symbol,
    Symbol("code") => code,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("id") => id,
    Symbol("amount") => self.parseNumber(amount),
    Symbol("rate") => rate
)

end
function transfer(self::Pacifica, code, amount, fromAccount, toAccount, params=Dict())
    operationType = "transfer_funds";
    sigPayload = Dict{Symbol, Any}(
        Symbol("to_account") => toAccount,
        Symbol("amount") => amount
    );
    request = self.postActionRequest(operationType, sigPayload, params);
    params = omit(params, ["expiryWindow"]);
    response = self.privatePostAccountSubaccountTransfer(extend(request, params));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseTransfer(data)

end
function parseTransfer(self::Pacifica, transfer, currency=nothing)
    return Dict{Symbol, Any}(
    Symbol("info") => transfer,
    Symbol("id") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("currency") => nothing,
    Symbol("amount") => nothing,
    Symbol("fromAccount") => nothing,
    Symbol("toAccount") => nothing,
    Symbol("status") => "ok"
)

end
function createSubAccount(self::Pacifica, name, params=Dict())
    finalHeaders = Dict{Symbol, Any}();
    agentAddress = nothing;
    (agentAddress, params) = self.handleOption("createSubAccount", "agentAddress");
    originAddress = nothing;
    (originAddress, params) = self.handleOriginAndSingleAddress("createSubAccount", params);
    if functions.ccxtruthy(originAddress == nothing)
        throw(ArgumentsRequired(string(self.id, " createSubAccount() requires \"originAddress\" in params or \"walletAddress\" in requiredCredentials")));
    end
    if functions.ccxtruthy(agentAddress != nothing)
        finalHeaders[Symbol("agent_wallet")] = agentAddress;
    end
    subAccountAddress = nothing;
    (subAccountAddress, params) = self.handleOptionAndParams(params, "createSubAccount", "subAccountAddress");
    subAccountPrivateKey = nothing;
    (subAccountPrivateKey, params) = self.handleOptionAndParams(params, "createSubAccount", "subAccountPrivateKey");
    if functions.ccxtruthy(subAccountAddress == nothing)
        throw(ArgumentsRequired(string(self.id, " createSubAccount() requires a \"subAccountAddress\"!")));
    end
    if functions.ccxtruthy(subAccountPrivateKey == nothing)
        throw(ArgumentsRequired(string(self.id, " createSubAccount() requires a \"subAccountPrivateKey\"!")));
    end
    timestamp = milliseconds();
    expiryWindow = nothing;
    (expiryWindow, params) = self.handleOptionAndParams2(params, "createSubAccount", "expiryWindow", "expiry_window", 5000);
    subaccountSignatureHeader = Dict{Symbol, Any}(
        Symbol("timestamp") => timestamp,
        Symbol("expiry_window") => expiryWindow,
        Symbol("type") => "subaccount_initiate"
    );
    subSigPayload = Dict{Symbol, Any}(
        Symbol("account") => originAddress
    );
    subaccountSignature = self.signMessage(subaccountSignatureHeader, subSigPayload, subAccountPrivateKey);
    mainSignatureHeader = Dict{Symbol, Any}(
        Symbol("timestamp") => timestamp,
        Symbol("expiry_window") => expiryWindow,
        Symbol("type") => "subaccount_confirm"
    );
    mainSigPayload = Dict{Symbol, Any}(
        Symbol("signature") => subaccountSignature
    );
    main_signature = self.signMessage(mainSignatureHeader, mainSigPayload, self.privateKey);
    finalHeaders[Symbol("main_account")] = originAddress;
    finalHeaders[Symbol("subaccount")] = subAccountAddress;
    finalHeaders[Symbol("sub_signature")] = subaccountSignature;
    finalHeaders[Symbol("main_signature")] = main_signature;
    finalHeaders[Symbol("timestamp")] = timestamp;
    finalHeaders[Symbol("expiry_window")] = expiryWindow;
    request = finalHeaders;
    response = Base.fetch(self.privatePostAccountSubaccountCreate(request));
    return response

end
function bindAgentWallet(self::Pacifica, agentAddress, params=Dict())
    operationType = "bind_agent_wallet";
    sigPayload = Dict{Symbol, Any}(
        Symbol("agent_wallet") => agentAddress
    );
    request = self.postActionRequest(operationType, sigPayload, params);
    return Base.fetch(self.privatePostAgentBind(extend(request, params)))

end
function createApiKey(self::Pacifica, params=Dict())
    operationType = "create_api_key";
    sigPayload = Dict{Symbol, Any}();
    request = self.postActionRequest(operationType, sigPayload, params);
    return Base.fetch(self.privatePostAccountApiKeysCreate(extend(request, params)))

end
function revokeApiKey(self::Pacifica, apiKey, params=Dict())
    operationType = "revoke_api_key";
    sigPayload = Dict{Symbol, Any}(
        Symbol("api_key") => apiKey
    );
    request = self.postActionRequest(operationType, sigPayload, params);
    return Base.fetch(self.privatePostAccountApiKeysRevoke(extend(request, params)))

end
function fetchApiKeys(self::Pacifica, params=Dict())
    operationType = "list_api_keys";
    sigPayload = Dict{Symbol, Any}();
    request = self.postActionRequest(operationType, sigPayload, params);
    return Base.fetch(self.privatePostAccountApiKeys(extend(request, params)))

end
function approveBuilderCode(self::Pacifica, builderCode, maxFeeRate, params=Dict())
    operationType = "approve_builder_code";
    sigPayload = Dict{Symbol, Any}(
        Symbol("builder_code") => builderCode,
        Symbol("max_fee_rate") => maxFeeRate
    );
    request = self.postActionRequest(operationType, sigPayload, params);
    return Base.fetch(self.privatePostAccountBuilderCodesApprove(extend(request, params)))

end
function fetchBuilderApprovals(self::Pacifica, address)
    request = Dict{Symbol, Any}(
        Symbol("account") => address
    );
    return Base.fetch(self.publicGetAccountBuilderCodesApprovals(extend(request)))

end
function revokeBuilderCode(self::Pacifica, builderCode, params=Dict())
    operationType = "revoke_builder_code";
    sigPayload = Dict{Symbol, Any}(
        Symbol("builder_code") => builderCode
    );
    request = self.postActionRequest(operationType, sigPayload, params);
    return Base.fetch(self.privatePostAccountBuilderCodesRevoke(extend(request, params)))

end
function handleOriginAndSingleAddress(self::Pacifica, methodName, params)
    address = nothing;
    (address, params) = self.handleParamString2(params, "account", "address", nothing);
    if functions.ccxtruthy(address != nothing)
            return [address, params]
    end
    address1 = self.walletAddress;
    if functions.ccxtruthy(address1 != nothing)
            return [address1, params]
    end
    throw(ArgumentsRequired(string(self.id, " ", methodName, "() requires address either as \"exchange.walletAddress = ...\" or as parameter or \"address\" in params")));

end
function handleErrors(self::Pacifica, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    inCode = safeInteger(response, "code");
    message = safeString(response, "error");
    error = nothing;
    if functions.ccxtruthy(@functions.ccxt_or(inCode == nothing, inCode == 200))
        error = false;
    else
        error = true;
    end
    nonEmptyMessage = (@functions.ccxt_and((message != nothing), (message != "")));
    if functions.ccxtruthy(@functions.ccxt_or(error, nonEmptyMessage))
        feedback = string(self.id, " ", body);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), message, feedback);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), inCode, feedback);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), message, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end
function sign(self::Pacifica, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    isTestnet = self.isSandboxModeEnabled;
    urlKey = functions.ccxtruthy((isTestnet)) ? "test" : "api";
    host = self.implodeHostname(get(get(self.urls, Symbol(urlKey), nothing), Symbol(api), nothing));
    url = string(host, "/api/", self.version, "/", self.implodeParams(path, params));
    params = omit(params, self.extractParams(path));
    paramsLen = length(objectKeys(params));
    headers = Dict{Symbol, Any}(
        Symbol("Content-Type") => "application/json"
    );
    if functions.ccxtruthy(@functions.ccxt_and(method == "GET", paramsLen))
        url += string("?", self.urlencode(params));
        headers[Symbol("Accept")] = "*/*";
    end
    if functions.ccxtruthy(method == "POST")
        body = json(params);
    end
    if functions.ccxtruthy(self.handleOption("sign", "apiKey") != nothing)
        headers[Symbol("PF-API-KEY")] = get(self.options, Symbol("apiKey"), nothing);
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function calculateRateLimiterCost(self::Pacifica, api, method, path, params, config=Dict())
    cost = safeString(config, "cost", "1");
    costNumber = self.parseNumber(cost);
    if functions.ccxtruthy(functions.ccxt_gt(costNumber, 1))
        if functions.ccxtruthy(self.handleOption(method, "apiKey") != nothing)
            costWithKey = self.handleOption(method, "maxCostHugeWithApiKey", 3);
                return costWithKey
        end
    end
    return costNumber

end
function sortJsonKeys(self::Pacifica, value)
    if functions.ccxtruthy(self.isDictionary(value))
        result = Dict{Symbol, Any}();
        keys_var = objectKeys(value);
        sortedKeys = sort(keys_var);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(sortedKeys)))
            key = get(sortedKeys, i + 1, nothing);
            result[Symbol(key)] = self.sortJsonKeys(get(value, Symbol(key), nothing));
            i += 1
        end

            return result
    elseif functions.ccxtruthy(functions.ccxt_isArray(value))
        result = [];
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(value)))
            push!(result, self.sortJsonKeys(get(value, i + 1, nothing)));
            i += 1
        end
        return result
    else
        return value
    end

end
function prepareMessage(self::Pacifica, header, payload)
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(get(header, Symbol("type"), nothing) == nothing, get(header, Symbol("timestamp"), nothing) == nothing), get(header, Symbol("expiry_window"), nothing) == nothing))
        throw(ArgumentsRequired(string(self.id, " prepareMessage() requires type, timestamp, expiry_window in header")));
    end
    data = extend(header, Dict{Symbol, Any}(
        Symbol("data") => payload
    ));
    sorted = self.sortJsonKeys(data);
    return json(sorted)

end
function signMessage(self::Pacifica, header, payload, privateKey)
    message = self.prepareMessage(header, payload);
    messageBytes = self.encode(message);
    secretBytes = self.base58ToBinary(privateKey);
    seed = self.arraySlice(secretBytes, 0, 32);
    signatureBase64 = eddsa(messageBytes, seed, ed25519);
    signatureBinary = self.base64ToBinary(signatureBase64);
    signatureBase58 = self.binaryToBase58(signatureBinary);
    return signatureBase58

end
function postActionRequest(self::Pacifica, operationType, sigPayload, params)
    self.checkRequiredCredentials();
    if functions.ccxtruthy(operationType == "undefined")
        throw(ArgumentsRequired(string(self.id, " action: ", operationType, " postActionRequest() requires \"operationType\"")));
    end
    if functions.ccxtruthy(!functions.ccxtruthy(self.isSandboxModeEnabled))
        useBuilder = self.handleOption("postActionRequest", "builderFee", true);
        builderCode = nothing;
        if functions.ccxtruthy(useBuilder)
            builderCode = self.handleOption("postActionRequest", "builderCode");
        end
        if functions.ccxtruthy(builderCode != nothing)
            isOperationSupportBuilder = self.safeBool(get(self.options, Symbol("builderSupportOperations"), nothing), operationType, false);
            if functions.ccxtruthy(isOperationSupportBuilder)
                sigPayload[Symbol("builder_code")] = builderCode;
            end
        end
    end
    expiryWindow = nothing;
    (expiryWindow, params) = self.handleOptionAndParams2(params, "postActionRequest", "expiryWindow", "expiry_window", 5000);
    timestamp = safeInteger(params, "timestamp", milliseconds());
    signatureHeader = Dict{Symbol, Any}(
        Symbol("timestamp") => timestamp,
        Symbol("expiry_window") => expiryWindow,
        Symbol("type") => operationType
    );
    signature = self.signMessage(signatureHeader, sigPayload, self.privateKey);
    finalHeaders = Dict{Symbol, Any}();
    agentAddress = nothing;
    (agentAddress, params) = self.handleOptionAndParams(params, "postActionRequest", "agentAddress");
    originAddress = nothing;
    (originAddress, params) = self.handleOriginAndSingleAddress("postActionRequest", params);
    if functions.ccxtruthy(originAddress == nothing)
        throw(ArgumentsRequired(string(self.id, " action: ", operationType, " postActionRequest() requires \"originAddress\" in params or \"walletAddress\" in requiredCredentials")));
    end
    finalHeaders[Symbol("account")] = originAddress;
    if functions.ccxtruthy(agentAddress != nothing)
        finalHeaders[Symbol("agent_wallet")] = agentAddress;
    end
    finalHeaders[Symbol("signature")] = signature;
    finalHeaders[Symbol("timestamp")] = safeInteger(signatureHeader, "timestamp");
    finalHeaders[Symbol("expiry_window")] = safeInteger(signatureHeader, "expiry_window");
    request = extend(finalHeaders, sigPayload);
    return request

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Pacifica, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetInfo(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "info", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetInfoFees(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "info/fees", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetInfoPrices(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "info/prices", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetKline(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "kline", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetKlineMark(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "kline/mark", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetBook(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "book", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTrades(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "trades", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetFundingRateHistory(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "funding_rate/history", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetLoanPool(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "loan_pool", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetAccount(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "account", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetAccountLoan(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "account/loan", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetAccountSettings(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "account/settings", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPositions(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "positions", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTradesHistory(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "trades/history", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetFundingHistory(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "funding/history", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPortfolio(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "portfolio", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetAccountBalanceHistory(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "account/balance/history", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetAccountSpotBalanceHistory(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "account/spot_balance/history", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetAccountSpotAssetDepositHistory(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "account/spot_asset/deposit/history", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetAccountSpotAssetWithdrawHistory(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "account/spot_asset/withdraw/history", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetAccountSpotAssetWithdrawPending(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "account/spot_asset/withdraw/pending", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetOrders(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "orders", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetOrdersHistory(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "orders/history", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetOrdersHistoryById(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "orders/history_by_id", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetSpotAssets(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "spot_assets", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetSpotAssetsBridgeInfo(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "spot_assets/bridge/info", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetSpotAssetsBridgeParametersSymbol(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "spot_assets/bridge/parameters/{symbol}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetLakeList(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "lake/list", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetAccountBuilderCodesApprovals(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "account/builder_codes/approvals", "public", "GET", params, nothing, nothing, Dict())
end

function privatePostAccountLeverage(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "account/leverage", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountMargin(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "account/margin", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountWithdraw(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "account/withdraw", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountSettingsAutoLendDisabled(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "account/settings/auto_lend_disabled", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountSettingsSpot(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "account/settings/spot", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountSpotAssetWithdraw(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "account/spot_asset/withdraw", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountSubaccountCreate(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "account/subaccount/create", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountSubaccountList(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "account/subaccount/list", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountSubaccountTransfer(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "account/subaccount/transfer", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountSubaccountSpotAssetTransfer(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "account/subaccount/spot_asset/transfer", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostPositionsAddIsolatedMargin(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "positions/add_isolated_margin", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOrdersCreate(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "orders/create", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOrdersCreateMarket(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "orders/create_market", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOrdersStopCreate(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "orders/stop/create", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostPositionsTpsl(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "positions/tpsl", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOrdersCancel(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "orders/cancel", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOrdersCancelAll(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "orders/cancel_all", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOrdersStopCancel(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "orders/stop/cancel", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOrdersEdit(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "orders/edit", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOrdersBatch(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "orders/batch", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountBuilderCodesApprove(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "account/builder_codes/approve", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountBuilderCodesRevoke(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "account/builder_codes/revoke", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAgentBind(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "agent/bind", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountApiKeysCreate(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "account/api_keys/create", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountApiKeysRevoke(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "account/api_keys/revoke", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountApiKeys(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "account/api_keys", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostLakeAddBlacklist(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "lake/add_blacklist", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostLakeAddMaxLeverage(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "lake/add_max_leverage", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostLakeAddWhitelist(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "lake/add_whitelist", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostLakeClaimManager(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "lake/claim_manager", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostLakeClaimReferralCode(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "lake/claim_referral_code", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostLakeCreate(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "lake/create", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostLakeDeposit(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "lake/deposit", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostLakeRemoveBlacklist(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "lake/remove_blacklist", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostLakeRemoveMaxLeverage(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "lake/remove_max_leverage", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostLakeRemoveWhitelist(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "lake/remove_whitelist", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostLakeUpdateDepositCap(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "lake/update_deposit_cap", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostLakeWithdraw(self::Pacifica, params=Dict(), context=Dict())
    return request(self, "lake/withdraw", "private", "POST", params, nothing, nothing, Dict())
end

function Pacifica(; kwargs...)
    inst = Pacifica(Exchange(), describe, initializeClient, handleBuilderFeeApproval, fetchMarkets, fetchSwapMarkets, parseMarket, fetchBalance, fetchLeverage, parseLeverageFromSetting, parseLeverageFromMarket, fetchAccountSettings, loadAccountSettings, parseAccountSettings, fetchMarginMode, parseMarginModeFromSetting, fetchOrderBook, fetchFundingRates, parseFundingRate, fetchOHLCV, parseOHLCV, fetchTrades, fetchMyTrades, parseTrade, createOrder, createOrderRequest, batchOrdersRequest, createOrdersRequest, createOrders, cancelOrders, cancelOrdersRequest, cancelAllOrders, cancelAllOrdersRequest, cancelOrder, cancelOrderRequest, editOrder, editOrderRequest, fetchFundingRateHistory, fetchTickers, parseTicker, fetchClosedOrders, fetchCanceledOrders, fetchCanceledAndClosedOrders, fetchOpenOrders, fetchOrders, addPaginationCursorToResult, fetchOrder, parseOrderStatus, mapTimeInForce, mapSide, parseOrderType, parseOrder, fetchPosition, fetchPositions, parsePosition, setMarginMode, setLeverage, withdraw, fetchTradingFee, parseTradingFee, fetchOpenInterests, fetchOpenInterest, parseOpenInterest, fetchLedger, parseLedgerEntry, parseLedgerEntryType, fetchFundingHistory, parseIncome, transfer, parseTransfer, createSubAccount, bindAgentWallet, createApiKey, revokeApiKey, fetchApiKeys, approveBuilderCode, fetchBuilderApprovals, revokeBuilderCode, handleOriginAndSingleAddress, handleErrors, sign, calculateRateLimiterCost, sortJsonKeys, prepareMessage, signMessage, postActionRequest, publicGetInfo, publicGetInfoFees, publicGetInfoPrices, publicGetKline, publicGetKlineMark, publicGetBook, publicGetTrades, publicGetFundingRateHistory, publicGetLoanPool, publicGetAccount, publicGetAccountLoan, publicGetAccountSettings, publicGetPositions, publicGetTradesHistory, publicGetFundingHistory, publicGetPortfolio, publicGetAccountBalanceHistory, publicGetAccountSpotBalanceHistory, publicGetAccountSpotAssetDepositHistory, publicGetAccountSpotAssetWithdrawHistory, publicGetAccountSpotAssetWithdrawPending, publicGetOrders, publicGetOrdersHistory, publicGetOrdersHistoryById, publicGetSpotAssets, publicGetSpotAssetsBridgeInfo, publicGetSpotAssetsBridgeParametersSymbol, publicGetLakeList, publicGetAccountBuilderCodesApprovals, privatePostAccountLeverage, privatePostAccountMargin, privatePostAccountWithdraw, privatePostAccountSettingsAutoLendDisabled, privatePostAccountSettingsSpot, privatePostAccountSpotAssetWithdraw, privatePostAccountSubaccountCreate, privatePostAccountSubaccountList, privatePostAccountSubaccountTransfer, privatePostAccountSubaccountSpotAssetTransfer, privatePostPositionsAddIsolatedMargin, privatePostOrdersCreate, privatePostOrdersCreateMarket, privatePostOrdersStopCreate, privatePostPositionsTpsl, privatePostOrdersCancel, privatePostOrdersCancelAll, privatePostOrdersStopCancel, privatePostOrdersEdit, privatePostOrdersBatch, privatePostAccountBuilderCodesApprove, privatePostAccountBuilderCodesRevoke, privatePostAgentBind, privatePostAccountApiKeysCreate, privatePostAccountApiKeysRevoke, privatePostAccountApiKeys, privatePostLakeAddBlacklist, privatePostLakeAddMaxLeverage, privatePostLakeAddWhitelist, privatePostLakeClaimManager, privatePostLakeClaimReferralCode, privatePostLakeCreate, privatePostLakeDeposit, privatePostLakeRemoveBlacklist, privatePostLakeRemoveMaxLeverage, privatePostLakeRemoveWhitelist, privatePostLakeUpdateDepositCap, privatePostLakeWithdraw)
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
