@kwdef mutable struct Lighter <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    loadAccount::Function = loadAccount
    initAuthObject::Function = initAuthObject
    getLighterPrivateKey::Function = getLighterPrivateKey
    preLoadLighterLibrary::Function = preLoadLighterLibrary
    handleApiKeyIndex::Function = handleApiKeyIndex
    handleAccountIndex::Function = handleAccountIndex
    createSubAccount::Function = createSubAccount
    createAuth::Function = createAuth
    pow::Function = pow
    hashMessage::Function = hashMessage
    signHash::Function = signHash
    signL1AndPrepareTxInfo::Function = signL1AndPrepareTxInfo
    handleBuilderFeeApproval::Function = handleBuilderFeeApproval
    approveBuilderFee::Function = approveBuilderFee
    changeApiKey::Function = changeApiKey
    setSandboxMode::Function = setSandboxMode
    createOrderRequest::Function = createOrderRequest
    fetchNonce::Function = fetchNonce
    createOrder::Function = createOrder
    editOrder::Function = editOrder
    fetchStatus::Function = fetchStatus
    fetchTime::Function = fetchTime
    fetchMarkets::Function = fetchMarkets
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    fetchOrderBook::Function = fetchOrderBook
    parseTicker::Function = parseTicker
    fetchTicker::Function = fetchTicker
    fetchTickers::Function = fetchTickers
    parseOHLCV::Function = parseOHLCV
    fetchOHLCV::Function = fetchOHLCV
    parseFundingRate::Function = parseFundingRate
    fetchFundingRates::Function = fetchFundingRates
    fetchBalance::Function = fetchBalance
    fetchPosition::Function = fetchPosition
    fetchPositions::Function = fetchPositions
    parsePosition::Function = parsePosition
    fetchAccounts::Function = fetchAccounts
    parseAccount::Function = parseAccount
    fetchOpenOrders::Function = fetchOpenOrders
    fetchClosedOrders::Function = fetchClosedOrders
    parseOrder::Function = parseOrder
    parseOrderStatus::Function = parseOrderStatus
    parseOrderType::Function = parseOrderType
    parseOrderTypeInteger::Function = parseOrderTypeInteger
    parseOrderTimeInForce::Function = parseOrderTimeInForce
    parseOrderTimeInForceInteger::Function = parseOrderTimeInForceInteger
    transfer::Function = transfer
    fetchTransfers::Function = fetchTransfers
    parseTransfer::Function = parseTransfer
    fetchDeposits::Function = fetchDeposits
    fetchWithdrawals::Function = fetchWithdrawals
    parseTransaction::Function = parseTransaction
    parseTransactionStatus::Function = parseTransactionStatus
    withdraw::Function = withdraw
    fetchMyTrades::Function = fetchMyTrades
    parseTrade::Function = parseTrade
    setLeverage::Function = setLeverage
    setMarginMode::Function = setMarginMode
    modifyLeverageAndMarginMode::Function = modifyLeverageAndMarginMode
    cancelOrder::Function = cancelOrder
    cancelAllOrders::Function = cancelAllOrders
    cancelAllOrdersAfter::Function = cancelAllOrdersAfter
    addMargin::Function = addMargin
    reduceMargin::Function = reduceMargin
    setMargin::Function = setMargin
    parseMarginModification::Function = parseMarginModification
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    rootGet::Function = rootGet
    rootGetInfo::Function = rootGetInfo
    publicGetAccount::Function = publicGetAccount
    publicGetAccountsByL1Address::Function = publicGetAccountsByL1Address
    publicGetApikeys::Function = publicGetApikeys
    publicGetExchangeStats::Function = publicGetExchangeStats
    publicGetAssetDetails::Function = publicGetAssetDetails
    publicGetOrderBookDetails::Function = publicGetOrderBookDetails
    publicGetOrderBookOrders::Function = publicGetOrderBookOrders
    publicGetOrderBooks::Function = publicGetOrderBooks
    publicGetRecentTrades::Function = publicGetRecentTrades
    publicGetBlockTxs::Function = publicGetBlockTxs
    publicGetNextNonce::Function = publicGetNextNonce
    publicGetTx::Function = publicGetTx
    publicGetTxFromL1TxHash::Function = publicGetTxFromL1TxHash
    publicGetTxs::Function = publicGetTxs
    publicGetAnnouncement::Function = publicGetAnnouncement
    publicGetBlock::Function = publicGetBlock
    publicGetBlocks::Function = publicGetBlocks
    publicGetCurrentHeight::Function = publicGetCurrentHeight
    publicGetCandles::Function = publicGetCandles
    publicGetFundings::Function = publicGetFundings
    publicGetFastbridgeInfo::Function = publicGetFastbridgeInfo
    publicGetFundingRates::Function = publicGetFundingRates
    publicGetWithdrawalDelay::Function = publicGetWithdrawalDelay
    publicPostSendTx::Function = publicPostSendTx
    publicPostSendTxBatch::Function = publicPostSendTxBatch
    privateGetAccountLimits::Function = privateGetAccountLimits
    privateGetAccountMetadata::Function = privateGetAccountMetadata
    privateGetPnl::Function = privateGetPnl
    privateGetL1Metadata::Function = privateGetL1Metadata
    privateGetLiquidations::Function = privateGetLiquidations
    privateGetPositionFunding::Function = privateGetPositionFunding
    privateGetPublicPoolsMetadata::Function = privateGetPublicPoolsMetadata
    privateGetAccountActiveOrders::Function = privateGetAccountActiveOrders
    privateGetAccountInactiveOrders::Function = privateGetAccountInactiveOrders
    privateGetExport::Function = privateGetExport
    privateGetTrades::Function = privateGetTrades
    privateGetAccountTxs::Function = privateGetAccountTxs
    privateGetDepositHistory::Function = privateGetDepositHistory
    privateGetTransferHistory::Function = privateGetTransferHistory
    privateGetWithdrawHistory::Function = privateGetWithdrawHistory
    privateGetReferralPoints::Function = privateGetReferralPoints
    privateGetTransferFeeInfo::Function = privateGetTransferFeeInfo
    privatePostChangeAccountTier::Function = privatePostChangeAccountTier
    privatePostNotificationAck::Function = privatePostNotificationAck

end
function describe(self::Lighter, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "lighter",
    Symbol("name") => "Lighter",
    Symbol("countries") => [],
    Symbol("version") => "v1",
    Symbol("rateLimit") => 1000,
    Symbol("certified") => false,
    Symbol("pro") => true,
    Symbol("dex") => true,
    Symbol("quoteJsonNumbers") => false,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => true,
        Symbol("margin") => false,
        Symbol("swap") => true,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("addMargin") => true,
        Symbol("borrowCrossMargin") => false,
        Symbol("borrowIsolatedMargin") => false,
        Symbol("borrowMargin") => false,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelAllOrdersAfter") => true,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => false,
        Symbol("cancelOrdersForSymbols") => false,
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => false,
        Symbol("createMarketBuyOrderWithCost") => false,
        Symbol("createMarketOrderWithCost") => false,
        Symbol("createMarketSellOrderWithCost") => false,
        Symbol("createOrder") => true,
        Symbol("createOrders") => false,
        Symbol("createPostOnlyOrder") => false,
        Symbol("createReduceOnlyOrder") => false,
        Symbol("createStopOrder") => false,
        Symbol("createTriggerOrder") => false,
        Symbol("editOrder") => true,
        Symbol("fetchAccounts") => true,
        Symbol("fetchAllGreeks") => false,
        Symbol("fetchBalance") => true,
        Symbol("fetchBorrowInterest") => false,
        Symbol("fetchBorrowRate") => false,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchBorrowRates") => false,
        Symbol("fetchBorrowRatesPerSymbol") => false,
        Symbol("fetchCanceledAndClosedOrders") => false,
        Symbol("fetchCanceledOrders") => false,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDepositAddress") => false,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDeposits") => true,
        Symbol("fetchDepositWithdrawFee") => false,
        Symbol("fetchDepositWithdrawFees") => false,
        Symbol("fetchFundingHistory") => false,
        Symbol("fetchFundingRate") => false,
        Symbol("fetchFundingRateHistory") => false,
        Symbol("fetchFundingRates") => true,
        Symbol("fetchGreeks") => false,
        Symbol("fetchIndexOHLCV") => false,
        Symbol("fetchIsolatedBorrowRate") => false,
        Symbol("fetchIsolatedBorrowRates") => false,
        Symbol("fetchLedger") => false,
        Symbol("fetchLeverage") => false,
        Symbol("fetchLeverageTiers") => false,
        Symbol("fetchLiquidations") => false,
        Symbol("fetchMarginMode") => false,
        Symbol("fetchMarketLeverageTiers") => false,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => false,
        Symbol("fetchMyLiquidations") => false,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterest") => false,
        Symbol("fetchOpenInterestHistory") => false,
        Symbol("fetchOpenInterests") => false,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOption") => false,
        Symbol("fetchOptionChain") => false,
        Symbol("fetchOrder") => false,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrders") => false,
        Symbol("fetchOrderTrades") => false,
        Symbol("fetchPosition") => true,
        Symbol("fetchPositionMode") => false,
        Symbol("fetchPositions") => true,
        Symbol("fetchPositionsRisk") => false,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchStatus") => true,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => false,
        Symbol("fetchTradingFee") => false,
        Symbol("fetchTradingFees") => false,
        Symbol("fetchTransfer") => false,
        Symbol("fetchTransfers") => true,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("fetchWithdrawal") => false,
        Symbol("fetchWithdrawals") => true,
        Symbol("reduceMargin") => true,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("sandbox") => true,
        Symbol("setLeverage") => true,
        Symbol("setMargin") => true,
        Symbol("setMarginMode") => true,
        Symbol("setPositionMode") => false,
        Symbol("transfer") => true,
        Symbol("withdraw") => true
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "1m",
        Symbol("5m") => "5m",
        Symbol("15m") => "15m",
        Symbol("30m") => "30m",
        Symbol("1h") => "1h",
        Symbol("4h") => "4h",
        Symbol("12h") => "12h",
        Symbol("1d") => "1d",
        Symbol("1w") => "1w"
    ),
    Symbol("hostname") => "zklighter.elliot.ai",
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/5aa1158d-0734-49fc-9155-501d94b76a0b",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("root") => "https://mainnet.{hostname}",
            Symbol("public") => "https://mainnet.{hostname}",
            Symbol("private") => "https://mainnet.{hostname}"
        ),
        Symbol("test") => Dict{Symbol, Any}(
            Symbol("root") => "https://testnet.{hostname}",
            Symbol("public") => "https://testnet.{hostname}",
            Symbol("private") => "https://testnet.{hostname}"
        ),
        Symbol("www") => "https://lighter.xyz/",
        Symbol("doc") => "https://apidocs.lighter.xyz/",
        Symbol("fees") => "https://docs.lighter.xyz/perpetual-futures/fees",
        Symbol("referral") => Dict{Symbol, Any}(
            Symbol("url") => "https://app.lighter.xyz/?referral=715955W9",
            Symbol("discount") => 0.1
        )
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("root") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("account") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("accountsByL1Address") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("apikeys") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("exchangeStats") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("assetDetails") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orderBookDetails") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orderBookOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orderBooks") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("recentTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("blockTxs") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("nextNonce") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tx") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("txFromL1TxHash") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("txs") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("announcement") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("block") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("blocks") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("currentHeight") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("candles") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("fundings") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("fastbridge/info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("funding-rates") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("withdrawalDelay") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("sendTx") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sendTxBatch") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("accountLimits") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("accountMetadata") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("pnl") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("l1Metadata") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("liquidations") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("positionFunding") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("publicPoolsMetadata") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("accountActiveOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("accountInactiveOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("export") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("accountTxs") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("deposit/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("transfer/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("withdraw/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("referral/points") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("transferFeeInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("changeAccountTier") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("notification/ack") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        )
    ),
    Symbol("httpExceptions") => Dict{Symbol, Any}(),
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("21146") => ExchangeError,
            Symbol("21500") => ExchangeError,
            Symbol("21501") => ExchangeError,
            Symbol("21502") => ExchangeError,
            Symbol("21503") => ExchangeError,
            Symbol("21504") => ExchangeError,
            Symbol("21505") => ExchangeError,
            Symbol("21506") => ExchangeError,
            Symbol("21507") => ExchangeError,
            Symbol("21508") => ExchangeError,
            Symbol("21511") => ExchangeError,
            Symbol("21512") => ExchangeError,
            Symbol("21600") => InvalidOrder,
            Symbol("21601") => InvalidOrder,
            Symbol("21602") => InvalidOrder,
            Symbol("21603") => InvalidOrder,
            Symbol("21604") => InvalidOrder,
            Symbol("21605") => InvalidOrder,
            Symbol("21606") => InvalidOrder,
            Symbol("21607") => InvalidOrder,
            Symbol("21608") => InvalidOrder,
            Symbol("21611") => InvalidOrder,
            Symbol("21612") => InvalidOrder,
            Symbol("21613") => InvalidOrder,
            Symbol("21614") => InvalidOrder,
            Symbol("21700") => InvalidOrder,
            Symbol("21701") => InvalidOrder,
            Symbol("21702") => InvalidOrder,
            Symbol("21703") => InvalidOrder,
            Symbol("21704") => InvalidOrder,
            Symbol("21705") => InvalidOrder,
            Symbol("21706") => InvalidOrder,
            Symbol("21707") => InvalidOrder,
            Symbol("21708") => InvalidOrder,
            Symbol("21709") => InvalidOrder,
            Symbol("21710") => InvalidOrder,
            Symbol("21711") => InvalidOrder,
            Symbol("21712") => InvalidOrder,
            Symbol("21713") => InvalidOrder,
            Symbol("21714") => InvalidOrder,
            Symbol("21715") => InvalidOrder,
            Symbol("21716") => InvalidOrder,
            Symbol("21717") => InvalidOrder,
            Symbol("21718") => InvalidOrder,
            Symbol("21719") => InvalidOrder,
            Symbol("21720") => InvalidOrder,
            Symbol("21721") => InvalidOrder,
            Symbol("21722") => InvalidOrder,
            Symbol("21723") => InvalidOrder,
            Symbol("21724") => InvalidOrder,
            Symbol("21725") => InvalidOrder,
            Symbol("21726") => InvalidOrder,
            Symbol("21727") => InvalidOrder,
            Symbol("21728") => InvalidOrder,
            Symbol("21729") => InvalidOrder,
            Symbol("21730") => InvalidOrder,
            Symbol("21731") => InvalidOrder,
            Symbol("21732") => InvalidOrder,
            Symbol("21733") => InvalidOrder,
            Symbol("21734") => InvalidOrder,
            Symbol("21735") => InvalidOrder,
            Symbol("21736") => InvalidOrder,
            Symbol("21737") => InvalidOrder,
            Symbol("21738") => InvalidOrder,
            Symbol("21739") => InvalidOrder,
            Symbol("21740") => InvalidOrder,
            Symbol("21901") => InvalidOrder,
            Symbol("21902") => InvalidOrder,
            Symbol("21903") => InvalidOrder,
            Symbol("21904") => InvalidOrder,
            Symbol("21905") => InvalidOrder,
            Symbol("21906") => InvalidOrder,
            Symbol("23000") => RateLimitExceeded,
            Symbol("23001") => RateLimitExceeded,
            Symbol("23002") => RateLimitExceeded,
            Symbol("23003") => RateLimitExceeded
        ),
        Symbol("broad") => Dict{Symbol, Any}()
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("taker") => 0,
        Symbol("maker") => 0
    ),
    Symbol("requiredCredentials") => Dict{Symbol, Any}(
        Symbol("apiKey") => false,
        Symbol("secret") => false,
        Symbol("walletAddress") => false,
        Symbol("privateKey") => true,
        Symbol("password") => false
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("commonCurrencies") => Dict{Symbol, Any}(),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("defaultType") => "swap",
        Symbol("builderFee") => true,
        Symbol("chainId") => 304,
        Symbol("accountIndex") => nothing,
        Symbol("apiKeyIndex") => nothing,
        Symbol("lighterPrivateKey") => nothing,
        Symbol("wasmExecPath") => nothing,
        Symbol("libraryPath") => nothing,
        Symbol("integratorAccountIndex") => 718718,
        Symbol("integratorMakerFee") => 1000,
        Symbol("integratorTakerFee") => 1000,
        Symbol("authDeadlineExpiry") => 28800,
        Symbol("authDeadlineMinimumRemaining") => 60
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("default") => Dict{Symbol, Any}(
            Symbol("sandbox") => true,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("timeInForce") => Dict{Symbol, Any}(
                    Symbol("IOC") => true,
                    Symbol("FOK") => true,
                    Symbol("PO") => true,
                    Symbol("GTD") => false
                ),
                Symbol("leverage") => false,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("marketBuyByCost") => false,
                Symbol("selfTradePrevention") => false,
                Symbol("trailing") => false,
                Symbol("iceberg") => false
            )
        )
    )
))

end
function loadAccount(self::Lighter, chainId, privateKey, apiKeyIndex, accountIndex; params=Dict())
    self.initAuthObject(accountIndex, apiKeyIndex);
    cachedAuths = self.safeDict(get(get(self.options, Symbol("auths"), nothing), Symbol(accountIndex), nothing), apiKeyIndex);
    signer = safeValue(cachedAuths, "signer");
    if functions.ccxtruthy(signer != nothing)
            return signer
    end
    libraryPath = nothing;
    (libraryPath, params) = self.handleOptionAndParams(params, "loadAccount", "libraryPath");
    lighterPrivateKeyIsSet = @functions.ccxt_and((privateKey != nothing), (privateKey != ""));
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(@functions.ccxt_and(lighterPrivateKeyIsSet, (libraryPath != nothing)), (apiKeyIndex != nothing)), (accountIndex != nothing)))
        signer = Base.fetch(self.loadLighterLibrary(libraryPath, chainId, privateKey, self.parseToInt(apiKeyIndex), self.parseToInt(accountIndex), createClient = true));
        self.options[Symbol("auths")][Symbol(accountIndex)][Symbol(apiKeyIndex)][Symbol("signer")] = signer;
            return signer
    end
    privateKeyIsSet = @functions.ccxt_and((self.privateKey != nothing), (self.privateKey != ""));
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(privateKeyIsSet, (apiKeyIndex != nothing)), (accountIndex != nothing)))
        if functions.ccxtruthy(functions.ccxt_gt(length(self.privateKey), 66))
            throw(NotSupported(string(self.id, " after the latest update (v4.5.50), CCXT now expects the l1 private key to be provided in the credentials. Please check for more details: https://github.com/ccxt/ccxt/wiki/FAQ#how-to-use-the-lighter-exchange-in-ccxt")));
        end
        signer = Base.fetch(self.loadLighterLibrary(libraryPath, chainId, "", self.parseToInt(apiKeyIndex), self.parseToInt(accountIndex), createClient = false));
        self.options[Symbol("auths")][Symbol(accountIndex)][Symbol(apiKeyIndex)][Symbol("signer")] = signer;
        res = Base.fetch(self.changeApiKey());
        Base.fetch(self.handleBuilderFeeApproval(self.parseToInt(accountIndex), self.parseToInt(apiKeyIndex)));
            return res
    end
    return signer

end
function initAuthObject(self::Lighter, strAccountIndex, strApiKeyIndex)
    if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in("auths", self.options))))
        self.options[Symbol("auths")] = Dict{Symbol, Any}();
    end
    if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in(strAccountIndex, get(self.options, Symbol("auths"), nothing)))))
        self.options[Symbol("auths")][Symbol(strAccountIndex)] = Dict{Symbol, Any}();
    end
    if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in(strApiKeyIndex, get(get(self.options, Symbol("auths"), nothing), Symbol(strAccountIndex), nothing)))))
        self.options[Symbol("auths")][Symbol(strAccountIndex)][Symbol(strApiKeyIndex)] = Dict{Symbol, Any}(
            Symbol("signer") => nothing,
            Symbol("lighterPrivateKey") => nothing,
            Symbol("deadline") => nothing,
            Symbol("token") => nothing
        );
    end

end
function getLighterPrivateKey(self::Lighter, strAccountIndex, strApiKeyIndex)
    if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in("auths", self.options))))
            return nothing
    end
    if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in(strAccountIndex, get(self.options, Symbol("auths"), nothing)))))
            return nothing
    end
    if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in(strApiKeyIndex, get(get(self.options, Symbol("auths"), nothing), Symbol(strAccountIndex), nothing)))))
            return nothing
    end
    if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in("lighterPrivateKey", get(get(get(self.options, Symbol("auths"), nothing), Symbol(strAccountIndex), nothing), Symbol(strApiKeyIndex), nothing)))))
            return nothing
    end
    return get(get(get(get(self.options, Symbol("auths"), nothing), Symbol(strAccountIndex), nothing), Symbol(strApiKeyIndex), nothing), Symbol("lighterPrivateKey"), nothing)

end
"""
if the required credentials are available in options, it will pre-load the lighter Signer to avoid delaying sensitive calls like createOrder the first time they're executed

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- true if the signer was loaded, false otherwise
"""
function preLoadLighterLibrary(self::Lighter; params=Dict())
    apiKeyIndex = nothing;
    (apiKeyIndex, params) = self.handleApiKeyIndex(params, "loadAccount", "apiKeyIndex", "api_key_index");
    accountIndex = nothing;
    (accountIndex, params) = Base.fetch(self.handleAccountIndex(params, "loadAccount", "accountIndex", "account_index"));
    if functions.ccxtruthy(accountIndex == nothing)
        throw(ArgumentsRequired(string(self.id, " requires accountIndex or account_index")));
    end
    strAccountIndex = numberToString(accountIndex);
    strApiKeyIndex = numberToString(apiKeyIndex);
    self.initAuthObject(strAccountIndex, strApiKeyIndex);
    signer = self.safeDict(get(get(get(self.options, Symbol("auths"), nothing), Symbol(strAccountIndex), nothing), Symbol(strApiKeyIndex), nothing), "signer");
    if functions.ccxtruthy(signer != nothing)
            return true
    end
    signer = Base.fetch(self.loadAccount(get(self.options, Symbol("chainId"), nothing), self.getLighterPrivateKey(strAccountIndex, strApiKeyIndex), strApiKeyIndex, strAccountIndex));
    Base.fetch(self.handleBuilderFeeApproval(accountIndex, apiKeyIndex));
    return (signer != nothing)

end
function handleApiKeyIndex(self::Lighter, params, methodName1, optionName1, optionName2; defaultValue=nothing)
    apiKeyIndex = nothing;
    (apiKeyIndex, params) = self.handleOptionAndParams2(params, methodName1, optionName1, optionName2, defaultValue = defaultValue);
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or((apiKeyIndex == nothing), (functions.ccxt_lt(apiKeyIndex, 4))), (functions.ccxt_gt(apiKeyIndex, 254))))
        apiKeyIndex = 254;
        self.options[Symbol("apiKeyIndex")] = apiKeyIndex;
    end
    return [self.parseToInt(apiKeyIndex), params]

end
function handleAccountIndex(self::Lighter, params, methodName1, optionName1, optionName2; defaultValue=nothing)
    accountIndex = nothing;
    (accountIndex, params) = self.handleOptionAndParams2(params, methodName1, optionName1, optionName2, defaultValue = defaultValue);
    if functions.ccxtruthy(accountIndex == nothing)
        walletAddress = self.walletAddress;
        if functions.ccxtruthy(self.privateKey != nothing)
            if functions.ccxtruthy(functions.ccxt_gt(length(self.privateKey), 66))
                throw(NotSupported(string(self.id, " after the latest update (v4.5.50), CCXT now expects the l1 private key to be provided in the credentials. Please check for more details: https://github.com/ccxt/ccxt/wiki/FAQ#how-to-use-the-lighter-exchange-in-ccxt")));
            end
            walletAddress = self.ethGetAddressFromPrivateKey(self.privateKey);
        end
        if functions.ccxtruthy(@functions.ccxt_or(walletAddress == nothing, walletAddress == ""))
            throw(ArgumentsRequired(string(self.id, " ", methodName1, "() requires an ", optionName1, "/", optionName2, " parameter or walletAddress to fetch accountIndex. Alternatively set privateKey in credentials to enable automatic walletAddress detection.")));
        end
        res = Base.fetch(self.publicGetAccountsByL1Address(Dict{Symbol, Any}(
            Symbol("l1_address") => walletAddress
        )));
        subAccounts = self.safeList(res, "sub_accounts");
        if functions.ccxtruthy(functions.ccxt_isArray(subAccounts))
            account = self.safeDict(subAccounts, 0);
            if functions.ccxtruthy(account == nothing)
                throw(ArgumentsRequired(string(self.id, " ", methodName1, "() requires an ", optionName1, " or ", optionName2, " parameter")));
            end
            accountIndex = get(account, Symbol("index"), nothing);
            self.options[Symbol("accountIndex")] = accountIndex;
        end
    end
    return [self.parseToInt(accountIndex), params]

end
function createSubAccount(self::Lighter, name; params=Dict())
    apiKeyIndex = nothing;
    (apiKeyIndex, params) = self.handleApiKeyIndex(params, "createSubAccount", "apiKeyIndex", "api_key_index");
    accountIndex = nothing;
    (accountIndex, params) = Base.fetch(self.handleAccountIndex(params, "createSubAccount", "accountIndex", "account_index"));
    nonce = Base.fetch(self.fetchNonce(accountIndex, apiKeyIndex, params = params));
    signRaw = Dict{Symbol, Any}(
        Symbol("nonce") => nonce,
        Symbol("api_key_index") => apiKeyIndex,
        Symbol("account_index") => accountIndex
    );
    strAccountIndex = numberToString(accountIndex);
    strApiKeyIndex = numberToString(apiKeyIndex);
    signer = Base.fetch(self.loadAccount(get(self.options, Symbol("chainId"), nothing), self.getLighterPrivateKey(strAccountIndex, strApiKeyIndex), strApiKeyIndex, strAccountIndex, params = params));
    (txType, txInfo) = self.lighterSignCreateSubAccount(signer, extend(signRaw, params));
    request = Dict{Symbol, Any}(
        Symbol("tx_type") => txType,
        Symbol("tx_info") => txInfo
    );
    return Base.fetch(self.publicPostSendTx(request))

end
function createAuth(self::Lighter; params=Dict())
    apiKeyIndex = safeString2(params, "apiKeyIndex", "api_key_index");
    if functions.ccxtruthy(apiKeyIndex == nothing)
        res = self.handleOptionAndParams2(Dict{Symbol, Any}(), "createAuth", "apiKeyIndex", "api_key_index");
        apiKeyIndex = safeString(res, 0);
    end
    accountIndex = safeString2(params, "accountIndex", "account_index");
    if functions.ccxtruthy(accountIndex == nothing)
        res = self.handleOptionAndParams2(Dict{Symbol, Any}(), "createAuth", "accountIndex", "account_index");
        accountIndex = safeString(res, 0);
    end
    auths = self.safeDict(self.options, "auths");
    accountAuths = self.safeDict(auths, accountIndex);
    cachedAuth = self.safeDict(accountAuths, apiKeyIndex);
    cachedDeadline = safeInteger(cachedAuth, "deadline");
    if functions.ccxtruthy(cachedDeadline != nothing)
        minimumDeadline = seconds() + safeInteger(self.options, "authDeadlineMinimumRemaining", 60);
        if functions.ccxtruthy(functions.ccxt_ge(cachedDeadline, minimumDeadline))
                return safeString(cachedAuth, "token")
        end
    end
    deadline = seconds() + safeInteger(self.options, "authDeadlineExpiry", 28800);
    request = Dict{Symbol, Any}(
        Symbol("deadline") => deadline,
        Symbol("api_key_index") => self.parseToInt(apiKeyIndex),
        Symbol("account_index") => self.parseToInt(accountIndex)
    );
    token = self.lighterCreateAuthToken(get(get(get(get(self.options, Symbol("auths"), nothing), Symbol(accountIndex), nothing), Symbol(apiKeyIndex), nothing), Symbol("signer"), nothing), request);
    self.options[Symbol("auths")][Symbol(accountIndex)][Symbol(apiKeyIndex)][Symbol("deadline")] = deadline;
    self.options[Symbol("auths")][Symbol(accountIndex)][Symbol(apiKeyIndex)][Symbol("token")] = token;
    return token

end
function pow(self::Lighter, n, m)
    r = stringMul(n, "1");
    c = self.parseToInt(m);
    if functions.ccxtruthy(functions.ccxt_lt(c, 0))
        throw(BadRequest(string(self.id, " pow() requires m > 0.")));
    end
    if functions.ccxtruthy(c == 0)
            return "1"
    end
    if functions.ccxtruthy(functions.ccxt_gt(c, 100))
        throw(BadRequest(string(self.id, " pow() requires m < 100.")));
    end
    i = 1
    while functions.ccxtruthy(functions.ccxt_lt(i, c))
        r = stringMul(r, n);
        i += 1
    end
    return r

end
function hashMessage(self::Lighter, message)
    binaryMessage = self.encode(message);
    binaryMessageLength = self.binaryLength(binaryMessage);
    x19 = self.base16ToBinary("19");
    newline = self.base16ToBinary("0a");
    prefix = binaryConcat(x19, self.encode("Ethereum Signed Message:"), newline, self.encode(numberToString(binaryMessageLength)));
    return string("0x", hash(binaryConcat(prefix, binaryMessage), keccak, "hex"))

end
function signHash(self::Lighter, hash, privateKey)
    self.checkRequiredCredentials();
    signature = ecdsa(functions.ccxt_slice(hash, -64), functions.ccxt_slice(privateKey, -64), secp256k1, nothing);
    r = get(signature, Symbol("r"), nothing);
    s = get(signature, Symbol("s"), nothing);
    v = self.intToBase16(self.sum(27, get(signature, Symbol("v"), nothing)));
    return string("0x", lpad(r, 64, "0"), lpad(s, 64, "0"), v)

end
function signL1AndPrepareTxInfo(self::Lighter, txInfo, message, privateKey)
    hashMessage = self.hashMessage(message);
    signature = self.signHash(hashMessage, privateKey);
    decTxInfo = self.parseJson(txInfo);
    decTxInfo[Symbol("L1Sig")] = signature;
    return json(decTxInfo)

end
function handleBuilderFeeApproval(self::Lighter, accountIndex, apiKeyIndex)
    buildFee = self.safeBool(self.options, "builderFee", defaultValue = true);
    if functions.ccxtruthy(!functions.ccxtruthy(buildFee))
            return false
    end
    approvedBuilderFee = self.safeBool(self.options, "approvedBuilderFee", defaultValue = false);
    if functions.ccxtruthy(approvedBuilderFee)
            return true
    end
    try
        builder = safeInteger(self.options, "integratorAccountIndex", 718718);
        takerFeeRate = safeInteger(self.options, "integratorTakerFee", 1000);
        makerFeeRate = safeInteger(self.options, "integratorMakerFee", 1000);
        Base.fetch(self.approveBuilderFee(builder, takerFeeRate, makerFeeRate, accountIndex, apiKeyIndex));
        self.options[Symbol("approvedBuilderFee")] = true;
    catch e
        self.options[Symbol("builderFee")] = false;

    end
    return true

end
function approveBuilderFee(self::Lighter, builder, takerFeeRate, makerFeeRate, accountIndex, apiKeyIndex; params=Dict())
    strAccountIndex = numberToString(accountIndex);
    strApiKeyIndex = numberToString(apiKeyIndex);
    signer = Base.fetch(self.loadAccount(get(self.options, Symbol("chainId"), nothing), self.getLighterPrivateKey(strAccountIndex, strApiKeyIndex), strApiKeyIndex, strAccountIndex, params = params));
    nonce = Base.fetch(self.fetchNonce(accountIndex, apiKeyIndex, params = extend(params, Dict{Symbol, Any}(
        Symbol("skipNonce") => false
    ))));
    expiry = milliseconds() + 365 * 864000;
    signRaw = Dict{Symbol, Any}(
        Symbol("integrator_account_index") => builder,
        Symbol("integrator_taker_fee") => takerFeeRate,
        Symbol("integrator_maker_fee") => makerFeeRate,
        Symbol("approval_expiry") => expiry,
        Symbol("nonce") => nonce,
        Symbol("api_key_index") => apiKeyIndex,
        Symbol("account_index") => accountIndex
    );
    (txType, txInfo, messageToSign) = self.lighterSignApproveIntegrator(signer, extend(signRaw, params));
    newTxInfo = self.signL1AndPrepareTxInfo(txInfo, messageToSign, self.privateKey);
    request = Dict{Symbol, Any}(
        Symbol("tx_type") => txType,
        Symbol("tx_info") => newTxInfo
    );
    response = Base.fetch(self.publicPostSendTx(request));
    return response

end
function changeApiKey(self::Lighter; params=Dict())
    apiKeyIndex = nothing;
    (apiKeyIndex, params) = self.handleApiKeyIndex(params, "changeApiKey", "apiKeyIndex", "api_key_index");
    accountIndex = nothing;
    (accountIndex, params) = Base.fetch(self.handleAccountIndex(params, "changeApiKey", "accountIndex", "account_index"));
    strAccountIndex = numberToString(accountIndex);
    strApiKeyIndex = numberToString(apiKeyIndex);
    signerNotLoad = get(get(get(get(self.options, Symbol("auths"), nothing), Symbol(strAccountIndex), nothing), Symbol(strApiKeyIndex), nothing), Symbol("signer"), nothing);
    (privateKey, publicKey) = self.lighterGenerateApiKey(signerNotLoad);
    nonce = Base.fetch(self.fetchNonce(accountIndex, apiKeyIndex, params = extend(params, Dict{Symbol, Any}(
        Symbol("skipNonce") => false
    ))));
    signRaw = Dict{Symbol, Any}(
        Symbol("pubkey") => self.encode(publicKey),
        Symbol("nonce") => nonce,
        Symbol("api_key_index") => apiKeyIndex,
        Symbol("account_index") => accountIndex
    );
    signer = self.lighterCreateClient(signerNotLoad, get(self.options, Symbol("chainId"), nothing), privateKey, apiKeyIndex, accountIndex);
    (txType, txInfo, messageToSign) = self.lighterSignChangePubkey(signer, extend(signRaw, params));
    newTxInfo = self.signL1AndPrepareTxInfo(txInfo, messageToSign, self.privateKey);
    request = Dict{Symbol, Any}(
        Symbol("tx_type") => txType,
        Symbol("tx_info") => newTxInfo
    );
    Base.fetch(self.publicPostSendTx(request));
    self.options[Symbol("auths")][Symbol(strAccountIndex)][Symbol(strApiKeyIndex)][Symbol("lighterPrivateKey")] = privateKey;
    self.options[Symbol("auths")][Symbol(strAccountIndex)][Symbol(strApiKeyIndex)][Symbol("signer")] = signer;
    Base.fetch(self.handleBuilderFeeApproval(accountIndex, apiKeyIndex));
    return signer

end
function setSandboxMode(self::Lighter, enable)
    setSandboxMode(self.parent, enable);
    self.options[Symbol("sandboxMode")] = enable;
    self.options[Symbol("chainId")] = functions.ccxtruthy(enable) ? 300 : 304;

end
function createOrderRequest(self::Lighter, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(type_var == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a type argument")));
    end
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a side argument")));
    end
    if functions.ccxtruthy(price == nothing)
        throw(ArgumentsRequired(string(self.id, " createOrder() requires a price argument")));
    end
    reduceOnly = self.safeBool2(params, "reduceOnly", "reduce_only", defaultValue = false);
    orderType = uppercase(type_var);
    market = self.market(symbol);
    orderSide = uppercase(side);
    request = Dict{Symbol, Any}(
        Symbol("market_index") => self.parseToInt(get(market, Symbol("id"), nothing))
    );
    nonce = nothing;
    apiKeyIndex = nothing;
    accountIndex = nothing;
    orderExpiry = nothing;
    (apiKeyIndex, params) = self.handleApiKeyIndex(params, "createOrder", "apiKeyIndex", "api_key_index");
    (accountIndex, params) = self.handleOptionAndParams2(params, "createOrder", "accountIndex", "account_index");
    (nonce, params) = self.handleOptionAndParams(params, "createOrder", "nonce");
    (orderExpiry, params) = self.handleOptionAndParams(params, "createOrder", "orderExpiry", defaultValue = 0);
    if functions.ccxtruthy(nonce != nothing)
        request[Symbol("nonce")] = nonce;
    end
    request[Symbol("api_key_index")] = apiKeyIndex;
    request[Symbol("account_index")] = self.parseToInt(accountIndex);
    triggerPrice = safeString2(params, "triggerPrice", "stopPrice");
    stopLossPrice = safeValue(params, "stopLossPrice", triggerPrice);
    takeProfitPrice = safeValue(params, "takeProfitPrice");
    stopLoss = safeValue(params, "stopLoss");
    takeProfit = safeValue(params, "takeProfit");
    hasStopLoss = (stopLoss != nothing);
    hasTakeProfit = (takeProfit != nothing);
    isConditional = (@functions.ccxt_or(stopLossPrice, takeProfitPrice));
    isMarketOrder = (orderType == "MARKET");
    timeInForce = safeStringLower(params, "timeInForce", "gtt");
    postOnly = self.isPostOnly(isMarketOrder, nothing, params = params);
    params = omit(params, ["stopLoss", "takeProfit", "timeInForce"]);
    orderTypeNum = nothing;
    timeInForceNum = nothing;
    if functions.ccxtruthy(isMarketOrder)
        orderTypeNum = 1;
        timeInForceNum = 0;
    else
        orderTypeNum = 0;
    end
    if functions.ccxtruthy(orderSide == "BUY")
        request[Symbol("is_ask")] = 0;
    else
        request[Symbol("is_ask")] = 1;
    end
    if functions.ccxtruthy(postOnly)
        timeInForceNum = 2;
    else
        if functions.ccxtruthy(!functions.ccxtruthy(isMarketOrder))
            if functions.ccxtruthy(timeInForce == "ioc")
                timeInForceNum = 0;
                orderExpiry = 0;
            elseif functions.ccxtruthy(timeInForce == "gtt")
                timeInForceNum = 1;
                orderExpiry = -1;
            end
        end
    end
    marketInfo = self.safeDict(market, "info", defaultValue = Dict{Symbol, Any}());
    amountStr = nothing;
    priceStr = self.priceToPrecision(symbol, price);
    amountScale = self.pow("10", get(marketInfo, Symbol("size_decimals"), nothing));
    priceScale = self.pow("10", get(marketInfo, Symbol("price_decimals"), nothing));
    triggerPriceStr = "0";
    defaultClientOrderId = self.randNumber(9);
    clientOrderId = safeInteger2(params, "client_order_index", "clientOrderId", defaultClientOrderId);
    params = omit(params, ["reduceOnly", "reduce_only", "timeInForce", "postOnly", "nonce", "apiKeyIndex", "stopPrice", "triggerPrice", "stopLossPrice", "takeProfitPrice", "client_order_index", "clientOrderId"]);
    if functions.ccxtruthy(isConditional)
        amountStr = numberToString(amount);
        if functions.ccxtruthy(stopLossPrice != nothing)
            if functions.ccxtruthy(isMarketOrder)
                orderTypeNum = 2;
            else
                orderTypeNum = 3;
            end
            triggerPriceStr = self.priceToPrecision(symbol, stopLossPrice);
        elseif functions.ccxtruthy(takeProfitPrice != nothing)
            if functions.ccxtruthy(isMarketOrder)
                orderTypeNum = 4;
            else
                orderTypeNum = 5;
            end
            triggerPriceStr = self.priceToPrecision(symbol, takeProfitPrice);
        end
    else
        amountStr = self.amountToPrecision(symbol, amount);
    end
    request[Symbol("order_expiry")] = orderExpiry;
    request[Symbol("order_type")] = orderTypeNum;
    request[Symbol("time_in_force")] = timeInForceNum;
    request[Symbol("reduce_only")] = functions.ccxtruthy((reduceOnly)) ? 1 : 0;
    request[Symbol("client_order_index")] = clientOrderId;
    request[Symbol("base_amount")] = self.parseToInt(stringMul(amountStr, amountScale));
    request[Symbol("avg_execution_price")] = self.parseToInt(stringMul(priceStr, priceScale));
    request[Symbol("trigger_price")] = self.parseToInt(stringMul(triggerPriceStr, priceScale));
    if functions.ccxtruthy(self.safeBool(self.options, "builderFee", defaultValue = true))
        request[Symbol("integrator_account_index")] = get(self.options, Symbol("integratorAccountIndex"), nothing);
        request[Symbol("integrator_taker_fee")] = get(self.options, Symbol("integratorTakerFee"), nothing);
        request[Symbol("integrator_maker_fee")] = get(self.options, Symbol("integratorMakerFee"), nothing);
    end
    orders = [];
    push!(orders, extend(request, params));
    if functions.ccxtruthy(@functions.ccxt_or(hasStopLoss, hasTakeProfit))
        orders[1][Symbol("client_order_index")] = 0;
        triggerOrderSide = "";
        if functions.ccxtruthy(side == "BUY")
            triggerOrderSide = "sell";
        else
            triggerOrderSide = "buy";
        end
        stopLossOrderTriggerPrice = self.safeNumber2(stopLoss, "triggerPrice", "stopPrice");
        stopLossOrderType = safeString(stopLoss, "type", "limit");
        stopLossOrderLimitPrice = self.safeNumber2(stopLoss, "price", "stopLossPrice", d = stopLossOrderTriggerPrice);
        takeProfitOrderTriggerPrice = self.safeNumber2(takeProfit, "triggerPrice", "stopPrice");
        takeProfitOrderType = safeString(takeProfit, "type", "limit");
        takeProfitOrderLimitPrice = self.safeNumber2(takeProfit, "price", "takeProfitPrice", d = takeProfitOrderTriggerPrice);
        if functions.ccxtruthy(stopLoss != nothing)
            orderObj = get(self.createOrderRequest(symbol, stopLossOrderType, triggerOrderSide, 0, price = stopLossOrderLimitPrice, params = extend(params, Dict{Symbol, Any}(
                Symbol("stopLossPrice") => stopLossOrderTriggerPrice,
                Symbol("reduceOnly") => true
            ))), 1, nothing);
            orderObj[Symbol("client_order_index")] = 0;
                        push!(orders, orderObj);
        end
        if functions.ccxtruthy(takeProfit != nothing)
            orderObj = get(self.createOrderRequest(symbol, takeProfitOrderType, triggerOrderSide, 0, price = takeProfitOrderLimitPrice, params = extend(params, Dict{Symbol, Any}(
                Symbol("takeProfitPrice") => takeProfitOrderTriggerPrice,
                Symbol("reduceOnly") => true
            ))), 1, nothing);
            orderObj[Symbol("client_order_index")] = 0;
                        push!(orders, orderObj);
        end
    end
    return orders

end
function fetchNonce(self::Lighter, accountIndex, apiKeyIndex; params=Dict())
    if functions.ccxtruthy(@functions.ccxt_or((accountIndex == nothing), (apiKeyIndex == nothing)))
        throw(ArgumentsRequired(string(self.id, " fetchNonce() requires accountIndex and apiKeyIndex.")));
    end
    if functions.ccxtruthy(ccxt_in("nonce", params))
            return safeInteger(params, "nonce")
    end
    nonceInOptions = safeInteger(self.options, "nonce");
    if functions.ccxtruthy(nonceInOptions != nothing)
            return nonceInOptions
    end
    skipNonce = true;
    (skipNonce, params) = self.handleOptionAndParams(params, "fetchNonce", "skipNonce", defaultValue = true);
    if functions.ccxtruthy(skipNonce)
            return milliseconds()
    end
    response = Base.fetch(self.publicGetNextNonce(Dict{Symbol, Any}(
        Symbol("account_index") => accountIndex,
        Symbol("api_key_index") => apiKeyIndex
    )));
    return safeInteger(response, "nonce")

end
"""
create a trade order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.timeInForce`::string, optional: 'GTT' or 'IOC', default is 'GTT'
- `params.clientOrderId`::int, optional: client order id, should be unique for each order, default is a random number
- `params.triggerPrice`::string, optional: trigger price for stop loss or take profit orders, in units of the quote currency
- `params.reduceOnly`::bool, optional: whether the order is reduce only, default false
- `params.nonce`::int, optional: nonce for the account
- `params.apiKeyIndex`::int, optional: apiKeyIndex
- `params.accountIndex`::int, optional: accountIndex
- `params.orderExpiry`::int, optional: orderExpiry

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrder(self::Lighter, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    accountIndex = nothing;
    (accountIndex, params) = Base.fetch(self.handleAccountIndex(params, "createOrder", "accountIndex", "account_index"));
    params[Symbol("accountIndex")] = accountIndex;
    market = self.market(symbol);
    groupingType = nothing;
    (groupingType, params) = self.handleOptionAndParams(params, "createOrder", "groupingType", defaultValue = 3);
    orderRequests = self.createOrderRequest(symbol, type_var, side, amount, price = price, params = params);
    totalOrderRequests = length(orderRequests);
    apiKeyIndex = nothing;
    order = nothing;
    if functions.ccxtruthy(functions.ccxt_gt(totalOrderRequests, 0))
        order = get(orderRequests, 1, nothing);
        apiKeyIndex = get(order, Symbol("api_key_index"), nothing);
    end
    strAccountIndex = numberToString(accountIndex);
    strApiKeyIndex = numberToString(apiKeyIndex);
    signer = Base.fetch(self.loadAccount(get(self.options, Symbol("chainId"), nothing), self.getLighterPrivateKey(strAccountIndex, strApiKeyIndex), strApiKeyIndex, strAccountIndex, params = params));
    if functions.ccxtruthy(safeInteger(order, "nonce") == nothing)
        order[Symbol("nonce")] = Base.fetch(self.fetchNonce(accountIndex, apiKeyIndex));
    end
    txType = nothing;
    if functions.ccxtruthy(functions.ccxt_lt(totalOrderRequests, 2))
        (txType, txInfo) = self.lighterSignCreateOrder(signer, order);
    else
        signingPayload = Dict{Symbol, Any}(
            Symbol("grouping_type") => groupingType,
            Symbol("orders") => orderRequests,
            Symbol("nonce") => get(order, Symbol("nonce"), nothing),
            Symbol("api_key_index") => apiKeyIndex,
            Symbol("account_index") => accountIndex
        );
        if functions.ccxtruthy(self.safeBool(self.options, "builderFee", defaultValue = true))
            signingPayload[Symbol("integrator_account_index")] = get(order, Symbol("integrator_account_index"), nothing);
            signingPayload[Symbol("integrator_taker_fee")] = get(order, Symbol("integrator_taker_fee"), nothing);
            signingPayload[Symbol("integrator_maker_fee")] = get(order, Symbol("integrator_maker_fee"), nothing);
        end
        (txType, txInfo) = self.lighterSignCreateGroupedOrders(signer, signingPayload);
    end
    request = Dict{Symbol, Any}(
        Symbol("tx_type") => txType,
        Symbol("tx_info") => txInfo
    );
    response = Base.fetch(self.publicPostSendTx(request));
    return self.parseOrder(deepExtend(response, order), market = market)

end
"""
cancels an order and places a new order

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of the currency you want to trade in units of the base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountIndex`::string, optional: account index
- `params.apiKeyIndex`::string, optional: api key index

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function editOrder(self::Lighter, id, symbol, type_var, side; amount=nothing, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    apiKeyIndex = nothing;
    (apiKeyIndex, params) = self.handleApiKeyIndex(params, "editOrder", "apiKeyIndex", "api_key_index");
    accountIndex = nothing;
    (accountIndex, params) = Base.fetch(self.handleAccountIndex(params, "editOrder", "accountIndex", "account_index"));
    strAccountIndex = numberToString(accountIndex);
    strApiKeyIndex = numberToString(apiKeyIndex);
    signer = Base.fetch(self.loadAccount(get(self.options, Symbol("chainId"), nothing), self.getLighterPrivateKey(strAccountIndex, strApiKeyIndex), strApiKeyIndex, strAccountIndex, params = params));
    market = self.market(symbol);
    marketInfo = self.safeDict(market, "info", defaultValue = Dict{Symbol, Any}());
    amountScale = self.pow("10", get(marketInfo, Symbol("size_decimals"), nothing));
    priceScale = self.pow("10", get(marketInfo, Symbol("price_decimals"), nothing));
    triggerPrice = safeStringN(params, ["stopPrice", "triggerPrice", "stopLossPrice", "takeProfitPrice"]);
    params = omit(params, ["stopPrice", "triggerPrice", "stopLossPrice", "takeProfitPrice"]);
    amountStr = nothing;
    priceStr = self.priceToPrecision(symbol, price);
    triggerPriceStr = "0";
    if functions.ccxtruthy(triggerPrice != nothing)
        amountStr = numberToString(amount);
        triggerPriceStr = self.priceToPrecision(symbol, triggerPrice);
    else
        amountStr = self.amountToPrecision(symbol, amount);
    end
    nonce = Base.fetch(self.fetchNonce(accountIndex, apiKeyIndex, params = params));
    signRaw = Dict{Symbol, Any}(
        Symbol("market_index") => self.parseToInt(get(market, Symbol("id"), nothing)),
        Symbol("index") => self.parseToInt(id),
        Symbol("base_amount") => self.parseToInt(stringMul(amountStr, amountScale)),
        Symbol("price") => self.parseToInt(stringMul(priceStr, priceScale)),
        Symbol("trigger_price") => self.parseToInt(stringMul(triggerPriceStr, priceScale)),
        Symbol("nonce") => nonce,
        Symbol("api_key_index") => apiKeyIndex,
        Symbol("account_index") => accountIndex
    );
    if functions.ccxtruthy(self.safeBool(self.options, "builderFee", defaultValue = true))
        signRaw[Symbol("integrator_account_index")] = get(self.options, Symbol("integratorAccountIndex"), nothing);
        signRaw[Symbol("integrator_taker_fee")] = get(self.options, Symbol("integratorTakerFee"), nothing);
        signRaw[Symbol("integrator_maker_fee")] = get(self.options, Symbol("integratorMakerFee"), nothing);
    end
    (txType, txInfo) = self.lighterSignModifyOrder(signer, extend(signRaw, params));
    request = Dict{Symbol, Any}(
        Symbol("tx_type") => txType,
        Symbol("tx_info") => txInfo
    );
    response = Base.fetch(self.publicPostSendTx(request));
    return self.parseOrder(response, market = market)

end
"""
the latest known information on the availability of the exchange API
see: https://apidocs.lighter.xyz/reference/status

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
"""
function fetchStatus(self::Lighter; params=Dict())
    response = Base.fetch(self.rootGet(params));
    status = safeString(response, "status");
    return Dict{Symbol, Any}(
    Symbol("status") => functions.ccxtruthy((status == "200")) ? "ok" : "error",
    Symbol("updated") => nothing,
    Symbol("eta") => nothing,
    Symbol("url") => nothing,
    Symbol("info") => response
)

end
"""
fetches the current integer timestamp in milliseconds from the exchange server
see: https://apidocs.lighter.xyz/reference/status

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
function fetchTime(self::Lighter; params=Dict())
    response = Base.fetch(self.rootGet(params));
    return safeTimestamp(response, "timestamp")

end
"""
retrieves data on all markets for lighter
see: https://apidocs.lighter.xyz/reference/orderbookdetails

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Lighter; params=Dict())
    response = Base.fetch(self.publicGetOrderBookDetails(params));
    spotMarkets = self.safeList(response, "spot_order_book_details", defaultValue = []);
    swapMarkets = self.safeList(response, "order_book_details", defaultValue = []);
    markets = arrayConcat(spotMarkets, swapMarkets);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(markets)))
        market = get(markets, i + 1, nothing);
        id = safeString(market, "market_id");
        type_var = safeString(market, "market_type");
        type_var = functions.ccxtruthy((type_var == "perp")) ? "swap" : type_var;
        baseId = safeString(market, "symbol");
        if functions.ccxtruthy(@functions.ccxt_and(baseId != nothing, findfirst("/", baseId) !== nothing))
            baseId = get(split(baseId, "/"), 1, nothing);
        end
        quoteId = "USDC";
        settleId = functions.ccxtruthy((type_var == "swap")) ? "USDC" : nothing;
        base = self.safeCurrencyCode(baseId);
        quote_var = self.safeCurrencyCode(quoteId);
        settle = self.safeCurrencyCode(settleId);
        symbol = string(base, "/", quote_var);
        if functions.ccxtruthy(settle != nothing)
            symbol = string(symbol, ":", settle);
        end
        amountDecimals = safeString2(market, "size_decimals", "supported_size_decimals");
        priceDecimals = safeString2(market, "price_decimals", "supported_price_decimals");
        amountPrecision = functions.ccxtruthy((amountDecimals == nothing)) ? nothing : self.parseNumber(self.parsePrecision(precision = amountDecimals));
        pricePrecision = functions.ccxtruthy((priceDecimals == nothing)) ? nothing : self.parseNumber(self.parsePrecision(precision = priceDecimals));
        quoteMultiplier = self.safeNumber(market, "quote_multiplier");
        push!(result, Dict{Symbol, Any}(
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
    Symbol("margin") => false,
    Symbol("swap") => type_var == "swap",
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => safeString(market, "status") == "active",
    Symbol("contract") => type_var == "swap",
    Symbol("linear") => functions.ccxtruthy((type_var == "swap")) ? true : nothing,
    Symbol("inverse") => functions.ccxtruthy((type_var == "swap")) ? false : nothing,
    Symbol("taker") => self.safeNumber(market, "taker_fee"),
    Symbol("maker") => self.safeNumber(market, "maker_fee"),
    Symbol("contractSize") => quoteMultiplier,
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
            Symbol("min") => self.safeNumber(market, "min_base_amount"),
            Symbol("max") => nothing
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "min_quote_amount"),
            Symbol("max") => self.safeNumber(market, "order_quote_limit")
        )
    ),
    Symbol("created") => nothing,
    Symbol("info") => market
));
        i += 1
    end
    return result

end
"""
fetches all available currencies on an exchange
see: https://apidocs.lighter.xyz/reference/assetdetails

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
function fetchCurrencies(self::Lighter; params=Dict())
    response = Base.fetch(self.publicGetAssetDetails(params));
    if functions.ccxtruthy(self.checkRequiredCredentials(error = false))
        Base.fetch(self.preLoadLighterLibrary());
    end
    data = self.safeList(response, "asset_details", defaultValue = []);
    return self.parseCurrencies(data)

end
function parseCurrency(self::Lighter, rawCurrency)
    id = safeString(rawCurrency, "asset_id");
    code = self.safeCurrencyCode(safeString(rawCurrency, "symbol"));
    decimals = safeString(rawCurrency, "decimals");
    isUSDC = (code == "USDC");
    depositMin = nothing;
    withdrawMin = nothing;
    if functions.ccxtruthy(isUSDC)
        depositMin = self.safeNumber(rawCurrency, "min_transfer_amount");
        withdrawMin = self.safeNumber(rawCurrency, "min_withdrawal_amount");
    end
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("name") => code,
    Symbol("code") => code,
    Symbol("precision") => self.parseNumber(string("1e-", decimals)),
    Symbol("active") => true,
    Symbol("fee") => nothing,
    Symbol("networks") => Dict{Symbol, Any}(),
    Symbol("deposit") => isUSDC,
    Symbol("withdraw") => isUSDC,
    Symbol("type") => "crypto",
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("deposit") => Dict{Symbol, Any}(
            Symbol("min") => depositMin,
            Symbol("max") => nothing
        ),
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("min") => withdrawMin,
            Symbol("max") => nothing
        )
    ),
    Symbol("info") => rawCurrency
))

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://apidocs.lighter.xyz/reference/orderbookorders

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Lighter, symbol; limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOrderBook() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market_id") => get(market, Symbol("id"), nothing),
        Symbol("limit") => 100
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 100);
    end
    response = Base.fetch(self.publicGetOrderBookOrders(extend(request, params)));
    result = self.parseOrderBook(response, get(market, Symbol("symbol"), nothing), timestamp = nothing, bidsKey = "bids", asksKey = "asks", priceKey = "price", amountKey = "remaining_base_amount");
    return result

end
function parseTicker(self::Lighter, ticker; market=nothing)
    marketId = safeString(ticker, "market_id");
    market = self.safeMarket(marketId = marketId, market = market);
    symbol = get(market, Symbol("symbol"), nothing);
    last_var = safeString(ticker, "last_trade_price");
    high = safeString(ticker, "daily_price_high");
    low = safeString(ticker, "daily_price_low");
    baseVolume = safeString(ticker, "daily_base_token_volume");
    quoteVolume = safeString(ticker, "daily_quote_token_volume");
    change = safeString(ticker, "daily_price_change");
    openInterest = safeString(ticker, "open_interest");
    return self.safeTicker(Dict{Symbol, Any}(
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
    Symbol("open") => nothing,
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => change,
    Symbol("average") => nothing,
    Symbol("baseVolume") => baseVolume,
    Symbol("quoteVolume") => quoteVolume,
    Symbol("markPrice") => safeString(ticker, "mark_price"),
    Symbol("indexPrice") => safeString(ticker, "index_price"),
    Symbol("openInterest") => openInterest,
    Symbol("info") => ticker
), market = market)

end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://apidocs.lighter.xyz/reference/orderbookdetails

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTicker(self::Lighter, symbol; params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchTicker() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market_id") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetOrderBookDetails(extend(request, params)));
    spotTickers = self.safeList(response, "spot_order_book_details", defaultValue = []);
    swapTickers = self.safeList(response, "order_book_details", defaultValue = []);
    tickers = arrayConcat(spotTickers, swapTickers);
    first_var = self.safeDict(tickers, 0, defaultValue = Dict{Symbol, Any}());
    return self.parseTicker(first_var, market = market)

end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://apidocs.lighter.xyz/reference/orderbookdetails

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTickers(self::Lighter; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols);
    response = Base.fetch(self.publicGetOrderBookDetails(params));
    spotTickers = self.safeList(response, "spot_order_book_details", defaultValue = []);
    swapTickers = self.safeList(response, "order_book_details", defaultValue = []);
    tickers = arrayConcat(spotTickers, swapTickers);
    return self.parseTickers(tickers, symbols = symbols)

end
function parseOHLCV(self::Lighter, ohlcv; market=nothing)
    return [safeInteger(ohlcv, "t"), self.safeNumber(ohlcv, "o"), self.safeNumber(ohlcv, "h"), self.safeNumber(ohlcv, "l"), self.safeNumber(ohlcv, "c"), self.safeNumber(ohlcv, "v")]

end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://apidocs.lighter.xyz/reference/candles

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest candle to fetch

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchOHLCV(self::Lighter, symbol; timeframe="1h", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOHLCV() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    until = safeInteger(params, "until");
    params = omit(params, ["until"]);
    now = milliseconds();
    startTs = nothing;
    endTs = nothing;
    if functions.ccxtruthy(since != nothing)
        startTs = since;
        if functions.ccxtruthy(until != nothing)
            endTs = until;
        elseif functions.ccxtruthy(limit != nothing)
            duration = self.parseTimeframe(timeframe);
            endTs = self.sum(since, duration * limit * 1000);
        else
            endTs = now;
        end
    else
        endTs = functions.ccxtruthy((until != nothing)) ? until : now;
        defaultLimit = 100;
        if functions.ccxtruthy(limit != nothing)
            startTs = endTs - self.parseTimeframe(timeframe) * 1000 * limit;
        else
            startTs = endTs - self.parseTimeframe(timeframe) * 1000 * defaultLimit;
        end
    end
    request = Dict{Symbol, Any}(
        Symbol("market_id") => get(market, Symbol("id"), nothing),
        Symbol("count_back") => 0,
        Symbol("resolution") => safeString(self.timeframes, timeframe, timeframe),
        Symbol("start_timestamp") => startTs,
        Symbol("end_timestamp") => endTs
    );
    response = Base.fetch(self.publicGetCandles(extend(request, params)));
    ohlcvs = self.safeList(response, "c", defaultValue = []);
    return self.parseOHLCVs(ohlcvs, market = market, timeframe = timeframe, since = since, limit = limit)

end
function parseFundingRate(self::Lighter, contract; market=nothing)
    marketId = safeString(contract, "market_id");
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("markPrice") => nothing,
    Symbol("indexPrice") => nothing,
    Symbol("interestRate") => nothing,
    Symbol("estimatedSettlePrice") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("fundingRate") => self.safeNumber(contract, "rate"),
    Symbol("fundingTimestamp") => nothing,
    Symbol("fundingDatetime") => nothing,
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
fetch the current funding rate for multiple symbols
see: https://apidocs.lighter.xyz/reference/funding-rates

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
function fetchFundingRates(self::Lighter; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.publicGetFundingRates(extend(params)));
    data = self.safeList(response, "funding_rates", defaultValue = []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        exchange = safeString(get(data, i + 1, nothing), "exchange");
        if functions.ccxtruthy(exchange == "lighter")
                        push!(result, get(data, i + 1, nothing));
        end
        i += 1
    end
    return self.parseFundingRates(result, symbols = symbols)

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://apidocs.lighter.xyz/reference/account-1

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.by`::string, optional: fetch balance by 'index' or 'l1_address', defaults to 'index'
- `params.value`::string, optional: fetch balance value, account index or l1 address
- `params.type`::string, optional: 'spot', 'swap', default is 'swap'

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Lighter; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    accountIndex = nothing;
    (accountIndex, params) = Base.fetch(self.handleAccountIndex(params, "fetchBalance", "accountIndex", "account_index"));
    defaultType = safeString2(self.options, "fetchBalance", "defaultType", "spot");
    type_var = safeString(params, "type", defaultType);
    request = Dict{Symbol, Any}(
        Symbol("by") => safeString(params, "by", "index"),
        Symbol("value") => accountIndex
    );
    response = Base.fetch(self.publicGetAccount(extend(request, params)));
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    accounts = self.safeList(response, "accounts", defaultValue = []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(accounts)))
        account = get(accounts, i + 1, nothing);
        if functions.ccxtruthy(type_var == "spot")
            assets = self.safeList(account, "assets", defaultValue = []);
            j = 0
            while functions.ccxtruthy(functions.ccxt_lt(j, length(assets)))
                asset = get(assets, j + 1, nothing);
                codeId = safeString(asset, "symbol");
                code = self.safeCurrencyCode(codeId);
                balance = self.safeDict(result, code, defaultValue = self.account());
                balance[Symbol("total")] = stringAdd(get(balance, Symbol("total"), nothing), safeString(asset, "balance"));
                balance[Symbol("used")] = stringAdd(get(balance, Symbol("used"), nothing), safeString(asset, "locked_balance"));
                if functions.ccxtruthy(code != nothing)
                    result[Symbol(code)] = balance;
                end
                j += 1
            end

        else
            perpBalance = self.safeDict(result, "USDC", defaultValue = self.account());
            perpTotal = safeString(perpBalance, "total", "0");
            perpFree = safeString(perpBalance, "free", "0");
            perpUSDCTotal = safeString(account, "collateral", "0");
            perpUSDCFree = safeString(account, "available_balance", "0");
            perpBalance[Symbol("total")] = stringAdd(perpTotal, perpUSDCTotal);
            perpBalance[Symbol("free")] = stringAdd(perpFree, perpUSDCFree);
            result[Symbol("USDC")] = perpBalance;
        end
        i += 1
    end
    return self.safeBalance(result)

end
"""
fetch data on an open position
see: https://apidocs.lighter.xyz/reference/account-1

# Arguments
- `symbol`::string: unified market symbol of the market the position is held in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.by`::string, optional: fetch balance by 'index' or 'l1_address', defaults to 'index'
- `params.value`::string, optional: fetch balance value, account index or l1 address

# Returns
- a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPosition(self::Lighter, symbol; params=Dict())
    positions = Base.fetch(self.fetchPositions(symbols = [symbol], params = params));
    return self.safeDict(positions, 0, defaultValue = Dict{Symbol, Any}())

end
"""
fetch all open positions
see: https://apidocs.lighter.xyz/reference/account-1

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.by`::string, optional: fetch balance by 'index' or 'l1_address', defaults to 'index'
- `params.value`::string, optional: fetch balance value, account index or l1 address

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPositions(self::Lighter; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    accountIndex = nothing;
    (accountIndex, params) = Base.fetch(self.handleAccountIndex(params, "fetchPositions", "accountIndex", "account_index"));
    request = Dict{Symbol, Any}(
        Symbol("by") => safeString(params, "by", "index"),
        Symbol("value") => accountIndex
    );
    response = Base.fetch(self.publicGetAccount(extend(request, params)));
    allPositions = [];
    accounts = self.safeList(response, "accounts", defaultValue = []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(accounts)))
        account = get(accounts, i + 1, nothing);
        positions = self.safeList(account, "positions", defaultValue = []);
        j = 0
        while functions.ccxtruthy(functions.ccxt_lt(j, length(positions)))
            push!(allPositions, get(positions, j + 1, nothing));
            j += 1
        end
        i += 1
    end
    return self.parsePositions(allPositions, symbols = symbols)

end
function parsePosition(self::Lighter, position; market=nothing)
    marketId = safeString(position, "market_id");
    market = self.safeMarket(marketId = marketId, market = market);
    sign_var = safeInteger(position, "sign");
    side = nothing;
    if functions.ccxtruthy(sign_var != nothing)
        side = functions.ccxtruthy((sign_var == 1)) ? "long" : "short";
    end
    marginModeId = safeInteger(position, "margin_mode");
    marginMode = nothing;
    if functions.ccxtruthy(marginModeId != nothing)
        marginMode = functions.ccxtruthy((marginModeId == 0)) ? "cross" : "isolated";
    end
    imfStr = safeString(position, "initial_margin_fraction");
    leverage = nothing;
    if functions.ccxtruthy(imfStr != nothing)
        imf = self.parseToInt(imfStr);
        if functions.ccxtruthy(functions.ccxt_gt(imf, 0))
            leverage = 100 / imf;
        end
    end
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => nothing,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("isolated") => (marginMode == "isolated"),
    Symbol("hedged") => nothing,
    Symbol("side") => side,
    Symbol("contracts") => self.safeNumber(position, "position"),
    Symbol("contractSize") => nothing,
    Symbol("entryPrice") => self.safeNumber(position, "avg_entry_price"),
    Symbol("markPrice") => nothing,
    Symbol("notional") => self.safeNumber(position, "position_value"),
    Symbol("leverage") => leverage,
    Symbol("collateral") => self.safeNumber(position, "allocated_margin"),
    Symbol("initialMargin") => nothing,
    Symbol("maintenanceMargin") => nothing,
    Symbol("initialMarginPercentage") => nothing,
    Symbol("maintenanceMarginPercentage") => nothing,
    Symbol("unrealizedPnl") => self.safeNumber(position, "unrealized_pnl"),
    Symbol("liquidationPrice") => self.safeNumber(position, "liquidation_price"),
    Symbol("marginMode") => marginMode,
    Symbol("percentage") => nothing
))

end
"""
fetch all the accounts associated with a profile
see: https://apidocs.lighter.xyz/reference/account-1

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.by`::string, optional: fetch balance by 'index' or 'l1_address', defaults to 'index'
- `params.value`::string, optional: fetch balance value, account index or l1 address

# Returns
- a dictionary of [account structures]{@link https://docs.ccxt.com/?id=accounts-structure} indexed by the account type
"""
function fetchAccounts(self::Lighter; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    accountIndex = nothing;
    (accountIndex, params) = Base.fetch(self.handleAccountIndex(params, "fetchAccounts", "accountIndex", "account_index"));
    request = Dict{Symbol, Any}(
        Symbol("by") => safeString(params, "by", "index"),
        Symbol("value") => accountIndex
    );
    response = Base.fetch(self.publicGetAccount(extend(request, params)));
    accounts = self.safeList(response, "accounts", defaultValue = []);
    return self.parseAccounts(accounts, params = params)

end
function parseAccount(self::Lighter, account)
    accountType = safeString(account, "account_type");
    return Dict{Symbol, Any}(
    Symbol("id") => safeString(account, "account_index"),
    Symbol("type") => functions.ccxtruthy((accountType == "0")) ? "main" : "subaccount",
    Symbol("code") => nothing,
    Symbol("info") => account
)

end
"""
fetch all unfilled currently open orders
see: https://apidocs.lighter.xyz/reference/accountactiveorders

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountIndex`::string, optional: account index

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Lighter; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOpenOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    accountIndex = nothing;
    (accountIndex, params) = Base.fetch(self.handleAccountIndex(params, "fetchOpenOrders", "accountIndex", "account_index"));
    apiKeyIndex = nothing;
    (apiKeyIndex, params) = self.handleApiKeyIndex(params, "fetchOpenOrders", "apiKeyIndex", "api_key_index");
    strAccountIndex = numberToString(accountIndex);
    strApiKeyIndex = numberToString(apiKeyIndex);
    Base.fetch(self.loadAccount(get(self.options, Symbol("chainId"), nothing), self.getLighterPrivateKey(strAccountIndex, strApiKeyIndex), strApiKeyIndex, strAccountIndex, params = params));
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market_id") => get(market, Symbol("id"), nothing),
        Symbol("account_index") => accountIndex
    );
    response = Base.fetch(self.privateGetAccountActiveOrders(extend(request, params)));
    data = self.safeList(response, "orders", defaultValue = []);
    return self.parseOrders(data, market = market, since = since, limit = limit)

end
"""
fetch all unfilled currently closed orders
see: https://apidocs.lighter.xyz/reference/accountinactiveorders

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountIndex`::string, optional: account index

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchClosedOrders(self::Lighter; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchClosedOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    accountIndex = nothing;
    (accountIndex, params) = Base.fetch(self.handleAccountIndex(params, "fetchClosedOrders", "accountIndex", "account_index"));
    apiKeyIndex = nothing;
    (apiKeyIndex, params) = self.handleApiKeyIndex(params, "fetchClosedOrders", "apiKeyIndex", "api_key_index");
    strAccountIndex = numberToString(accountIndex);
    strApiKeyIndex = numberToString(apiKeyIndex);
    Base.fetch(self.loadAccount(get(self.options, Symbol("chainId"), nothing), self.getLighterPrivateKey(strAccountIndex, strApiKeyIndex), strApiKeyIndex, strAccountIndex, params = params));
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market_id") => get(market, Symbol("id"), nothing),
        Symbol("account_index") => accountIndex,
        Symbol("limit") => 100
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 100);
    end
    response = Base.fetch(self.privateGetAccountInactiveOrders(extend(request, params)));
    data = self.safeList(response, "orders", defaultValue = []);
    return self.parseOrders(data, market = market, since = since, limit = limit)

end
function parseOrder(self::Lighter, order; market=nothing)
    marketId = safeString(order, "market_index");
    market = self.safeMarket(marketId = marketId, market = market);
    timestamp = safeTimestamp(order, "timestamp");
    isAsk = self.safeBool(order, "is_ask");
    if functions.ccxtruthy(isAsk == nothing)
        isAskAsInteger = safeInteger(order, "is_ask");
        if functions.ccxtruthy(isAskAsInteger != nothing)
            isAsk = isAskAsInteger == 1;
        end
    end
    side = nothing;
    if functions.ccxtruthy(isAsk != nothing)
        side = functions.ccxtruthy(isAsk) ? "sell" : "buy";
    end
    type_var = safeString(order, "type");
    if functions.ccxtruthy(type_var == nothing)
        typeAsInteger = safeInteger(order, "order_type");
        type_var = self.parseOrderTypeInteger(typeAsInteger);
    end
    triggerPrice = self.parseNumber(omitZero(safeString(order, "trigger_price")));
    stopLossPrice = nothing;
    takeProfitPrice = nothing;
    if functions.ccxtruthy(type_var != nothing)
        if functions.ccxtruthy(findfirst("stop-loss", type_var) !== nothing)
            stopLossPrice = triggerPrice;
        end
        if functions.ccxtruthy(findfirst("take-profit", type_var) !== nothing)
            takeProfitPrice = triggerPrice;
        end
    end
    tif = nothing;
    tifAsInteger = safeInteger(order, "time_in_force");
    if functions.ccxtruthy(tifAsInteger != nothing)
        tif = self.parseOrderTimeInForceInteger(tifAsInteger);
    else
        tif = safeString(order, "time_in_force");
    end
    reduceOnly = self.safeBool(order, "reduce_only");
    if functions.ccxtruthy(reduceOnly == nothing)
        reduceOnlyAsInteger = safeInteger(order, "reduce_only");
        if functions.ccxtruthy(reduceOnlyAsInteger != nothing)
            reduceOnly = reduceOnlyAsInteger == 1;
        end
    end
    status = safeString(order, "status");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => safeString(order, "order_id"),
    Symbol("clientOrderId") => omitZero(safeString2(order, "client_order_id", "client_order_index")),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("lastUpdateTimestamp") => safeTimestamp(order, "updated_at"),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("type") => self.parseOrderType(type_var),
    Symbol("timeInForce") => self.parseOrderTimeInForce(tif),
    Symbol("postOnly") => tif == "post-only",
    Symbol("reduceOnly") => reduceOnly,
    Symbol("side") => side,
    Symbol("price") => safeString(order, "price"),
    Symbol("triggerPrice") => triggerPrice,
    Symbol("stopLossPrice") => stopLossPrice,
    Symbol("takeProfitPrice") => takeProfitPrice,
    Symbol("amount") => safeString(order, "initial_base_amount"),
    Symbol("cost") => safeString(order, "filled_quote_amount"),
    Symbol("average") => nothing,
    Symbol("filled") => safeString(order, "filled_base_amount"),
    Symbol("remaining") => safeString(order, "remaining_base_amount"),
    Symbol("status") => self.parseOrderStatus(status),
    Symbol("fee") => nothing,
    Symbol("trades") => nothing
), market = market)

end
function parseOrderStatus(self::Lighter, status)
    statuses = Dict{Symbol, Any}(
        Symbol("in-progress") => "open",
        Symbol("pending") => "open",
        Symbol("open") => "open",
        Symbol("filled") => "closed",
        Symbol("canceled") => "canceled",
        Symbol("canceled-post-only") => "canceled",
        Symbol("canceled-reduce-only") => "canceled",
        Symbol("canceled-position-not-allowed") => "rejected",
        Symbol("canceled-margin-not-allowed") => "rejected",
        Symbol("canceled-too-much-slippage") => "canceled",
        Symbol("canceled-not-enough-liquidity") => "canceled",
        Symbol("canceled-self-trade") => "canceled",
        Symbol("canceled-expired") => "expired",
        Symbol("canceled-oco") => "canceled",
        Symbol("canceled-child") => "canceled",
        Symbol("canceled-liquidation") => "canceled"
    );
    return safeString(statuses, status, status)

end
function parseOrderType(self::Lighter, type_var)
    types = Dict{Symbol, Any}(
        Symbol("limit") => "limit",
        Symbol("market") => "market",
        Symbol("stop-loss") => "market",
        Symbol("stop-loss-limit") => "limit",
        Symbol("take-profit") => "market",
        Symbol("take-profit-limit") => "limit",
        Symbol("twap") => "twap",
        Symbol("twap-sub") => "twap",
        Symbol("liquidation") => "market"
    );
    return safeString(types, type_var, type_var)

end
function parseOrderTypeInteger(self::Lighter, typeInteger)
    if functions.ccxtruthy(typeInteger == nothing)
            return nothing
    end
    types = Dict{Symbol, Any}(
        Symbol("0") => "limit",
        Symbol("1") => "market",
        Symbol("2") => "stop-loss",
        Symbol("3") => "stop-loss-limit",
        Symbol("4") => "take-profit",
        Symbol("5") => "take-profit-limit",
        Symbol("6") => "twap",
        Symbol("7") => "twap-sub",
        Symbol("8") => "liquidation"
    );
    return safeString(types, string(typeInteger))

end
function parseOrderTimeInForce(self::Lighter, tif)
    timeInForces = Dict{Symbol, Any}(
        Symbol("immediate-or-cancel") => "IOC",
        Symbol("good-till-time") => "GTC",
        Symbol("post-only") => "PO",
        Symbol("Unknown") => nothing
    );
    return safeString(timeInForces, tif, tif)

end
function parseOrderTimeInForceInteger(self::Lighter, tifInteger)
    timeInForces = Dict{Symbol, Any}(
        Symbol("0") => "immediate-or-cancel",
        Symbol("1") => "good-till-time",
        Symbol("2") => "post-only"
    );
    return safeString(timeInForces, string(tifInteger))

end
"""
transfer currency internally between wallets on the same account

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: account to transfer from (spot, perp)
- `toAccount`::string: account to transfer to (spot, perp)
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountIndex`::string, optional: account index
- `params.toAccountIndex`::string, optional: to account index, defaults to fromAccountIndex
- `params.apiKeyIndex`::string, optional: api key index
- `params.memo`::string, optional: hex encoding memo

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
function transfer(self::Lighter, code, amount, fromAccount, toAccount; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    apiKeyIndex = nothing;
    (apiKeyIndex, params) = self.handleApiKeyIndex(params, "transfer", "apiKeyIndex", "api_key_index");
    accountIndex = nothing;
    (accountIndex, params) = Base.fetch(self.handleAccountIndex(params, "transfer", "accountIndex", "account_index"));
    toAccountIndex = nothing;
    (toAccountIndex, params) = self.handleOptionAndParams2(params, "transfer", "toAccountIndex", "to_account_index", defaultValue = accountIndex);
    strAccountIndex = numberToString(accountIndex);
    strApiKeyIndex = numberToString(apiKeyIndex);
    signer = Base.fetch(self.loadAccount(get(self.options, Symbol("chainId"), nothing), self.getLighterPrivateKey(strAccountIndex, strApiKeyIndex), strApiKeyIndex, strAccountIndex, params = params));
    currency = self.currency(code);
    if functions.ccxtruthy(get(currency, Symbol("code"), nothing) == "USDC")
        amount = self.parseToInt(stringMul(self.pow("10", "6"), self.currencyToPrecision(code, amount)));
    elseif functions.ccxtruthy(get(currency, Symbol("code"), nothing) == "ETH")
        amount = self.parseToInt(stringMul(self.pow("10", "8"), self.currencyToPrecision(code, amount)));
    else
        throw(ExchangeError(string(self.id, " transfer() only supports USDC and ETH transfers")));
    end
    fromRouteType = functions.ccxtruthy((fromAccount == "perp")) ? 0 : 1;
    toRouteType = functions.ccxtruthy((toAccount == "perp")) ? 0 : 1;
    memo = safeString(params, "memo", "0x000000000000000000000000000000");
    params = omit(params, ["memo"]);
    nonce = Base.fetch(self.fetchNonce(accountIndex, apiKeyIndex, params = params));
    signRaw = Dict{Symbol, Any}(
        Symbol("to_account_index") => toAccountIndex,
        Symbol("asset_index") => self.parseToInt(get(currency, Symbol("id"), nothing)),
        Symbol("from_route_type") => fromRouteType,
        Symbol("to_route_type") => toRouteType,
        Symbol("amount") => amount,
        Symbol("usdc_fee") => 0,
        Symbol("memo") => memo,
        Symbol("nonce") => nonce,
        Symbol("api_key_index") => apiKeyIndex,
        Symbol("account_index") => accountIndex
    );
    (txType, txInfo) = self.lighterSignTransfer(signer, extend(signRaw, params));
    request = Dict{Symbol, Any}(
        Symbol("tx_type") => txType,
        Symbol("tx_info") => txInfo
    );
    response = Base.fetch(self.publicPostSendTx(request));
    return self.parseTransfer(response)

end
"""
fetch a history of internal transfers made on an account
see: https://apidocs.lighter.xyz/reference/transfer_history

# Arguments
- `code`::string: unified currency code of the currency transferred
- `since`::int, optional: the earliest time in ms to fetch transfers for
- `limit`::int, optional: the maximum number of  transfers structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountIndex`::string, optional: account index
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
function fetchTransfers(self::Lighter; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchTransfers", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchTransfers", symbol = code, since = since, limit = limit, params = params, cursorReceived = "cursor", cursorSent = "cursor", cursorIncrement = nothing, maxEntriesPerRequest = 50))
    end
    accountIndex = nothing;
    (accountIndex, params) = Base.fetch(self.handleAccountIndex(params, "fetchTransfers", "accountIndex", "account_index"));
    request = Dict{Symbol, Any}(
        Symbol("account_index") => accountIndex
    );
    apiKeyIndex = nothing;
    (apiKeyIndex, params) = self.handleApiKeyIndex(params, "fetchTransfers", "apiKeyIndex", "api_key_index");
    strAccountIndex = numberToString(accountIndex);
    strApiKeyIndex = numberToString(apiKeyIndex);
    Base.fetch(self.loadAccount(get(self.options, Symbol("chainId"), nothing), self.getLighterPrivateKey(strAccountIndex, strApiKeyIndex), strApiKeyIndex, strAccountIndex, params = params));
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    response = Base.fetch(self.privateGetTransferHistory(extend(request, params)));
    rows = self.safeList(response, "transfers", defaultValue = []);
    cursor = safeString(response, "cursor");
    first_var = self.safeDict(rows, 0);
    if functions.ccxtruthy(@functions.ccxt_and((first_var != nothing), (cursor != nothing)))
        rows[1][Symbol("cursor")] = cursor;
    end
    return self.parseTransfers(rows, currency = currency, since = since, limit = limit, params = params)

end
function parseTransfer(self::Lighter, transfer; currency=nothing)
    currencyId = safeString(transfer, "asset_id");
    code = self.safeCurrencyCode(currencyId, currency = currency);
    timestamp = safeInteger(transfer, "timestamp");
    fromAccount = self.safeDict(transfer, "from", defaultValue = Dict{Symbol, Any}());
    toAccount = self.safeDict(transfer, "to", defaultValue = Dict{Symbol, Any}());
    return Dict{Symbol, Any}(
    Symbol("id") => safeString(transfer, "id"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("currency") => code,
    Symbol("amount") => self.safeNumber(transfer, "amount"),
    Symbol("fromAccount") => safeString(fromAccount, "from_account_index"),
    Symbol("toAccount") => safeString(toAccount, "to_account_index"),
    Symbol("status") => nothing,
    Symbol("info") => transfer
)

end
"""
fetch all deposits made to an account
see: https://apidocs.lighter.xyz/reference/deposit_history

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountIndex`::string, optional: account index
- `params.address`::string, optional: l1_address
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDeposits(self::Lighter; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchDeposits", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchDeposits", symbol = code, since = since, limit = limit, params = params, cursorReceived = "cursor", cursorSent = "cursor", cursorIncrement = nothing, maxEntriesPerRequest = 50))
    end
    address = nothing;
    (address, params) = self.handleOptionAndParams2(params, "fetchDeposits", "address", "l1_address");
    if functions.ccxtruthy(address == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchDeposits() requires an address parameter")));
    end
    accountIndex = nothing;
    (accountIndex, params) = Base.fetch(self.handleAccountIndex(params, "fetchDeposits", "accountIndex", "account_index"));
    request = Dict{Symbol, Any}(
        Symbol("account_index") => accountIndex,
        Symbol("l1_address") => address
    );
    apiKeyIndex = nothing;
    (apiKeyIndex, params) = self.handleApiKeyIndex(params, "fetchDeposits", "apiKeyIndex", "api_key_index");
    strAccountIndex = numberToString(accountIndex);
    strApiKeyIndex = numberToString(apiKeyIndex);
    Base.fetch(self.loadAccount(get(self.options, Symbol("chainId"), nothing), self.getLighterPrivateKey(strAccountIndex, strApiKeyIndex), strApiKeyIndex, strAccountIndex, params = params));
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("coin")] = get(currency, Symbol("id"), nothing);
    end
    response = Base.fetch(self.privateGetDepositHistory(extend(request, params)));
    data = self.safeList(response, "deposits", defaultValue = []);
    cursor = safeString(response, "cursor");
    first_var = self.safeDict(data, 0);
    if functions.ccxtruthy(@functions.ccxt_and((first_var != nothing), (cursor != nothing)))
        data[1][Symbol("cursor")] = cursor;
    end
    return self.parseTransactions(data, currency = currency, since = since, limit = limit)

end
"""
fetch all withdrawals made from an account
see: https://apidocs.lighter.xyz/reference/withdraw_history

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountIndex`::string, optional: account index
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchWithdrawals(self::Lighter; code=nothing, since=nothing, limit=nothing, params=Dict())
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchWithdrawals", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchWithdrawals", symbol = code, since = since, limit = limit, params = params, cursorReceived = "cursor", cursorSent = "cursor", cursorIncrement = nothing, maxEntriesPerRequest = 50))
    end
    accountIndex = nothing;
    (accountIndex, params) = Base.fetch(self.handleAccountIndex(params, "fetchWithdrawals", "accountIndex", "account_index"));
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("account_index") => accountIndex
    );
    apiKeyIndex = nothing;
    (apiKeyIndex, params) = self.handleApiKeyIndex(params, "fetchWithdrawals", "apiKeyIndex", "api_key_index");
    strAccountIndex = numberToString(accountIndex);
    strApiKeyIndex = numberToString(apiKeyIndex);
    Base.fetch(self.loadAccount(get(self.options, Symbol("chainId"), nothing), self.getLighterPrivateKey(strAccountIndex, strApiKeyIndex), strApiKeyIndex, strAccountIndex, params = params));
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("coin")] = get(currency, Symbol("id"), nothing);
    end
    response = Base.fetch(self.privateGetWithdrawHistory(extend(request, params)));
    data = self.safeList(response, "withdraws", defaultValue = []);
    cursor = safeString(response, "cursor");
    first_var = self.safeDict(data, 0);
    if functions.ccxtruthy(@functions.ccxt_and((first_var != nothing), (cursor != nothing)))
        data[1][Symbol("cursor")] = cursor;
    end
    return self.parseTransactions(data, currency = currency, since = since, limit = limit)

end
function parseTransaction(self::Lighter, transaction; currency=nothing)
    type_var = safeString(transaction, "type");
    if functions.ccxtruthy(type_var == nothing)
        type_var = "deposit";
    else
        type_var = "withdrawal";
    end
    timestamp = safeInteger(transaction, "timestamp");
    status = safeString(transaction, "status");
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => safeString(transaction, "id"),
    Symbol("txid") => safeString(transaction, "l1_tx_hash"),
    Symbol("type") => type_var,
    Symbol("currency") => self.safeCurrencyCode(safeString(transaction, "asset_id"), currency = currency),
    Symbol("network") => nothing,
    Symbol("amount") => self.safeNumber(transaction, "amount"),
    Symbol("status") => self.parseTransactionStatus(status),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("address") => nothing,
    Symbol("addressFrom") => nothing,
    Symbol("addressTo") => nothing,
    Symbol("tag") => nothing,
    Symbol("tagFrom") => nothing,
    Symbol("tagTo") => nothing,
    Symbol("updated") => nothing,
    Symbol("comment") => nothing,
    Symbol("fee") => nothing,
    Symbol("internal") => nothing
)

end
function parseTransactionStatus(self::Lighter, status)
    statuses = Dict{Symbol, Any}(
        Symbol("failed") => "failed",
        Symbol("pending") => "pending",
        Symbol("completed") => "ok",
        Symbol("claimable") => "ok"
    );
    return safeString(statuses, status, status)

end
"""
make a withdrawal

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string, optional:
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountIndex`::string, optional: account index
- `params.apiKeyIndex`::string, optional: api key index
- `params.routeType`::int, optional: wallet type, 0: perp, 1: spot, default is 0

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function withdraw(self::Lighter, code, amount, address; tag=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    apiKeyIndex = nothing;
    (apiKeyIndex, params) = self.handleApiKeyIndex(params, "withdraw", "apiKeyIndex", "api_key_index");
    accountIndex = nothing;
    (accountIndex, params) = Base.fetch(self.handleAccountIndex(params, "withdraw", "accountIndex", "account_index"));
    strAccountIndex = numberToString(accountIndex);
    strApiKeyIndex = numberToString(apiKeyIndex);
    signer = Base.fetch(self.loadAccount(get(self.options, Symbol("chainId"), nothing), self.getLighterPrivateKey(strAccountIndex, strApiKeyIndex), strApiKeyIndex, strAccountIndex, params = params));
    currency = self.currency(code);
    if functions.ccxtruthy(get(currency, Symbol("code"), nothing) == "USDC")
        amount = self.parseToInt(stringMul(self.pow("10", "6"), self.currencyToPrecision(code, amount)));
    elseif functions.ccxtruthy(get(currency, Symbol("code"), nothing) == "ETH")
        amount = self.parseToInt(stringMul(self.pow("10", "8"), self.currencyToPrecision(code, amount)));
    else
        throw(ExchangeError(string(self.id, " withdraw() only supports USDC and ETH transfers")));
    end
    routeType = safeInteger(params, "routeType", 0);
    params = omit(params, "routeType");
    nonce = Base.fetch(self.fetchNonce(accountIndex, apiKeyIndex, params = params));
    signRaw = Dict{Symbol, Any}(
        Symbol("asset_index") => self.parseToInt(get(currency, Symbol("id"), nothing)),
        Symbol("route_type") => routeType,
        Symbol("amount") => amount,
        Symbol("nonce") => nonce,
        Symbol("api_key_index") => apiKeyIndex,
        Symbol("account_index") => accountIndex
    );
    (txType, txInfo) = self.lighterSignWithdraw(signer, extend(signRaw, params));
    request = Dict{Symbol, Any}(
        Symbol("tx_type") => txType,
        Symbol("tx_info") => txInfo
    );
    response = Base.fetch(self.publicPostSendTx(request));
    return self.parseTransaction(response)

end
"""
fetch all trades made by the user
see: https://apidocs.lighter.xyz/reference/trades

# Arguments
- `symbol`::string, optional: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountIndex`::string, optional: account index
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.until`::int, optional: timestamp in ms of the latest trade to fetch

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchMyTrades(self::Lighter; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchMyTrades", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchMyTrades", symbol = symbol, since = since, limit = limit, params = params, cursorReceived = "next_cursor", cursorSent = "cursor", cursorIncrement = nothing, maxEntriesPerRequest = 50))
    end
    accountIndex = nothing;
    (accountIndex, params) = Base.fetch(self.handleAccountIndex(params, "fetchMyTrades", "accountIndex", "account_index"));
    apiKeyIndex = nothing;
    (apiKeyIndex, params) = self.handleApiKeyIndex(params, "fetchMyTrades", "apiKeyIndex", "api_key_index");
    strAccountIndex = numberToString(accountIndex);
    strApiKeyIndex = numberToString(apiKeyIndex);
    Base.fetch(self.loadAccount(get(self.options, Symbol("chainId"), nothing), self.getLighterPrivateKey(strAccountIndex, strApiKeyIndex), strApiKeyIndex, strAccountIndex, params = params));
    request = Dict{Symbol, Any}(
        Symbol("sort_by") => "timestamp",
        Symbol("limit") => 100,
        Symbol("account_index") => accountIndex
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 100);
    end
    until = nothing;
    (until, params) = self.handleOptionAndParams2(params, "fetchMyTrades", "until", "from");
    if functions.ccxtruthy(until != nothing)
        request[Symbol("from")] = until;
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("market_id")] = get(market, Symbol("id"), nothing);
    end
    response = Base.fetch(self.privateGetTrades(extend(request, params)));
    data = self.safeList(response, "trades", defaultValue = []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        data[i + 1][Symbol("account_index")] = accountIndex;
        i += 1
    end
    nextCursor = safeString(response, "next_cursor");
    first_var = self.safeDict(data, 0);
    if functions.ccxtruthy(@functions.ccxt_and((first_var != nothing), (nextCursor != nothing)))
        data[1][Symbol("next_cursor")] = nextCursor;
    end
    return self.parseTrades(data, market = market, since = since, limit = limit, params = params)

end
function parseTrade(self::Lighter, trade; market=nothing)
    marketId = safeString(trade, "market_id");
    market = self.safeMarket(marketId = marketId, market = market);
    timestamp = safeInteger(trade, "timestamp");
    accountIndex = safeString(trade, "account_index");
    askAccountId = safeString(trade, "ask_account_id");
    bidAccountId = safeString(trade, "bid_account_id");
    isMakerAsk = self.safeBool(trade, "is_maker_ask");
    side = nothing;
    orderId = nothing;
    if functions.ccxtruthy(accountIndex != nothing)
        if functions.ccxtruthy(accountIndex == askAccountId)
            side = "sell";
            orderId = safeString(trade, "ask_id");
        elseif functions.ccxtruthy(accountIndex == bidAccountId)
            side = "buy";
            orderId = safeString(trade, "bid_id");
        end
    end
    takerOrMaker = nothing;
    if functions.ccxtruthy(@functions.ccxt_and(side != nothing, isMakerAsk != nothing))
        isMaker = functions.ccxtruthy((side == "sell")) ? isMakerAsk : !functions.ccxtruthy(isMakerAsk);
        takerOrMaker = functions.ccxtruthy(isMaker) ? "maker" : "taker";
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("id") => safeString(trade, "trade_id"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("order") => orderId,
    Symbol("type") => safeString(trade, "type"),
    Symbol("side") => side,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("price") => safeString(trade, "price"),
    Symbol("amount") => safeString(trade, "size"),
    Symbol("cost") => safeString(trade, "usd_amount"),
    Symbol("fee") => nothing
), market = market)

end
"""
set the level of leverage for a market

# Arguments
- `leverage`::float: the rate of leverage
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountIndex`::string, optional: account index
- `params.apiKeyIndex`::string, optional: api key index
- `params.marginMode`::string, optional: margin mode, 'cross' or 'isolated'

# Returns
- response from the exchange
"""
function setLeverage(self::Lighter, leverage; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setLeverage() requires a symbol argument")));
    end
    marginMode = nothing;
    (marginMode, params) = self.handleOptionAndParams2(params, "setLeverage", "marginMode", "margin_mode");
    if functions.ccxtruthy(marginMode == nothing)
        throw(ArgumentsRequired(string(self.id, " setLeverage() requires an marginMode parameter")));
    end
    return Base.fetch(self.modifyLeverageAndMarginMode(leverage, marginMode, symbol = symbol, params = params))

end
"""
set margin mode to 'cross' or 'isolated'

# Arguments
- `marginMode`::string: 'cross' or 'isolated'
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountIndex`::string, optional: account index
- `params.apiKeyIndex`::string, optional: api key index
- `params.leverage`::int, optional: required leverage

# Returns
- response from the exchange
"""
function setMarginMode(self::Lighter, marginMode; symbol=nothing, params=Dict())
    if functions.ccxtruthy(marginMode == nothing)
        throw(ArgumentsRequired(string(self.id, " setMarginMode() requires an marginMode parameter")));
    end
    leverage = nothing;
    (leverage, params) = self.handleOptionAndParams(params, "setMarginMode", "leverage");
    if functions.ccxtruthy(leverage == nothing)
        throw(ArgumentsRequired(string(self.id, " setMarginMode() requires an leverage parameter")));
    end
    return Base.fetch(self.modifyLeverageAndMarginMode(leverage, marginMode, symbol = symbol, params = params))

end
function modifyLeverageAndMarginMode(self::Lighter, leverage, marginMode; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(@functions.ccxt_and((marginMode != "cross"), (marginMode != "isolated")))
        throw(BadRequest(string(self.id, " modifyLeverageAndMarginMode() requires a marginMode parameter that must be either cross or isolated")));
    end
    apiKeyIndex = nothing;
    (apiKeyIndex, params) = self.handleApiKeyIndex(params, "modifyLeverageAndMarginMode", "apiKeyIndex", "api_key_index");
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " modifyLeverageAndMarginMode() requires a symbol argument")));
    end
    accountIndex = nothing;
    (accountIndex, params) = Base.fetch(self.handleAccountIndex(params, "modifyLeverageAndMarginMode", "accountIndex", "account_index"));
    strAccountIndex = numberToString(accountIndex);
    strApiKeyIndex = numberToString(apiKeyIndex);
    signer = Base.fetch(self.loadAccount(get(self.options, Symbol("chainId"), nothing), self.getLighterPrivateKey(strAccountIndex, strApiKeyIndex), strApiKeyIndex, strAccountIndex, params = params));
    market = self.market(symbol);
    nonce = Base.fetch(self.fetchNonce(accountIndex, apiKeyIndex, params = params));
    signRaw = Dict{Symbol, Any}(
        Symbol("market_index") => self.parseToInt(get(market, Symbol("id"), nothing)),
        Symbol("initial_margin_fraction") => self.parseToInt(10000 / leverage),
        Symbol("margin_mode") => functions.ccxtruthy((marginMode == "cross")) ? 0 : 1,
        Symbol("nonce") => nonce,
        Symbol("api_key_index") => apiKeyIndex,
        Symbol("account_index") => accountIndex
    );
    (txType, txInfo) = self.lighterSignUpdateLeverage(signer, extend(signRaw, params));
    request = Dict{Symbol, Any}(
        Symbol("tx_type") => txType,
        Symbol("tx_info") => txInfo
    );
    return Base.fetch(self.publicPostSendTx(request))

end
"""
cancels an open order

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountIndex`::string, optional: account index
- `params.apiKeyIndex`::string, optional: api key index

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::Lighter, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    apiKeyIndex = nothing;
    (apiKeyIndex, params) = self.handleApiKeyIndex(params, "cancelOrder", "apiKeyIndex", "api_key_index");
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a symbol argument")));
    end
    market = self.market(symbol);
    clientOrderId = safeString2(params, "client_order_index", "clientOrderId");
    params = omit(params, ["client_order_index", "clientOrderId"]);
    accountIndex = nothing;
    (accountIndex, params) = Base.fetch(self.handleAccountIndex(params, "cancelOrder", "accountIndex", "account_index"));
    strAccountIndex = numberToString(accountIndex);
    strApiKeyIndex = numberToString(apiKeyIndex);
    signer = Base.fetch(self.loadAccount(get(self.options, Symbol("chainId"), nothing), self.getLighterPrivateKey(strAccountIndex, strApiKeyIndex), strApiKeyIndex, strAccountIndex, params = params));
    nonce = Base.fetch(self.fetchNonce(accountIndex, apiKeyIndex, params = params));
    signRaw = Dict{Symbol, Any}(
        Symbol("market_index") => self.parseToInt(get(market, Symbol("id"), nothing)),
        Symbol("nonce") => nonce,
        Symbol("api_key_index") => apiKeyIndex,
        Symbol("account_index") => accountIndex
    );
    if functions.ccxtruthy(clientOrderId != nothing)
        signRaw[Symbol("order_index")] = self.parseToInt(clientOrderId);
    elseif functions.ccxtruthy(id != nothing)
        signRaw[Symbol("order_index")] = self.parseToInt(id);
    else
        throw(ArgumentsRequired(string(self.id, " cancelOrder requires order id or client order id")));
    end
    (txType, txInfo) = self.lighterSignCancelOrder(signer, extend(signRaw, params));
    request = Dict{Symbol, Any}(
        Symbol("tx_type") => txType,
        Symbol("tx_info") => txInfo
    );
    response = Base.fetch(self.publicPostSendTx(request));
    return self.parseOrder(response, market = market)

end
"""
cancel all open orders

# Arguments
- `symbol`::string, optional: unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountIndex`::string, optional: account index
- `params.apiKeyIndex`::string, optional: api key index

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelAllOrders(self::Lighter; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    apiKeyIndex = nothing;
    (apiKeyIndex, params) = self.handleApiKeyIndex(params, "cancelAllOrders", "apiKeyIndex", "api_key_index");
    accountIndex = nothing;
    (accountIndex, params) = Base.fetch(self.handleAccountIndex(params, "cancelAllOrders", "accountIndex", "account_index"));
    strAccountIndex = numberToString(accountIndex);
    strApiKeyIndex = numberToString(apiKeyIndex);
    signer = Base.fetch(self.loadAccount(get(self.options, Symbol("chainId"), nothing), self.getLighterPrivateKey(strAccountIndex, strApiKeyIndex), strApiKeyIndex, strAccountIndex, params = params));
    nonce = Base.fetch(self.fetchNonce(accountIndex, apiKeyIndex, params = params));
    signRaw = Dict{Symbol, Any}(
        Symbol("time_in_force") => 0,
        Symbol("time") => 0,
        Symbol("nonce") => nonce,
        Symbol("api_key_index") => apiKeyIndex,
        Symbol("account_index") => accountIndex
    );
    (txType, txInfo) = self.lighterSignCancelAllOrders(signer, extend(signRaw, params));
    request = Dict{Symbol, Any}(
        Symbol("tx_type") => txType,
        Symbol("tx_info") => txInfo
    );
    response = Base.fetch(self.publicPostSendTx(request));
    return self.parseOrders([response])

end
"""
dead man's switch, cancel all orders after the given timeout

# Arguments
- `timeout`::float: time in milliseconds, 0 represents cancel the timer
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the api result
"""
function cancelAllOrdersAfter(self::Lighter, timeout; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(@functions.ccxt_or((functions.ccxt_lt(timeout, 300000)), (functions.ccxt_gt(timeout, 1296000000))))
        throw(BadRequest(string(self.id, " timeout should be between 5 minutes and 15 days.")));
    end
    apiKeyIndex = nothing;
    (apiKeyIndex, params) = self.handleApiKeyIndex(params, "cancelOrder", "apiKeyIndex", "api_key_index");
    accountIndex = nothing;
    (accountIndex, params) = Base.fetch(self.handleAccountIndex(params, "cancelAllOrdersAfter", "accountIndex", "account_index"));
    strAccountIndex = numberToString(accountIndex);
    strApiKeyIndex = numberToString(apiKeyIndex);
    signer = Base.fetch(self.loadAccount(get(self.options, Symbol("chainId"), nothing), self.getLighterPrivateKey(strAccountIndex, strApiKeyIndex), strApiKeyIndex, strAccountIndex, params = params));
    nonce = Base.fetch(self.fetchNonce(accountIndex, apiKeyIndex, params = params));
    signRaw = Dict{Symbol, Any}(
        Symbol("time_in_force") => 1,
        Symbol("time") => milliseconds() + timeout,
        Symbol("nonce") => nonce,
        Symbol("api_key_index") => apiKeyIndex,
        Symbol("account_index") => accountIndex
    );
    (txType, txInfo) = self.lighterSignCancelAllOrders(signer, extend(signRaw, params));
    request = Dict{Symbol, Any}(
        Symbol("tx_type") => txType,
        Symbol("tx_info") => txInfo
    );
    response = Base.fetch(self.publicPostSendTx(request));
    return response

end
"""
add margin

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: amount of margin to add
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=add-margin-structure}
"""
function addMargin(self::Lighter, symbol, amount; params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("direction") => 1
    );
    return Base.fetch(self.setMargin(symbol, amount, params = extend(request, params)))

end
"""
remove margin from a position

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: the amount of margin to remove
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=reduce-margin-structure}
"""
function reduceMargin(self::Lighter, symbol, amount; params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("direction") => 0
    );
    return Base.fetch(self.setMargin(symbol, amount, params = extend(request, params)))

end
"""
Either adds or reduces margin in an isolated position in order to set the margin to a specific value

# Arguments
- `symbol`::string: unified market symbol of the market to set margin in
- `amount`::float: the amount to set the margin to
- `params`::object, optional: parameters specific to the exchange API endpoint
- `params.accountIndex`::string, optional: account index
- `params.apiKeyIndex`::string, optional: api key index

# Returns
- A [margin structure]{@link https://docs.ccxt.com/?id=add-margin-structure}
"""
function setMargin(self::Lighter, symbol, amount; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    apiKeyIndex = nothing;
    (apiKeyIndex, params) = self.handleApiKeyIndex(params, "setMargin", "apiKeyIndex", "api_key_index");
    direction = safeInteger(params, "direction");
    if functions.ccxtruthy(direction == nothing)
        throw(ArgumentsRequired(string(self.id, " setMargin() requires a direction parameter either 1 (increase margin) or 0 (decrease margin)")));
    end
    if functions.ccxtruthy(!functions.ccxtruthy(inArray(direction, [0, 1])))
        throw(ArgumentsRequired(string(self.id, " setMargin() requires a direction parameter either 1 (increase margin) or 0 (decrease margin)")));
    end
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setMargin() requires a symbol argument")));
    end
    accountIndex = nothing;
    (accountIndex, params) = Base.fetch(self.handleAccountIndex(params, "setMargin", "accountIndex", "account_index"));
    strAccountIndex = numberToString(accountIndex);
    strApiKeyIndex = numberToString(apiKeyIndex);
    signer = Base.fetch(self.loadAccount(get(self.options, Symbol("chainId"), nothing), self.getLighterPrivateKey(strAccountIndex, strApiKeyIndex), strApiKeyIndex, strAccountIndex, params = params));
    market = self.market(symbol);
    nonce = Base.fetch(self.fetchNonce(accountIndex, apiKeyIndex, params = params));
    signRaw = Dict{Symbol, Any}(
        Symbol("market_index") => self.parseToInt(get(market, Symbol("id"), nothing)),
        Symbol("usdc_amount") => self.parseToInt(stringMul(self.pow("10", "6"), self.currencyToPrecision("USDC", amount))),
        Symbol("direction") => direction,
        Symbol("nonce") => nonce,
        Symbol("api_key_index") => apiKeyIndex,
        Symbol("account_index") => accountIndex
    );
    (txType, txInfo) = self.lighterSignUpdateMargin(signer, extend(signRaw, params));
    request = Dict{Symbol, Any}(
        Symbol("tx_type") => txType,
        Symbol("tx_info") => txInfo
    );
    response = Base.fetch(self.publicPostSendTx(request));
    return self.parseMarginModification(response, market = market)

end
function parseMarginModification(self::Lighter, data; market=nothing)
    timestamp = safeInteger(data, "predicted_execution_time_ms");
    return Dict{Symbol, Any}(
    Symbol("info") => data,
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("type") => nothing,
    Symbol("marginMode") => nothing,
    Symbol("amount") => nothing,
    Symbol("total") => nothing,
    Symbol("code") => "USDC",
    Symbol("status") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
)

end
function sign(self::Lighter, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    url = nothing;
    if functions.ccxtruthy(api == "root")
        url = self.implodeHostname(get(get(self.urls, Symbol("api"), nothing), Symbol("public"), nothing));
    else
        url = string(self.implodeHostname(get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing)), "/api/", self.version, "/", path);
    end
    if functions.ccxtruthy(api == "private")
        headers = Dict{Symbol, Any}(
            Symbol("Authorization") => self.createAuth(params = params)
        );
    end
    if functions.ccxtruthy(length(objectKeys(params)))
        if functions.ccxtruthy(method == "POST")
            headers = Dict{Symbol, Any}(
                Symbol("Content-Type") => "multipart/form-data"
            );
            body = params;
        else
            url += string("?", self.rawencode(params));
        end
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Lighter, httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(!functions.ccxtruthy(response))
            return nothing
    end
    code = safeString(response, "code");
    message = safeString(response, "msg");
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(code != nothing, code != "0"), code != "200"))
        feedback = string(self.id, " ", body);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), message, feedback);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), code, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Lighter, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function rootGet(self::Lighter, params=Dict(), context=Dict())
    return request(self, ""; api="root", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function rootGetInfo(self::Lighter, params=Dict(), context=Dict())
    return request(self, "info"; api="root", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetAccount(self::Lighter, params=Dict(), context=Dict())
    return request(self, "account"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetAccountsByL1Address(self::Lighter, params=Dict(), context=Dict())
    return request(self, "accountsByL1Address"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetApikeys(self::Lighter, params=Dict(), context=Dict())
    return request(self, "apikeys"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetExchangeStats(self::Lighter, params=Dict(), context=Dict())
    return request(self, "exchangeStats"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetAssetDetails(self::Lighter, params=Dict(), context=Dict())
    return request(self, "assetDetails"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetOrderBookDetails(self::Lighter, params=Dict(), context=Dict())
    return request(self, "orderBookDetails"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetOrderBookOrders(self::Lighter, params=Dict(), context=Dict())
    return request(self, "orderBookOrders"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetOrderBooks(self::Lighter, params=Dict(), context=Dict())
    return request(self, "orderBooks"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetRecentTrades(self::Lighter, params=Dict(), context=Dict())
    return request(self, "recentTrades"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetBlockTxs(self::Lighter, params=Dict(), context=Dict())
    return request(self, "blockTxs"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetNextNonce(self::Lighter, params=Dict(), context=Dict())
    return request(self, "nextNonce"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTx(self::Lighter, params=Dict(), context=Dict())
    return request(self, "tx"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTxFromL1TxHash(self::Lighter, params=Dict(), context=Dict())
    return request(self, "txFromL1TxHash"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTxs(self::Lighter, params=Dict(), context=Dict())
    return request(self, "txs"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetAnnouncement(self::Lighter, params=Dict(), context=Dict())
    return request(self, "announcement"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetBlock(self::Lighter, params=Dict(), context=Dict())
    return request(self, "block"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetBlocks(self::Lighter, params=Dict(), context=Dict())
    return request(self, "blocks"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetCurrentHeight(self::Lighter, params=Dict(), context=Dict())
    return request(self, "currentHeight"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetCandles(self::Lighter, params=Dict(), context=Dict())
    return request(self, "candles"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetFundings(self::Lighter, params=Dict(), context=Dict())
    return request(self, "fundings"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetFastbridgeInfo(self::Lighter, params=Dict(), context=Dict())
    return request(self, "fastbridge/info"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetFundingRates(self::Lighter, params=Dict(), context=Dict())
    return request(self, "funding-rates"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetWithdrawalDelay(self::Lighter, params=Dict(), context=Dict())
    return request(self, "withdrawalDelay"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicPostSendTx(self::Lighter, params=Dict(), context=Dict())
    return request(self, "sendTx"; api="public", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicPostSendTxBatch(self::Lighter, params=Dict(), context=Dict())
    return request(self, "sendTxBatch"; api="public", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountLimits(self::Lighter, params=Dict(), context=Dict())
    return request(self, "accountLimits"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountMetadata(self::Lighter, params=Dict(), context=Dict())
    return request(self, "accountMetadata"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetPnl(self::Lighter, params=Dict(), context=Dict())
    return request(self, "pnl"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetL1Metadata(self::Lighter, params=Dict(), context=Dict())
    return request(self, "l1Metadata"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetLiquidations(self::Lighter, params=Dict(), context=Dict())
    return request(self, "liquidations"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetPositionFunding(self::Lighter, params=Dict(), context=Dict())
    return request(self, "positionFunding"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetPublicPoolsMetadata(self::Lighter, params=Dict(), context=Dict())
    return request(self, "publicPoolsMetadata"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountActiveOrders(self::Lighter, params=Dict(), context=Dict())
    return request(self, "accountActiveOrders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountInactiveOrders(self::Lighter, params=Dict(), context=Dict())
    return request(self, "accountInactiveOrders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetExport(self::Lighter, params=Dict(), context=Dict())
    return request(self, "export"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetTrades(self::Lighter, params=Dict(), context=Dict())
    return request(self, "trades"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountTxs(self::Lighter, params=Dict(), context=Dict())
    return request(self, "accountTxs"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetDepositHistory(self::Lighter, params=Dict(), context=Dict())
    return request(self, "deposit/history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetTransferHistory(self::Lighter, params=Dict(), context=Dict())
    return request(self, "transfer/history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetWithdrawHistory(self::Lighter, params=Dict(), context=Dict())
    return request(self, "withdraw/history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetReferralPoints(self::Lighter, params=Dict(), context=Dict())
    return request(self, "referral/points"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetTransferFeeInfo(self::Lighter, params=Dict(), context=Dict())
    return request(self, "transferFeeInfo"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostChangeAccountTier(self::Lighter, params=Dict(), context=Dict())
    return request(self, "changeAccountTier"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostNotificationAck(self::Lighter, params=Dict(), context=Dict())
    return request(self, "notification/ack"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function Lighter(; kwargs...)
    inst = Lighter(Exchange(), describe, loadAccount, initAuthObject, getLighterPrivateKey, preLoadLighterLibrary, handleApiKeyIndex, handleAccountIndex, createSubAccount, createAuth, pow, hashMessage, signHash, signL1AndPrepareTxInfo, handleBuilderFeeApproval, approveBuilderFee, changeApiKey, setSandboxMode, createOrderRequest, fetchNonce, createOrder, editOrder, fetchStatus, fetchTime, fetchMarkets, fetchCurrencies, parseCurrency, fetchOrderBook, parseTicker, fetchTicker, fetchTickers, parseOHLCV, fetchOHLCV, parseFundingRate, fetchFundingRates, fetchBalance, fetchPosition, fetchPositions, parsePosition, fetchAccounts, parseAccount, fetchOpenOrders, fetchClosedOrders, parseOrder, parseOrderStatus, parseOrderType, parseOrderTypeInteger, parseOrderTimeInForce, parseOrderTimeInForceInteger, transfer, fetchTransfers, parseTransfer, fetchDeposits, fetchWithdrawals, parseTransaction, parseTransactionStatus, withdraw, fetchMyTrades, parseTrade, setLeverage, setMarginMode, modifyLeverageAndMarginMode, cancelOrder, cancelAllOrders, cancelAllOrdersAfter, addMargin, reduceMargin, setMargin, parseMarginModification, sign, handleErrors, rootGet, rootGetInfo, publicGetAccount, publicGetAccountsByL1Address, publicGetApikeys, publicGetExchangeStats, publicGetAssetDetails, publicGetOrderBookDetails, publicGetOrderBookOrders, publicGetOrderBooks, publicGetRecentTrades, publicGetBlockTxs, publicGetNextNonce, publicGetTx, publicGetTxFromL1TxHash, publicGetTxs, publicGetAnnouncement, publicGetBlock, publicGetBlocks, publicGetCurrentHeight, publicGetCandles, publicGetFundings, publicGetFastbridgeInfo, publicGetFundingRates, publicGetWithdrawalDelay, publicPostSendTx, publicPostSendTxBatch, privateGetAccountLimits, privateGetAccountMetadata, privateGetPnl, privateGetL1Metadata, privateGetLiquidations, privateGetPositionFunding, privateGetPublicPoolsMetadata, privateGetAccountActiveOrders, privateGetAccountInactiveOrders, privateGetExport, privateGetTrades, privateGetAccountTxs, privateGetDepositHistory, privateGetTransferHistory, privateGetWithdrawHistory, privateGetReferralPoints, privateGetTransferFeeInfo, privatePostChangeAccountTier, privatePostNotificationAck)
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
function __ccxt_doc_Lighter_preLoadLighterLibrary() end
"""
if the required credentials are available in options, it will pre-load the lighter Signer to avoid delaying sensitive calls like createOrder the first time they're executed

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- true if the signer was loaded, false otherwise
"""
__ccxt_doc_Lighter_preLoadLighterLibrary

function __ccxt_doc_Lighter_createOrder() end
"""
create a trade order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.timeInForce`::string, optional: 'GTT' or 'IOC', default is 'GTT'
- `params.clientOrderId`::int, optional: client order id, should be unique for each order, default is a random number
- `params.triggerPrice`::string, optional: trigger price for stop loss or take profit orders, in units of the quote currency
- `params.reduceOnly`::bool, optional: whether the order is reduce only, default false
- `params.nonce`::int, optional: nonce for the account
- `params.apiKeyIndex`::int, optional: apiKeyIndex
- `params.accountIndex`::int, optional: accountIndex
- `params.orderExpiry`::int, optional: orderExpiry

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Lighter_createOrder

function __ccxt_doc_Lighter_editOrder() end
"""
cancels an order and places a new order

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of the currency you want to trade in units of the base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountIndex`::string, optional: account index
- `params.apiKeyIndex`::string, optional: api key index

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Lighter_editOrder

function __ccxt_doc_Lighter_fetchStatus() end
"""
the latest known information on the availability of the exchange API
see: https://apidocs.lighter.xyz/reference/status

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
"""
__ccxt_doc_Lighter_fetchStatus

function __ccxt_doc_Lighter_fetchTime() end
"""
fetches the current integer timestamp in milliseconds from the exchange server
see: https://apidocs.lighter.xyz/reference/status

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
__ccxt_doc_Lighter_fetchTime

function __ccxt_doc_Lighter_fetchMarkets() end
"""
retrieves data on all markets for lighter
see: https://apidocs.lighter.xyz/reference/orderbookdetails

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Lighter_fetchMarkets

function __ccxt_doc_Lighter_fetchCurrencies() end
"""
fetches all available currencies on an exchange
see: https://apidocs.lighter.xyz/reference/assetdetails

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
__ccxt_doc_Lighter_fetchCurrencies

function __ccxt_doc_Lighter_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://apidocs.lighter.xyz/reference/orderbookorders

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Lighter_fetchOrderBook

function __ccxt_doc_Lighter_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://apidocs.lighter.xyz/reference/orderbookdetails

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Lighter_fetchTicker

function __ccxt_doc_Lighter_fetchTickers() end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://apidocs.lighter.xyz/reference/orderbookdetails

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Lighter_fetchTickers

function __ccxt_doc_Lighter_fetchOHLCV() end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://apidocs.lighter.xyz/reference/candles

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest candle to fetch

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Lighter_fetchOHLCV

function __ccxt_doc_Lighter_fetchFundingRates() end
"""
fetch the current funding rate for multiple symbols
see: https://apidocs.lighter.xyz/reference/funding-rates

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
__ccxt_doc_Lighter_fetchFundingRates

function __ccxt_doc_Lighter_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://apidocs.lighter.xyz/reference/account-1

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.by`::string, optional: fetch balance by 'index' or 'l1_address', defaults to 'index'
- `params.value`::string, optional: fetch balance value, account index or l1 address
- `params.type`::string, optional: 'spot', 'swap', default is 'swap'

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Lighter_fetchBalance

function __ccxt_doc_Lighter_fetchPosition() end
"""
fetch data on an open position
see: https://apidocs.lighter.xyz/reference/account-1

# Arguments
- `symbol`::string: unified market symbol of the market the position is held in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.by`::string, optional: fetch balance by 'index' or 'l1_address', defaults to 'index'
- `params.value`::string, optional: fetch balance value, account index or l1 address

# Returns
- a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Lighter_fetchPosition

function __ccxt_doc_Lighter_fetchPositions() end
"""
fetch all open positions
see: https://apidocs.lighter.xyz/reference/account-1

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.by`::string, optional: fetch balance by 'index' or 'l1_address', defaults to 'index'
- `params.value`::string, optional: fetch balance value, account index or l1 address

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Lighter_fetchPositions

function __ccxt_doc_Lighter_fetchAccounts() end
"""
fetch all the accounts associated with a profile
see: https://apidocs.lighter.xyz/reference/account-1

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.by`::string, optional: fetch balance by 'index' or 'l1_address', defaults to 'index'
- `params.value`::string, optional: fetch balance value, account index or l1 address

# Returns
- a dictionary of [account structures]{@link https://docs.ccxt.com/?id=accounts-structure} indexed by the account type
"""
__ccxt_doc_Lighter_fetchAccounts

function __ccxt_doc_Lighter_fetchOpenOrders() end
"""
fetch all unfilled currently open orders
see: https://apidocs.lighter.xyz/reference/accountactiveorders

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountIndex`::string, optional: account index

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Lighter_fetchOpenOrders

function __ccxt_doc_Lighter_fetchClosedOrders() end
"""
fetch all unfilled currently closed orders
see: https://apidocs.lighter.xyz/reference/accountinactiveorders

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountIndex`::string, optional: account index

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Lighter_fetchClosedOrders

function __ccxt_doc_Lighter_transfer() end
"""
transfer currency internally between wallets on the same account

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: account to transfer from (spot, perp)
- `toAccount`::string: account to transfer to (spot, perp)
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountIndex`::string, optional: account index
- `params.toAccountIndex`::string, optional: to account index, defaults to fromAccountIndex
- `params.apiKeyIndex`::string, optional: api key index
- `params.memo`::string, optional: hex encoding memo

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
__ccxt_doc_Lighter_transfer

function __ccxt_doc_Lighter_fetchTransfers() end
"""
fetch a history of internal transfers made on an account
see: https://apidocs.lighter.xyz/reference/transfer_history

# Arguments
- `code`::string: unified currency code of the currency transferred
- `since`::int, optional: the earliest time in ms to fetch transfers for
- `limit`::int, optional: the maximum number of  transfers structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountIndex`::string, optional: account index
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
__ccxt_doc_Lighter_fetchTransfers

function __ccxt_doc_Lighter_fetchDeposits() end
"""
fetch all deposits made to an account
see: https://apidocs.lighter.xyz/reference/deposit_history

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountIndex`::string, optional: account index
- `params.address`::string, optional: l1_address
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Lighter_fetchDeposits

function __ccxt_doc_Lighter_fetchWithdrawals() end
"""
fetch all withdrawals made from an account
see: https://apidocs.lighter.xyz/reference/withdraw_history

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountIndex`::string, optional: account index
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Lighter_fetchWithdrawals

function __ccxt_doc_Lighter_withdraw() end
"""
make a withdrawal

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string, optional:
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountIndex`::string, optional: account index
- `params.apiKeyIndex`::string, optional: api key index
- `params.routeType`::int, optional: wallet type, 0: perp, 1: spot, default is 0

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Lighter_withdraw

function __ccxt_doc_Lighter_fetchMyTrades() end
"""
fetch all trades made by the user
see: https://apidocs.lighter.xyz/reference/trades

# Arguments
- `symbol`::string, optional: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountIndex`::string, optional: account index
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.until`::int, optional: timestamp in ms of the latest trade to fetch

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Lighter_fetchMyTrades

function __ccxt_doc_Lighter_setLeverage() end
"""
set the level of leverage for a market

# Arguments
- `leverage`::float: the rate of leverage
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountIndex`::string, optional: account index
- `params.apiKeyIndex`::string, optional: api key index
- `params.marginMode`::string, optional: margin mode, 'cross' or 'isolated'

# Returns
- response from the exchange
"""
__ccxt_doc_Lighter_setLeverage

function __ccxt_doc_Lighter_setMarginMode() end
"""
set margin mode to 'cross' or 'isolated'

# Arguments
- `marginMode`::string: 'cross' or 'isolated'
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountIndex`::string, optional: account index
- `params.apiKeyIndex`::string, optional: api key index
- `params.leverage`::int, optional: required leverage

# Returns
- response from the exchange
"""
__ccxt_doc_Lighter_setMarginMode

function __ccxt_doc_Lighter_cancelOrder() end
"""
cancels an open order

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountIndex`::string, optional: account index
- `params.apiKeyIndex`::string, optional: api key index

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Lighter_cancelOrder

function __ccxt_doc_Lighter_cancelAllOrders() end
"""
cancel all open orders

# Arguments
- `symbol`::string, optional: unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountIndex`::string, optional: account index
- `params.apiKeyIndex`::string, optional: api key index

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Lighter_cancelAllOrders

function __ccxt_doc_Lighter_cancelAllOrdersAfter() end
"""
dead man's switch, cancel all orders after the given timeout

# Arguments
- `timeout`::float: time in milliseconds, 0 represents cancel the timer
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the api result
"""
__ccxt_doc_Lighter_cancelAllOrdersAfter

function __ccxt_doc_Lighter_addMargin() end
"""
add margin

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: amount of margin to add
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=add-margin-structure}
"""
__ccxt_doc_Lighter_addMargin

function __ccxt_doc_Lighter_reduceMargin() end
"""
remove margin from a position

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: the amount of margin to remove
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=reduce-margin-structure}
"""
__ccxt_doc_Lighter_reduceMargin

function __ccxt_doc_Lighter_setMargin() end
"""
Either adds or reduces margin in an isolated position in order to set the margin to a specific value

# Arguments
- `symbol`::string: unified market symbol of the market to set margin in
- `amount`::float: the amount to set the margin to
- `params`::object, optional: parameters specific to the exchange API endpoint
- `params.accountIndex`::string, optional: account index
- `params.apiKeyIndex`::string, optional: api key index

# Returns
- A [margin structure]{@link https://docs.ccxt.com/?id=add-margin-structure}
"""
__ccxt_doc_Lighter_setMargin
