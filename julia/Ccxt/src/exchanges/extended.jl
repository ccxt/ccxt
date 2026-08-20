@kwdef mutable struct Extended <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    loadMarkets::Function = loadMarkets
    indexByStringifiedNumericId::Function = indexByStringifiedNumericId
    fetchMarkets::Function = fetchMarkets
    parseMarket::Function = parseMarket
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    fetchTicker::Function = fetchTicker
    fetchTickers::Function = fetchTickers
    parseTicker::Function = parseTicker
    fetchOrderBook::Function = fetchOrderBook
    fetchTrades::Function = fetchTrades
    fetchMyTrades::Function = fetchMyTrades
    fetchFundingHistory::Function = fetchFundingHistory
    parseFundingHistory::Function = parseFundingHistory
    parseFundingHistories::Function = parseFundingHistories
    parseTrade::Function = parseTrade
    fetchOHLCV::Function = fetchOHLCV
    parseOHLCV::Function = parseOHLCV
    fetchFundingRateHistory::Function = fetchFundingRateHistory
    parseFundingRateHistory::Function = parseFundingRateHistory
    fetchOpenInterestHistory::Function = fetchOpenInterestHistory
    parseOpenInterest::Function = parseOpenInterest
    fetchBalance::Function = fetchBalance
    parseBalance::Function = parseBalance
    fetchAccount::Function = fetchAccount
    fetchAccounts::Function = fetchAccounts
    parseAccount::Function = parseAccount
    fetchLedger::Function = fetchLedger
    parseLedgerEntry::Function = parseLedgerEntry
    fetchTransactions::Function = fetchTransactions
    fetchDeposits::Function = fetchDeposits
    fetchWithdrawals::Function = fetchWithdrawals
    withdraw::Function = withdraw
    fetchTransfers::Function = fetchTransfers
    transfer::Function = transfer
    parseTransfer::Function = parseTransfer
    getExtendedCurrencyCodeById::Function = getExtendedCurrencyCodeById
    parseTransactionStatus::Function = parseTransactionStatus
    parseTransactionType::Function = parseTransactionType
    parseTransaction::Function = parseTransaction
    fetchTradingFee::Function = fetchTradingFee
    fetchTradingFees::Function = fetchTradingFees
    parseTradingFee::Function = parseTradingFee
    fetchLeverage::Function = fetchLeverage
    setLeverage::Function = setLeverage
    parseLeverage::Function = parseLeverage
    fetchPositions::Function = fetchPositions
    fetchPosition::Function = fetchPosition
    fetchPositionsHistory::Function = fetchPositionsHistory
    parsePosition::Function = parsePosition
    getExtendedStarkAmount::Function = getExtendedStarkAmount
    fetchExtendedAccount::Function = fetchExtendedAccount
    createOrderSettlementData::Function = createOrderSettlementData
    createWithdrawalSettlementData::Function = createWithdrawalSettlementData
    createTransferSettlementData::Function = createTransferSettlementData
    createExtendedOrderRequest::Function = createExtendedOrderRequest
    createOrder::Function = createOrder
    editOrder::Function = editOrder
    cancelOrder::Function = cancelOrder
    cancelOrders::Function = cancelOrders
    cancelAllOrders::Function = cancelAllOrders
    cancelAllOrdersAfter::Function = cancelAllOrdersAfter
    fetchOrder::Function = fetchOrder
    fetchOpenOrders::Function = fetchOpenOrders
    fetchOrders::Function = fetchOrders
    fetchClosedOrders::Function = fetchClosedOrders
    fetchCanceledOrders::Function = fetchCanceledOrders
    parseOrderStatus::Function = parseOrderStatus
    parseOrder::Function = parseOrder
    getExtendedStringToFelt::Function = getExtendedStringToFelt
    getExtendedEncodeI64::Function = getExtendedEncodeI64
    getExtendedDecimalToBase16::Function = getExtendedDecimalToBase16
    getExtendedSignatureHex::Function = getExtendedSignatureHex
    getExtendedDomainHash::Function = getExtendedDomainHash
    getExtendedOrderMsgHash::Function = getExtendedOrderMsgHash
    getExtendedWithdrawalMsgHash::Function = getExtendedWithdrawalMsgHash
    getExtendedTransferMsgHash::Function = getExtendedTransferMsgHash
    handleErrors::Function = handleErrors
    sign::Function = sign

# Generated REST endpoint fields
    v1PublicGetInfoMarkets::Function = v1PublicGetInfoMarkets
    v1PublicGetInfoAssets::Function = v1PublicGetInfoAssets
    v1PublicGetInfoAssetsAssetPrice::Function = v1PublicGetInfoAssetsAssetPrice
    v1PublicGetInfoMarketsMarketStats::Function = v1PublicGetInfoMarketsMarketStats
    v1PublicGetInfoMarketsMarketOrderbook::Function = v1PublicGetInfoMarketsMarketOrderbook
    v1PublicGetInfoMarketsMarketTrades::Function = v1PublicGetInfoMarketsMarketTrades
    v1PublicGetInfoCandlesMarketCandleType::Function = v1PublicGetInfoCandlesMarketCandleType
    v1PublicGetInfoMarketFunding::Function = v1PublicGetInfoMarketFunding
    v1PublicGetInfoMarketOpenInterests::Function = v1PublicGetInfoMarketOpenInterests
    v1PublicGetInfoBuilderDashboard::Function = v1PublicGetInfoBuilderDashboard
    v1PrivateGetUserAccounts::Function = v1PrivateGetUserAccounts
    v1PrivateGetUserAccountInfo::Function = v1PrivateGetUserAccountInfo
    v1PrivateGetUserBalance::Function = v1PrivateGetUserBalance
    v1PrivateGetUserSpotBalances::Function = v1PrivateGetUserSpotBalances
    v1PrivateGetUserAssetOperations::Function = v1PrivateGetUserAssetOperations
    v1PrivateGetUserPositions::Function = v1PrivateGetUserPositions
    v1PrivateGetUserPositionsHistory::Function = v1PrivateGetUserPositionsHistory
    v1PrivateGetUserOrders::Function = v1PrivateGetUserOrders
    v1PrivateGetUserOrdersHistory::Function = v1PrivateGetUserOrdersHistory
    v1PrivateGetUserOrdersId::Function = v1PrivateGetUserOrdersId
    v1PrivateGetUserOrdersExternalExternalId::Function = v1PrivateGetUserOrdersExternalExternalId
    v1PrivateGetUserTrades::Function = v1PrivateGetUserTrades
    v1PrivateGetUserFundingHistory::Function = v1PrivateGetUserFundingHistory
    v1PrivateGetUserRebatesStats::Function = v1PrivateGetUserRebatesStats
    v1PrivateGetUserLeverage::Function = v1PrivateGetUserLeverage
    v1PrivateGetUserFees::Function = v1PrivateGetUserFees
    v1PrivateGetUserBridgeConfig::Function = v1PrivateGetUserBridgeConfig
    v1PrivateGetUserBridgeQuote::Function = v1PrivateGetUserBridgeQuote
    v1PrivateGetUserAffiliate::Function = v1PrivateGetUserAffiliate
    v1PrivateGetUserReferralsStatus::Function = v1PrivateGetUserReferralsStatus
    v1PrivateGetUserReferralsLinks::Function = v1PrivateGetUserReferralsLinks
    v1PrivateGetUserReferralsDashboard::Function = v1PrivateGetUserReferralsDashboard
    v1PrivateGetUserRewardsEarned::Function = v1PrivateGetUserRewardsEarned
    v1PrivateGetUserRewardsLeaderboardStats::Function = v1PrivateGetUserRewardsLeaderboardStats
    v1PrivateGetPortfolioChartsEquities::Function = v1PrivateGetPortfolioChartsEquities
    v1PrivateGetPortfolioChartsPnl::Function = v1PrivateGetPortfolioChartsPnl
    v1PrivateGetVaultPublicPerformance::Function = v1PrivateGetVaultPublicPerformance
    v1PrivateGetVaultPublicSummary::Function = v1PrivateGetVaultPublicSummary
    v1PrivateGetBuilderTrades::Function = v1PrivateGetBuilderTrades
    v1PrivatePostUserOrder::Function = v1PrivatePostUserOrder
    v1PrivatePostUserOrderMassCancel::Function = v1PrivatePostUserOrderMassCancel
    v1PrivatePostUserDeadmanswitch::Function = v1PrivatePostUserDeadmanswitch
    v1PrivatePostUserBridgeQuote::Function = v1PrivatePostUserBridgeQuote
    v1PrivatePostUserWithdrawal::Function = v1PrivatePostUserWithdrawal
    v1PrivatePostUserTransfer::Function = v1PrivatePostUserTransfer
    v1PrivatePostUserReferralsUse::Function = v1PrivatePostUserReferralsUse
    v1PrivatePostUserReferrals::Function = v1PrivatePostUserReferrals
    v1PrivatePutUserReferrals::Function = v1PrivatePutUserReferrals
    v1PrivatePatchUserLeverage::Function = v1PrivatePatchUserLeverage
    v1PrivateDeleteUserOrderId::Function = v1PrivateDeleteUserOrderId
    v1PrivateDeleteUserOrder::Function = v1PrivateDeleteUserOrder

end
function describe(self::Extended, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "extended",
    Symbol("name") => "Extended",
    Symbol("countries") => ["SG"],
    Symbol("version") => "v2",
    Symbol("rateLimit") => 600,
    Symbol("precisionMode") => TICK_SIZE,
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
        Symbol("cancelAllOrdersAfter") => true,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => true,
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => false,
        Symbol("createConvertTrade") => false,
        Symbol("createDepositAddress") => false,
        Symbol("createMarketBuyOrderWithCost") => false,
        Symbol("createMarketOrderWithCost") => false,
        Symbol("createMarketSellOrderWithCost") => false,
        Symbol("createOrder") => true,
        Symbol("createOrders") => false,
        Symbol("createOrderWithTakeProfitAndStopLoss") => false,
        Symbol("createPostOnlyOrder") => false,
        Symbol("createReduceOnlyOrder") => false,
        Symbol("createStopLimitOrder") => false,
        Symbol("createStopLossOrder") => false,
        Symbol("createStopMarketOrder") => false,
        Symbol("createStopOrder") => false,
        Symbol("createTakeProfitOrder") => false,
        Symbol("createTrailingAmountOrder") => false,
        Symbol("createTrailingPercentOrder") => false,
        Symbol("createTriggerOrder") => false,
        Symbol("editOrder") => true,
        Symbol("fetchAccounts") => true,
        Symbol("fetchBalance") => true,
        Symbol("fetchBorrowInterest") => false,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchCanceledAndClosedOrders") => false,
        Symbol("fetchCanceledOrders") => true,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchConvertCurrencies") => false,
        Symbol("fetchConvertQuote") => false,
        Symbol("fetchConvertTrade") => false,
        Symbol("fetchConvertTradeHistory") => false,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDeposit") => false,
        Symbol("fetchDepositAddress") => false,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => false,
        Symbol("fetchDeposits") => true,
        Symbol("fetchDepositsWithdrawals") => false,
        Symbol("fetchDepositWithdrawFee") => false,
        Symbol("fetchDepositWithdrawFees") => false,
        Symbol("fetchFundingHistory") => true,
        Symbol("fetchFundingInterval") => false,
        Symbol("fetchFundingIntervals") => false,
        Symbol("fetchFundingRate") => false,
        Symbol("fetchFundingRateHistory") => true,
        Symbol("fetchFundingRates") => false,
        Symbol("fetchIndexOHLCV") => true,
        Symbol("fetchIsolatedBorrowRate") => false,
        Symbol("fetchIsolatedBorrowRates") => false,
        Symbol("fetchLedger") => true,
        Symbol("fetchLeverage") => true,
        Symbol("fetchLeverageTiers") => false,
        Symbol("fetchLiquidations") => false,
        Symbol("fetchLongShortRatio") => false,
        Symbol("fetchLongShortRatioHistory") => false,
        Symbol("fetchMarginAdjustmentHistory") => false,
        Symbol("fetchMarginMode") => false,
        Symbol("fetchMarketLeverageTiers") => false,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => true,
        Symbol("fetchMarkPrice") => false,
        Symbol("fetchMyLiquidations") => false,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterest") => false,
        Symbol("fetchOpenInterestHistory") => true,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrderBooks") => false,
        Symbol("fetchOrders") => true,
        Symbol("fetchOrderTrades") => false,
        Symbol("fetchPosition") => true,
        Symbol("fetchPositionHistory") => false,
        Symbol("fetchPositionMode") => false,
        Symbol("fetchPositions") => true,
        Symbol("fetchPositionsHistory") => true,
        Symbol("fetchPositionsRisk") => false,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchStatus") => false,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => false,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => true,
        Symbol("fetchTradingFees") => true,
        Symbol("fetchTransactions") => true,
        Symbol("fetchTransfer") => false,
        Symbol("fetchTransfers") => true,
        Symbol("fetchWithdrawAddresses") => false,
        Symbol("fetchWithdrawal") => false,
        Symbol("fetchWithdrawals") => true,
        Symbol("reduceMargin") => false,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("setLeverage") => true,
        Symbol("setMargin") => false,
        Symbol("setMarginMode") => false,
        Symbol("setPositionMode") => false,
        Symbol("signIn") => false,
        Symbol("transfer") => true,
        Symbol("withdraw") => true
    ),
    Symbol("features") => Dict{Symbol, Any}(),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "PT1M",
        Symbol("5m") => "PT5M",
        Symbol("15m") => "PT15M",
        Symbol("30m") => "PT30M",
        Symbol("1h") => "PT1H",
        Symbol("2h") => "PT2H",
        Symbol("4h") => "PT4H",
        Symbol("8h") => "PT8H",
        Symbol("12h") => "PT12H",
        Symbol("1d") => "PT24H",
        Symbol("1w") => "P7D",
        Symbol("1M") => "P30D"
    ),
    Symbol("hostname") => "extended.exchange",
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/e2fe2bdf-6b28-4af8-b30f-38db496dc079",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("rest") => "https://api.starknet.{hostname}"
        ),
        Symbol("test") => Dict{Symbol, Any}(
            Symbol("rest") => "https://api.starknet.sepolia.{hostname}"
        ),
        Symbol("www") => "https://app.extended.exchange",
        Symbol("doc") => "https://api.docs.extended.exchange",
        Symbol("fees") => "https://docs.extended.exchange/extended-resources/trading/trading-fees-and-rebates",
        Symbol("referral") => ""
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("v1") => Dict{Symbol, Any}(
            Symbol("public") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("info/markets") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("info/assets") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("info/assets/{asset}/price") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("info/markets/{market}/stats") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("info/markets/{market}/orderbook") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("info/markets/{market}/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("info/candles/{market}/{candleType}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("info/{market}/funding") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("info/{market}/open-interests") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("info/builder/dashboard") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                )
            ),
            Symbol("private") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("user/accounts") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("user/account/info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("user/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("user/spot/balances") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("user/assetOperations") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("user/positions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("user/positions/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("user/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("user/orders/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("user/orders/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("user/orders/external/{externalId}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("user/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("user/funding/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("user/rebates/stats") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("user/leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("user/fees") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("user/bridge/config") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("user/bridge/quote") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("user/affiliate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("user/referrals/status") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("user/referrals/links") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("user/referrals/dashboard") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("user/rewards/earned") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("user/rewards/leaderboard/stats") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("portfolio/charts/equities") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("portfolio/charts/pnl") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("vault/public/performance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("vault/public/summary") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("builder/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("user/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("user/order/massCancel") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("user/deadmanswitch") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("user/bridge/quote") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("user/withdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("user/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("user/referrals/use") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("user/referrals") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                ),
                Symbol("put") => Dict{Symbol, Any}(
                    Symbol("user/referrals") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                ),
                Symbol("patch") => Dict{Symbol, Any}(
                    Symbol("user/leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                ),
                Symbol("delete") => Dict{Symbol, Any}(
                    Symbol("user/order/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("user/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                )
            )
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("taker") => self.parseNumber("0.002"),
        Symbol("maker") => self.parseNumber("0.002")
    ),
    Symbol("requiredCredentials") => Dict{Symbol, Any}(
        Symbol("apiKey") => true,
        Symbol("secret") => false,
        Symbol("privateKey") => true
    ),
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("1000") => InvalidOrder,
            Symbol("1001") => InvalidOrder,
            Symbol("1002") => InvalidOrder,
            Symbol("1003") => InvalidOrder,
            Symbol("1004") => InvalidOrder,
            Symbol("1005") => InvalidOrder,
            Symbol("1006") => ExchangeError,
            Symbol("1008") => InvalidOrder,
            Symbol("1009") => InvalidOrder,
            Symbol("1010") => ExchangeError,
            Symbol("1011") => InvalidOrder,
            Symbol("1012") => InvalidOrder,
            Symbol("1013") => InvalidOrder,
            Symbol("1014") => InvalidOrder,
            Symbol("1049") => InvalidOrder,
            Symbol("1050") => InvalidOrder,
            Symbol("10501") => InvalidOrder,
            Symbol("1052") => InvalidOrder,
            Symbol("1053") => InvalidOrder,
            Symbol("1100") => InvalidOrder,
            Symbol("1101") => InvalidOrder,
            Symbol("1102") => InvalidOrder,
            Symbol("1120") => InvalidOrder,
            Symbol("1121") => InvalidOrder,
            Symbol("1122") => InvalidOrder,
            Symbol("1123") => InvalidOrder,
            Symbol("1124") => InvalidOrder,
            Symbol("1125") => InvalidOrder,
            Symbol("1126") => InvalidOrder,
            Symbol("1127") => InvalidOrder,
            Symbol("1128") => InvalidOrder,
            Symbol("1129") => InvalidOrder,
            Symbol("1130") => InvalidOrder,
            Symbol("1131") => InvalidOrder,
            Symbol("1132") => InvalidOrder,
            Symbol("1133") => InvalidOrder,
            Symbol("1134") => InvalidOrder,
            Symbol("1135") => InvalidOrder,
            Symbol("1136") => InvalidOrder,
            Symbol("1137") => InvalidOrder,
            Symbol("1138") => InvalidOrder,
            Symbol("1139") => InvalidOrder,
            Symbol("1140") => InsufficientFunds,
            Symbol("1141") => InvalidOrder,
            Symbol("1142") => InvalidOrder,
            Symbol("1143") => InvalidOrder,
            Symbol("1144") => InvalidOrder,
            Symbol("1145") => InvalidOrder,
            Symbol("1146") => InvalidOrder,
            Symbol("1147") => InvalidOrder,
            Symbol("1148") => InvalidOrder,
            Symbol("1500") => InvalidOrder,
            Symbol("1600") => BadRequest,
            Symbol("1601") => BadRequest,
            Symbol("1602") => BadRequest,
            Symbol("1604") => BadRequest,
            Symbol("1605") => BadRequest,
            Symbol("1607") => BadRequest,
            Symbol("1608") => BadRequest,
            Symbol("1650") => BadRequest,
            Symbol("1700") => BadRequest,
            Symbol("1701") => BadRequest,
            Symbol("1703") => BadRequest,
            Symbol("1704") => BadRequest
        ),
        Symbol("broad") => Dict{Symbol, Any}()
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("builderFee") => true,
        Symbol("builderFeeRate") => "0.0001",
        Symbol("builderId") => "257624"
    )
))

end
function loadMarkets(self::Extended; reload=false, params=Dict())
    markets = Base.fetch(loadMarkets(self.parent, reload = reload, params = params));
    currenciesByNumericId = self.safeDict(self.options, "currenciesByNumericId");
    if functions.ccxtruthy(@functions.ccxt_or((currenciesByNumericId == nothing), reload))
        self.options[Symbol("currenciesByNumericId")] = self.indexByStringifiedNumericId(self.currencies);
    end
    return markets

end
function indexByStringifiedNumericId(self::Extended, input)
    result = Dict{Symbol, Any}();
    if functions.ccxtruthy(input == nothing)
            return nothing
    end
    keys_var = objectKeys(input);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
        key = get(keys_var, i + 1, nothing);
        item = get(input, Symbol(key), nothing);
        numericIdString = safeString(item, "numericId");
        if functions.ccxtruthy(numericIdString == nothing)
            i += 1; continue
        end
        result[Symbol(numericIdString)] = item;
        i += 1
    end
    return result

end
"""
retrieves data on all markets for extended
see: https://api.docs.extended.exchange/#get-markets

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Extended; params=Dict())
    response = Base.fetch(self.v1PublicGetInfoMarkets(params));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseMarkets(data)

end
function parseMarket(self::Extended, market)
    tradingConfig = self.safeDict(market, "tradingConfig", defaultValue = Dict{Symbol, Any}());
    marketId = safeString(market, "name");
    baseId = safeString(market, "assetName", "");
    if functions.ccxtruthy(findfirst("SPOT", baseId) !== nothing)
        baseId = replace(baseId, "SPOT" => "");
    end
    quoteId = safeString(market, "collateralAssetName");
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    if functions.ccxtruthy(quoteId == "USD")
        quote_var = "USDC";
    end
    status = safeString(market, "status");
    active = (status == "ACTIVE");
    amountPrecision = self.safeNumber(tradingConfig, "minOrderSizeChange");
    pricePrecision = self.safeNumber(tradingConfig, "minPriceChange");
    maxLeverage = self.safeNumber(tradingConfig, "maxLeverage");
    minAmount = self.safeNumber(tradingConfig, "minOrderSize");
    maxCost = self.safeNumber(tradingConfig, "maxLimitOrderValue");
    created = safeInteger(market, "createdAt");
    settleId = nothing;
    settle = nothing;
    symbol = string(base, "/", quote_var);
    isSpot = false;
    type_var = safeStringLower(market, "type");
    contractSize = nothing;
    linear = nothing;
    inverse = nothing;
    if functions.ccxtruthy(type_var == "spot")
        isSpot = true;
    else
        type_var = "swap";
        settleId = quoteId;
        settle = quote_var;
        symbol += string(":", settle);
        contractSize = self.parseNumber("1");
        linear = true;
        inverse = false;
    end
    return self.safeMarketStructure(market = Dict{Symbol, Any}(
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
    Symbol("swap") => !functions.ccxtruthy(isSpot),
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => active,
    Symbol("contract") => !functions.ccxtruthy(isSpot),
    Symbol("linear") => linear,
    Symbol("inverse") => inverse,
    Symbol("taker") => self.safeNumber(self.fees, "taker"),
    Symbol("maker") => self.safeNumber(self.fees, "maker"),
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
            Symbol("min") => self.parseNumber("1"),
            Symbol("max") => maxLeverage
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => minAmount,
            Symbol("max") => nothing
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => maxCost
        )
    ),
    Symbol("created") => created,
    Symbol("info") => market
))

end
"""
fetches all available currencies on an exchange
see: https://api.docs.extended.exchange/#get-assets

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
function fetchCurrencies(self::Extended; params=Dict())
    response = Base.fetch(self.v1PublicGetInfoAssets(params));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseCurrencies(data)

end
function parseCurrency(self::Extended, currency)
    currencyId = safeString(currency, "symbol");
    if functions.ccxtruthy(@functions.ccxt_and((currencyId != nothing), (findfirst("SPOT", currencyId) !== nothing)))
        currencyId = replace(currencyId, "SPOT" => "");
    end
    code = self.safeCurrencyCode(currencyId);
    if functions.ccxtruthy(currencyId == "USD")
        code = "USDC";
    end
    name = safeString(currency, "name");
    precision = safeInteger(currency, "precision", 0);
    isActive = self.safeBool(currency, "isActive");
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => currencyId,
    Symbol("code") => code,
    Symbol("numericId") => safeInteger(currency, "id"),
    Symbol("name") => name,
    Symbol("active") => isActive,
    Symbol("deposit") => true,
    Symbol("withdraw") => true,
    Symbol("precision") => pow(10, precision * -1),
    Symbol("type") => "other",
    Symbol("margin") => self.safeBool(currency, "canBeUsedAsCollateral"),
    Symbol("info") => currency
))

end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://api.docs.extended.exchange/#get-market-statistics

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTicker(self::Extended, symbol; params=Dict())
    Base.fetch(self.loadMarkets());
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.v1PublicGetInfoMarketsMarketStats(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseTicker(data, market = market)

end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for all markets
see: https://api.docs.extended.exchange/#get-markets

# Arguments
- `symbols`::array, optional: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTickers(self::Extended; symbols=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    symbols = self.marketSymbols(symbols = symbols);
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbols != nothing)
        marketIds = [];
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(symbols)))
            market = self.market(get(symbols, i + 1, nothing));
            push!(marketIds, get(market, Symbol("id"), nothing));
            i += 1
        end

        request[Symbol("market")] = marketIds;
    end
    response = Base.fetch(self.v1PublicGetInfoMarkets(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    tickers = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        marketData = get(data, i + 1, nothing);
        marketId = safeString(marketData, "name");
        market = self.safeMarket(marketId = marketId);
        stats = self.safeDict(marketData, "marketStats", defaultValue = Dict{Symbol, Any}());
        ticker = self.parseTicker(stats, market = market);
        symbol = get(ticker, Symbol("symbol"), nothing);
        if functions.ccxtruthy(symbol != nothing)
            tickers[Symbol(symbol)] = ticker;
        end
        i += 1
    end
    return self.filterByArrayTickers(tickers, "symbol", values = symbols)

end
function parseTicker(self::Extended, ticker; market=nothing)
    symbol = self.safeSymbol(nothing, market = market);
    last_var = self.safeNumber(ticker, "lastPrice");
    percentageRaw = safeString(ticker, "dailyPriceChangePercentage");
    percentage = functions.ccxtruthy((percentageRaw != nothing)) ? stringMul(percentageRaw, "100") : nothing;
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("high") => self.safeNumber(ticker, "dailyHigh"),
    Symbol("low") => self.safeNumber(ticker, "dailyLow"),
    Symbol("bid") => self.safeNumber(ticker, "bidPrice"),
    Symbol("bidVolume") => nothing,
    Symbol("ask") => self.safeNumber(ticker, "askPrice"),
    Symbol("askVolume") => nothing,
    Symbol("vwap") => nothing,
    Symbol("open") => nothing,
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => self.safeNumber(ticker, "dailyPriceChange"),
    Symbol("percentage") => percentage,
    Symbol("average") => nothing,
    Symbol("baseVolume") => self.safeNumber(ticker, "dailyVolumeBase"),
    Symbol("quoteVolume") => self.safeNumber(ticker, "dailyVolume"),
    Symbol("markPrice") => self.safeNumber(ticker, "markPrice"),
    Symbol("indexPrice") => self.safeNumber(ticker, "indexPrice"),
    Symbol("info") => ticker
), market = market)

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://api.docs.extended.exchange/#get-market-order-book

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Extended, symbol; limit=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.v1PublicGetInfoMarketsMarketOrderbook(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    timestamp = milliseconds();
    orderbook = self.parseOrderBook(data, get(market, Symbol("symbol"), nothing), timestamp = timestamp, bidsKey = "bid", asksKey = "ask", priceKey = "price", amountKey = "qty");
    if functions.ccxtruthy(limit != nothing)
        orderbook[Symbol("bids")] = self.arraySlice(get(orderbook, Symbol("bids"), nothing), 0, second = limit);
        orderbook[Symbol("asks")] = self.arraySlice(get(orderbook, Symbol("asks"), nothing), 0, second = limit);
    end
    return orderbook

end
"""
get the list of most recent trades for a particular symbol
see: https://api.docs.extended.exchange/#get-market-last-trades

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
function fetchTrades(self::Extended, symbol; since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.v1PublicGetInfoMarketsMarketTrades(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseTrades(data, market = market, since = since, limit = limit)

end
"""
fetch all trades made by the user
see: https://api.docs.extended.exchange/#get-trades

# Arguments
- `symbol`::string, optional: unified market symbol of the trades
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trade structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchMyTrades(self::Extended; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchMyTrades", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchMyTrades", symbol = symbol, since = since, limit = limit, params = params, cursorReceived = "cursor", cursorSent = "cursor", cursorIncrement = nothing, maxEntriesPerRequest = 100))
    end
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("market")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.v1PrivateGetUserTrades(extend(params, request)));
    data = self.safeList(response, "data", defaultValue = []);
    pagination = self.safeDict(response, "pagination", defaultValue = Dict{Symbol, Any}());
    cursor = safeString(pagination, "cursor");
    result = [];
    dataLength = length(data);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, dataLength))
        entry = get(data, i + 1, nothing);
        if functions.ccxtruthy(@functions.ccxt_and((cursor != nothing), (i == dataLength - 1)))
            entry = extend(entry, Dict{Symbol, Any}(
    Symbol("cursor") => cursor
));
        end
        push!(result, entry);
        i += 1
    end
    return self.parseTrades(result, market = market, since = since, limit = limit)

end
"""
fetch the funding payments history
see: https://api.docs.extended.exchange/#get-funding-payments

# Arguments
- `symbol`::string, optional: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch funding history for
- `limit`::int, optional: the maximum number of funding history structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [funding history structures]{@link https://docs.ccxt.com/?id=funding-history-structure}
"""
function fetchFundingHistory(self::Extended; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchFundingHistory", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchFundingHistory", symbol = symbol, since = since, limit = limit, params = params, cursorReceived = "cursor", cursorSent = "cursor", cursorIncrement = nothing, maxEntriesPerRequest = 100))
    end
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("market")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.v1PrivateGetUserFundingHistory(extend(params, request)));
    data = self.safeList(response, "data", defaultValue = []);
    pagination = self.safeDict(response, "pagination", defaultValue = Dict{Symbol, Any}());
    cursor = safeString(pagination, "cursor");
    result = [];
    dataLength = length(data);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, dataLength))
        entry = get(data, i + 1, nothing);
        if functions.ccxtruthy(@functions.ccxt_and((cursor != nothing), (i == dataLength - 1)))
            entry = extend(entry, Dict{Symbol, Any}(
    Symbol("cursor") => cursor
));
        end
        push!(result, entry);
        i += 1
    end
    return self.parseFundingHistories(result, market = market, since = since, limit = limit)

end
function parseFundingHistory(self::Extended, history; market=nothing)
    marketId = safeString(history, "market");
    market = self.safeMarket(marketId = marketId, market = market);
    timestamp = safeInteger(history, "paidTime");
    return Dict{Symbol, Any}(
    Symbol("info") => history,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("code") => get(market, Symbol("settle"), nothing),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("id") => safeString(history, "id"),
    Symbol("amount") => self.safeNumber(history, "fundingFee"),
    Symbol("rate") => self.safeNumber(history, "fundingRate")
)

end
function parseFundingHistories(self::Extended, histories; market=nothing, since=nothing, limit=nothing)
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(histories)))
        push!(result, self.parseFundingHistory(get(histories, i + 1, nothing), market = market));
        i += 1
    end
    symbol = functions.ccxtruthy((market == nothing)) ? nothing : get(market, Symbol("symbol"), nothing);
    return self.filterBySymbolSinceLimit(result, symbol = symbol, since = since, limit = limit)

end
function parseTrade(self::Extended, trade; market=nothing)
    marketId = safeString2(trade, "m", "market");
    market = self.safeMarket(marketId = marketId, market = market);
    timestamp = safeInteger2(trade, "T", "createdTime");
    priceString = safeString2(trade, "p", "price");
    amountString = safeString2(trade, "q", "qty");
    sideRaw = safeString2(trade, "S", "side");
    side = functions.ccxtruthy((sideRaw != nothing)) ? lowercase(sideRaw) : nothing;
    feeCost = safeString(trade, "fee");
    fee = functions.ccxtruthy((feeCost == nothing)) ? nothing : Dict{Symbol, Any}(
        Symbol("cost") => feeCost,
        Symbol("currency") => functions.ccxtruthy((market == nothing)) ? nothing : get(market, Symbol("settle"), nothing)
    );
    isTaker = self.safeBool(trade, "isTaker");
    takerOrMaker = nothing;
    if functions.ccxtruthy(isTaker != nothing)
        takerOrMaker = functions.ccxtruthy(isTaker) ? "taker" : "maker";
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("id") => safeString2(trade, "i", "id"),
    Symbol("info") => trade,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("order") => safeString(trade, "orderId"),
    Symbol("type") => nothing,
    Symbol("side") => side,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("price") => priceString,
    Symbol("amount") => amountString,
    Symbol("cost") => safeString(trade, "value"),
    Symbol("fee") => fee
), market = market)

end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://api.docs.extended.exchange/#get-candles-history

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch, default 100
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.candleType`::string, optional: candle type: 'trades' (default), 'mark-prices', or 'index-prices'
- `params.price`::string, optional: *ignored if params.candleType is set* 'mark' or 'index' for mark price and index price candles
- `params.until`::int, optional: end timestamp in ms for the requested period

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchOHLCV(self::Extended, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    market = self.market(symbol);
    price = safeString(params, "price");
    candleType = safeString(params, "candleType");
    if functions.ccxtruthy(candleType == nothing)
        if functions.ccxtruthy(price == "mark")
            candleType = "mark-prices";
        elseif functions.ccxtruthy(price == "index")
            candleType = "index-prices";
        else
            candleType = "trades";
        end
    end
    until = safeInteger(params, "until");
    params = omit(params, ["candleType", "price", "until"]);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing),
        Symbol("candleType") => candleType,
        Symbol("interval") => safeString(self.timeframes, timeframe, timeframe),
        Symbol("limit") => functions.ccxtruthy((limit != nothing)) ? limit : 100
    );
    if functions.ccxtruthy(until != nothing)
        request[Symbol("endTime")] = until;
    end
    response = Base.fetch(self.v1PublicGetInfoCandlesMarketCandleType(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseOHLCVs(data, market = market, timeframe = timeframe, since = since, limit = limit)

end
function parseOHLCV(self::Extended, ohlcv; market=nothing)
    return [safeInteger(ohlcv, "T"), self.safeNumber(ohlcv, "o"), self.safeNumber(ohlcv, "h"), self.safeNumber(ohlcv, "l"), self.safeNumber(ohlcv, "c"), self.safeNumber(ohlcv, "v")]

end
"""
fetches historical funding rate prices
see: https://api.docs.extended.exchange/#get-funding-rates-history

# Arguments
- `symbol`::string: unified symbol of the market to fetch funding rate history for
- `since`::int, optional: timestamp in ms of the earliest funding rate to fetch
- `limit`::int, optional: the maximum amount of entries to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest funding rate to fetch
- `params.endTime`::int, optional: exchange-specific end timestamp in ms of the latest funding rate to fetch
- `params.cursor`::int, optional: offset of the result set
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
"""
function fetchFundingRateHistory(self::Extended; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchFundingRateHistory() requires a symbol argument")));
    end
    Base.fetch(self.loadMarkets());
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchFundingRateHistory", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchFundingRateHistory", symbol = symbol, since = since, limit = limit, params = params, cursorReceived = "cursor", cursorSent = "cursor", cursorIncrement = nothing, maxEntriesPerRequest = 10000))
    end
    market = self.market(symbol);
    symbol = get(market, Symbol("symbol"), nothing);
    if functions.ccxtruthy(limit == nothing)
        limit = 100;
    end
    until = safeInteger(params, "until", milliseconds());
    endTime = safeInteger(params, "endTime", until);
    params = omit(params, ["endTime", "until"]);
    if functions.ccxtruthy(since == nothing)
        since = endTime - (limit * 60 * 60 * 1000);
    end
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing),
        Symbol("startTime") => since,
        Symbol("endTime") => endTime,
        Symbol("limit") => limit
    );
    response = Base.fetch(self.v1PublicGetInfoMarketFunding(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    pagination = self.safeDict(response, "pagination", defaultValue = Dict{Symbol, Any}());
    cursor = safeString(pagination, "cursor");
    result = [];
    dataLength = length(data);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, dataLength))
        entry = get(data, i + 1, nothing);
        if functions.ccxtruthy(@functions.ccxt_and((cursor != nothing), (i == dataLength - 1)))
            entry = extend(entry, Dict{Symbol, Any}(
    Symbol("cursor") => cursor
));
        end
        push!(result, self.parseFundingRateHistory(entry, market = market));
        i += 1
    end
    sorted = sortBy(result, "timestamp");
    return self.filterBySymbolSinceLimit(sorted, symbol = symbol, since = since, limit = limit)

end
function parseFundingRateHistory(self::Extended, info; market=nothing)
    marketId = safeString(info, "m");
    market = self.safeMarket(marketId = marketId, market = market);
    timestamp = safeInteger(info, "T");
    return Dict{Symbol, Any}(
    Symbol("info") => info,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("fundingRate") => self.safeNumber(info, "f"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
)

end
"""
Retrieves the open interest history of a currency
see: https://api.docs.extended.exchange/#get-open-interest-history

# Arguments
- `symbol`::string: unified CCXT market symbol
- `timeframe`::string: '1h' or '1d'
- `since`::int, optional: the time(ms) of the earliest record to retrieve as a unix timestamp
- `limit`::int, optional: the maximum amount of open interest structures to retrieve
- `params`::object, optional: exchange specific parameters
- `params.until`::int, optional: timestamp in ms of the latest open interest record to fetch

# Returns
- an array of [open interest structures]{@link https://docs.ccxt.com/?id=open-interest-structure}
"""
function fetchOpenInterestHistory(self::Extended, symbol; timeframe="1h", since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    market = self.market(symbol);
    interval = safeString(self.timeframes, timeframe);
    if functions.ccxtruthy(!functions.ccxtruthy(inArray(interval, ["PT1H", "P1D"])))
        throw(BadRequest(string(self.id, " fetchOpenInterestHistory() supports 1h and 1d timeframes only")));
    end
    if functions.ccxtruthy(limit == nothing)
        limit = 100;
    end
    until = safeInteger(params, "until", milliseconds());
    endTime = safeInteger(params, "endTime", until);
    params = omit(params, ["endTime", "until"]);
    if functions.ccxtruthy(since == nothing)
        since = endTime - (limit * self.parseTimeframe(timeframe) * 1000);
    end
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing),
        Symbol("interval") => interval,
        Symbol("startTime") => since,
        Symbol("endTime") => endTime,
        Symbol("limit") => limit
    );
    response = Base.fetch(self.v1PublicGetInfoMarketOpenInterests(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseOpenInterestsHistory(data, market = market, since = since, limit = limit)

end
function parseOpenInterest(self::Extended, interest; market=nothing)
    timestamp = safeInteger(interest, "t");
    return self.safeOpenInterest(Dict{Symbol, Any}(
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("openInterestAmount") => self.safeNumber(interest, "I"),
    Symbol("openInterestValue") => self.safeNumber(interest, "i"),
    Symbol("baseVolume") => self.safeNumber(interest, "I"),
    Symbol("quoteVolume") => self.safeNumber(interest, "i"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("info") => interest
), market = market)

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://api.docs.extended.exchange/#get-spot-balances

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Extended; params=Dict())
    Base.fetch(self.loadMarkets());
    response = Base.fetch(self.v1PrivateGetUserSpotBalances(params));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseBalance(data)

end
function parseBalance(self::Extended, response)
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        balance = self.safeDict(response, i, defaultValue = Dict{Symbol, Any}());
        currencyId = safeString(balance, "asset");
        code = self.safeCurrencyCode(currencyId);
        account = self.account();
        account[Symbol("free")] = safeString(balance, "availableToWithdraw");
        account[Symbol("total")] = safeString(balance, "balance");
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
"""
fetch the current authenticated sub-account
see: https://api.docs.extended.exchange/#get-account-details

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [account structure]{@link https://docs.ccxt.com/?id=account-structure}
"""
function fetchAccount(self::Extended; params=Dict())
    response = Base.fetch(self.v1PrivateGetUserAccountInfo(params));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseAccount(data)

end
"""
fetch the current authenticated sub-account, extended private endpoints only return records for the authenticated sub-account
see: https://api.docs.extended.exchange/#get-sub-accounts

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [account structures]{@link https://docs.ccxt.com/?id=account-structure}
"""
function fetchAccounts(self::Extended; params=Dict())
    response = Base.fetch(self.v1PrivateGetUserAccounts(params));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseAccounts(data)

end
function parseAccount(self::Extended, account)
    accountIndex = safeInteger(account, "accountIndex");
    type_var = nothing;
    if functions.ccxtruthy(accountIndex != nothing)
        type_var = functions.ccxtruthy((accountIndex == 0)) ? "main" : "subaccount";
    end
    return Dict{Symbol, Any}(
    Symbol("id") => safeString2(account, "accountId", "id"),
    Symbol("type") => type_var,
    Symbol("code") => nothing,
    Symbol("info") => account
)

end
"""
fetch the history of changes, actions done by the user or operations that altered the balance of the user
see: https://api.docs.extended.exchange/#get-deposits-withdrawals-transfers-history

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: timestamp in ms of the earliest ledger entry
- `limit`::int, optional: max number of ledger entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [ledger structures]{@link https://docs.ccxt.com/?id=ledger}
"""
function fetchLedger(self::Extended; code=nothing, since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchLedger", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchLedger", symbol = code, since = since, limit = limit, params = params, cursorReceived = "cursor", cursorSent = "cursor", cursorIncrement = nothing, maxEntriesPerRequest = 50))
    end
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.v1PrivateGetUserAssetOperations(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    pagination = self.safeDict(response, "pagination", defaultValue = Dict{Symbol, Any}());
    cursor = safeString(pagination, "cursor");
    result = [];
    dataLength = length(data);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, dataLength))
        entry = get(data, i + 1, nothing);
        if functions.ccxtruthy(@functions.ccxt_and((cursor != nothing), (i == dataLength - 1)))
            entry = extend(entry, Dict{Symbol, Any}(
    Symbol("cursor") => cursor
));
        end
        push!(result, entry);
        i += 1
    end
    return self.parseLedger(result, currency = currency, since = since, limit = limit)

end
function parseLedgerEntry(self::Extended, item; currency=nothing)
    timestamp = safeInteger(item, "time");
    assetId = safeString(item, "asset");
    code = self.getExtendedCurrencyCodeById(assetId, currency = currency);
    ledgerCurrency = self.safeCurrency(code, currency = currency);
    amountString = safeString(item, "amount");
    direction = nothing;
    if functions.ccxtruthy(amountString != nothing)
        direction = functions.ccxtruthy(stringLt(amountString, "0")) ? "out" : "in";
    end
    fee = nothing;
    feeCost = safeString(item, "fee");
    if functions.ccxtruthy(feeCost != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("currency") => code,
            Symbol("cost") => self.parseNumber(stringAbs(feeCost))
        );
    end
    return self.safeLedgerEntry(Dict{Symbol, Any}(
    Symbol("info") => item,
    Symbol("id") => safeString(item, "id"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("direction") => direction,
    Symbol("account") => safeString(item, "accountId"),
    Symbol("referenceId") => safeString(item, "transactionHash"),
    Symbol("referenceAccount") => safeString(item, "counterpartyAccountId"),
    Symbol("type") => self.parseTransactionType(safeString(item, "type")),
    Symbol("currency") => code,
    Symbol("amount") => functions.ccxtruthy((amountString == nothing)) ? nothing : self.parseNumber(stringAbs(amountString)),
    Symbol("before") => nothing,
    Symbol("after") => nothing,
    Symbol("status") => self.parseTransactionStatus(safeString(item, "status")),
    Symbol("fee") => fee
), currency = ledgerCurrency)

end
"""
fetch history of deposits, withdrawals, and transfers
see: https://api.docs.extended.exchange/#get-deposits-withdrawals-transfers-history

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: the earliest time in ms to fetch transactions for
- `limit`::int, optional: the maximum number of transaction structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchTransactions(self::Extended; code=nothing, since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchTransactions", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchTransactions", symbol = code, since = since, limit = limit, params = params, cursorReceived = "cursor", cursorSent = "cursor", cursorIncrement = nothing, maxEntriesPerRequest = 50))
    end
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.v1PrivateGetUserAssetOperations(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    pagination = self.safeDict(response, "pagination", defaultValue = Dict{Symbol, Any}());
    cursor = safeString(pagination, "cursor");
    result = [];
    dataLength = length(data);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, dataLength))
        entry = get(data, i + 1, nothing);
        if functions.ccxtruthy(@functions.ccxt_and((cursor != nothing), (i == dataLength - 1)))
            entry = extend(entry, Dict{Symbol, Any}(
    Symbol("cursor") => cursor
));
        end
        push!(result, entry);
        i += 1
    end
    return self.parseTransactions(result, currency = currency, since = since, limit = limit)

end
"""
fetch all deposits made to an account
see: https://api.docs.extended.exchange/#get-deposits-withdrawals-transfers-history

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposit structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDeposits(self::Extended; code=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchTransactions(code = code, since = since, limit = limit, params = extend(Dict{Symbol, Any}(
    Symbol("type") => "DEPOSIT"
), params)))

end
"""
fetch all withdrawals made from an account
see: https://api.docs.extended.exchange/#get-deposits-withdrawals-transfers-history

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawal structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchWithdrawals(self::Extended; code=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchTransactions(code = code, since = since, limit = limit, params = extend(Dict{Symbol, Any}(
    Symbol("type") => "WITHDRAWAL"
), params)))

end
"""
make a Starknet withdrawal
see: https://api.docs.extended.exchange/#withdrawals

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the Starknet address to withdraw to
- `tag`::string: unused
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.chainId`::string, optional: only STRK is supported
- `params.settlementExpiration`::int, optional: settlement expiration timestamp in seconds, defaults to now + 14 days + 60 seconds

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function withdraw(self::Extended, code, amount, address; tag=nothing, params=Dict())
    self.checkRequiredCredentials();
    Base.fetch(self.loadMarkets());
    currency = self.currency(code);
    chainId = safeStringUpper2(params, "chainId", "network", "STRK");
    if functions.ccxtruthy(chainId != "STRK")
        throw(BadRequest(string(self.id, " withdraw() only supports Starknet withdrawals with chainId STRK")));
    end
    if functions.ccxtruthy(functions.ccxt_le(length(address), 42))
        throw(BadRequest(string(self.id, " withdraw() requires a Starknet address for STRK withdrawals, EVM withdrawals require the bridge quote flow")));
    end
    account = Base.fetch(self.fetchExtendedAccount());
    amountString = self.currencyToPrecision(code, amount);
    accountId = safeString(account, "accountId");
    settlement = self.createWithdrawalSettlementData(address, amountString, currency, account, params = params);
    request = Dict{Symbol, Any}(
        Symbol("accountId") => accountId,
        Symbol("amount") => amountString,
        Symbol("chainId") => chainId,
        Symbol("asset") => get(currency, Symbol("id"), nothing),
        Symbol("settlement") => settlement
    );
    params = omit(params, ["chainId", "network", "settlementExpiration", "nonce", "recipient", "positionId", "l2Vault", "collateralId", "resolution"]);
    response = Base.fetch(self.v1PrivatePostUserWithdrawal(extend(request, params)));
    now = milliseconds();
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("id") => safeString(response, "data"),
    Symbol("txid") => nothing,
    Symbol("timestamp") => now,
    Symbol("datetime") => self.iso8601(now),
    Symbol("address") => address,
    Symbol("addressFrom") => nothing,
    Symbol("addressTo") => address,
    Symbol("tag") => tag,
    Symbol("tagFrom") => nothing,
    Symbol("tagTo") => tag,
    Symbol("type") => "withdrawal",
    Symbol("amount") => self.parseNumber(amountString),
    Symbol("currency") => get(currency, Symbol("code"), nothing),
    Symbol("status") => "pending",
    Symbol("updated") => now,
    Symbol("fee") => nothing,
    Symbol("network") => chainId,
    Symbol("comment") => nothing,
    Symbol("internal") => false
)

end
"""
fetch a history of internal transfers made on an account
see: https://api.docs.extended.exchange/#get-deposits-withdrawals-transfers-history

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: the earliest time in ms to fetch transfers for
- `limit`::int, optional: the maximum number of transfer structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
function fetchTransfers(self::Extended; code=nothing, since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchTransfers", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchTransfers", symbol = code, since = since, limit = limit, params = params, cursorReceived = "cursor", cursorSent = "cursor", cursorIncrement = nothing, maxEntriesPerRequest = 50))
    end
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    request = Dict{Symbol, Any}(
        Symbol("type") => "TRANSFER"
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.v1PrivateGetUserAssetOperations(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    pagination = self.safeDict(response, "pagination", defaultValue = Dict{Symbol, Any}());
    cursor = safeString(pagination, "cursor");
    result = [];
    dataLength = length(data);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, dataLength))
        entry = get(data, i + 1, nothing);
        if functions.ccxtruthy(@functions.ccxt_and((cursor != nothing), (i == dataLength - 1)))
            entry = extend(entry, Dict{Symbol, Any}(
    Symbol("cursor") => cursor
));
        end
        push!(result, entry);
        i += 1
    end
    return self.parseTransfers(result, currency = currency, since = since, limit = limit)

end
"""
transfer collateral between sub-accounts associated with the same wallet
see: https://api.docs.extended.exchange/#create-transfer

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to transfer
- `fromAccount`::string: source account id, defaults to the authenticated account id
- `toAccount`::string: destination account id
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.toVault`::string: destination account L2 vault
- `params.toL2Key`::string: destination account L2 public key
- `params.settlementExpiration`::int, optional: settlement expiration timestamp in seconds, defaults to now + 21 days

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
function transfer(self::Extended, code, amount, fromAccount, toAccount; params=Dict())
    self.checkRequiredCredentials();
    Base.fetch(self.loadMarkets());
    currency = self.currency(code);
    account = Base.fetch(self.fetchExtendedAccount());
    currentAccountId = safeString(account, "accountId", "");
    if functions.ccxtruthy(fromAccount == nothing)
        fromAccount = currentAccountId;
    elseif functions.ccxtruthy(fromAccount != currentAccountId)
        throw(BadRequest(string(self.id, " transfer() can only transfer from the authenticated account")));
    end
    toVault = safeString2(params, "toVault", "receiverPositionId");
    toL2Key = safeString2(params, "toL2Key", "receiverPublicKey");
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or((toAccount == nothing), (toVault == nothing)), (toL2Key == nothing)))
        throw(ArgumentsRequired(string(self.id, " transfer() requires a toAccount argument and params[\"toVault\"] and params[\"toL2Key\"]")));
    end
    amountString = self.currencyToPrecision(code, amount);
    settlement = self.createTransferSettlementData(amountString, currency, account, toVault, toL2Key, params = params);
    request = Dict{Symbol, Any}(
        Symbol("fromAccount") => fromAccount,
        Symbol("toAccount") => toAccount,
        Symbol("amount") => amountString,
        Symbol("transferredAsset") => get(currency, Symbol("id"), nothing),
        Symbol("settlement") => settlement
    );
    params = omit(params, ["fromVault", "senderPositionId", "fromL2Key", "senderPublicKey", "toVault", "receiverPositionId", "toL2Key", "receiverPublicKey", "settlementExpiration", "nonce", "assetId", "collateralId", "resolution"]);
    response = Base.fetch(self.v1PrivatePostUserTransfer(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    validSignature = self.safeBool(data, "validSignature");
    now = milliseconds();
    status = "pending";
    if functions.ccxtruthy(validSignature != nothing)
        status = functions.ccxtruthy(validSignature) ? "ok" : "failed";
    end
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("id") => safeString(data, "id"),
    Symbol("timestamp") => now,
    Symbol("datetime") => self.iso8601(now),
    Symbol("currency") => get(currency, Symbol("code"), nothing),
    Symbol("amount") => self.parseNumber(amountString),
    Symbol("fromAccount") => fromAccount,
    Symbol("toAccount") => toAccount,
    Symbol("status") => status
)

end
function parseTransfer(self::Extended, transfer; currency=nothing)
    timestamp = safeInteger(transfer, "time");
    assetId = safeString(transfer, "asset");
    code = self.getExtendedCurrencyCodeById(assetId, currency = currency);
    amountString = safeString(transfer, "amount");
    amount = functions.ccxtruthy((amountString == nothing)) ? nothing : self.parseNumber(stringAbs(amountString));
    accountId = safeString(transfer, "accountId");
    counterpartyAccountId = safeString(transfer, "counterpartyAccountId");
    fromAccount = accountId;
    toAccount = counterpartyAccountId;
    if functions.ccxtruthy(@functions.ccxt_and((amountString != nothing), !functions.ccxtruthy(stringLt(amountString, "0"))))
        fromAccount = counterpartyAccountId;
        toAccount = accountId;
    end
    validSignature = self.safeBool(transfer, "validSignature");
    status = nothing;
    if functions.ccxtruthy(validSignature != nothing)
        status = functions.ccxtruthy(validSignature) ? "ok" : "failed";
    else
        status = self.parseTransactionStatus(safeString(transfer, "status"));
    end
    return Dict{Symbol, Any}(
    Symbol("info") => transfer,
    Symbol("id") => safeString(transfer, "id"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("currency") => code,
    Symbol("amount") => amount,
    Symbol("fromAccount") => fromAccount,
    Symbol("toAccount") => toAccount,
    Symbol("status") => status
)

end
function getExtendedCurrencyCodeById(self::Extended, assetId; currency=nothing)
    if functions.ccxtruthy(assetId == nothing)
            return safeString(currency, "code")
    end
    currenciesByNumericId = self.safeDict(self.options, "currenciesByNumericId", defaultValue = Dict{Symbol, Any}());
    currencyByNumericId = self.safeDict(currenciesByNumericId, assetId);
    if functions.ccxtruthy(currencyByNumericId != nothing)
            return safeString(currencyByNumericId, "code")
    end
    if functions.ccxtruthy(currency != nothing)
            return get(currency, Symbol("code"), nothing)
    end
    code = self.safeCurrencyCode(assetId);
    if functions.ccxtruthy(code == "USD")
        code = "USDC";
    end
    return code

end
function parseTransactionStatus(self::Extended, status)
    statuses = Dict{Symbol, Any}(
        Symbol("CREATED") => "pending",
        Symbol("IN_PROGRESS") => "pending",
        Symbol("COMPLETED") => "ok",
        Symbol("REJECTED") => "failed"
    );
    return safeString(statuses, status, status)

end
function parseTransactionType(self::Extended, type_var)
    types = Dict{Symbol, Any}(
        Symbol("DEPOSIT") => "deposit",
        Symbol("WITHDRAWAL") => "withdrawal",
        Symbol("TRANSFER") => "transfer",
        Symbol("CLAIM") => "claim"
    );
    return safeString(types, type_var, type_var)

end
function parseTransaction(self::Extended, transaction; currency=nothing)
    timestamp = safeInteger(transaction, "time");
    assetId = safeString(transaction, "asset");
    code = self.getExtendedCurrencyCodeById(assetId, currency = currency);
    amountString = safeString(transaction, "amount");
    amount = functions.ccxtruthy((amountString == nothing)) ? nothing : self.parseNumber(stringAbs(amountString));
    fee = nothing;
    feeCost = safeString(transaction, "fee");
    if functions.ccxtruthy(feeCost != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("currency") => code,
            Symbol("cost") => self.parseNumber(stringAbs(feeCost))
        );
    end
    transactionType = self.parseTransactionType(safeString(transaction, "type"));
    network = safeString(transaction, "chain");
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => safeString(transaction, "id"),
    Symbol("txid") => safeString(transaction, "transactionHash"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("address") => nothing,
    Symbol("addressFrom") => nothing,
    Symbol("addressTo") => nothing,
    Symbol("tag") => nothing,
    Symbol("tagFrom") => nothing,
    Symbol("tagTo") => nothing,
    Symbol("type") => transactionType,
    Symbol("amount") => amount,
    Symbol("currency") => code,
    Symbol("status") => self.parseTransactionStatus(safeString(transaction, "status")),
    Symbol("updated") => timestamp,
    Symbol("fee") => fee,
    Symbol("network") => network,
    Symbol("comment") => nothing,
    Symbol("internal") => (transactionType == "transfer")
)

end
"""
fetch the trading fees for a market
see: https://api.docs.extended.exchange/#get-fees

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.builderId`::string, optional: builder client id

# Returns
- a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
"""
function fetchTradingFee(self::Extended, symbol; params=Dict())
    Base.fetch(self.loadMarkets());
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.v1PrivateGetUserFees(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    first_var = self.safeDict(data, 0, defaultValue = Dict{Symbol, Any}());
    return self.parseTradingFee(first_var, market = market)

end
"""
fetch the trading fees for multiple markets
see: https://api.docs.extended.exchange/#get-fees

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.market`::string, optional: exchange market id
- `params.builderId`::string, optional: builder client id

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
"""
function fetchTradingFees(self::Extended; params=Dict())
    Base.fetch(self.loadMarkets());
    response = Base.fetch(self.v1PrivateGetUserFees(params));
    data = self.safeList(response, "data", defaultValue = []);
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        fee = self.safeDict(data, i, defaultValue = Dict{Symbol, Any}());
        parsed = self.parseTradingFee(fee);
        symbol = safeString(parsed, "symbol");
        if functions.ccxtruthy(symbol != nothing)
            result[Symbol(symbol)] = parsed;
        end
        i += 1
    end
    return result

end
function parseTradingFee(self::Extended, fee; market=nothing)
    marketId = safeString(fee, "market");
    market = self.safeMarket(marketId = marketId, market = market);
    return Dict{Symbol, Any}(
    Symbol("info") => fee,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("maker") => self.safeNumber(fee, "makerFeeRate"),
    Symbol("taker") => self.safeNumber(fee, "takerFeeRate"),
    Symbol("percentage") => true,
    Symbol("tierBased") => nothing
)

end
"""
fetch the set leverage for a market
see: https://api.docs.extended.exchange/#get-leverage

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [leverage structure]{@link https://docs.ccxt.com/?id=leverage-structure}
"""
function fetchLeverage(self::Extended, symbol; params=Dict())
    Base.fetch(self.loadMarkets());
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.v1PrivateGetUserLeverage(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseLeverage(self.safeDict(data, 0, defaultValue = Dict{Symbol, Any}()), market = market)

end
"""
set the level of leverage for a market
see: https://api.docs.extended.exchange/#update-leverage

# Arguments
- `leverage`::int: the rate of leverage
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from the exchange
"""
function setLeverage(self::Extended, leverage; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setLeverage() requires a symbol argument")));
    end
    Base.fetch(self.loadMarkets());
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing),
        Symbol("leverage") => numberToString(leverage)
    );
    response = Base.fetch(self.v1PrivatePatchUserLeverage(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseLeverage(data, market = market)

end
function parseLeverage(self::Extended, leverage; market=nothing)
    marketId = safeString(leverage, "market");
    market = self.safeMarket(marketId = marketId, market = market);
    leverageValue = self.safeNumber(leverage, "leverage");
    return Dict{Symbol, Any}(
    Symbol("info") => leverage,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("marginMode") => nothing,
    Symbol("longLeverage") => leverageValue,
    Symbol("shortLeverage") => leverageValue
)

end
"""
fetch all open positions
see: https://api.docs.extended.exchange/#get-positions

# Arguments
- `symbols`::any: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPositions(self::Extended; symbols=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbols != nothing)
        marketIds = self.marketIds(symbols = symbols);
        request[Symbol("market")] = marketIds;
    end
    response = Base.fetch(self.v1PrivateGetUserPositions(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parsePositions(data, symbols = symbols)

end
"""
fetch data on an open position
see: https://api.docs.extended.exchange/#get-positions

# Arguments
- `symbol`::string: unified market symbol of the market the position is held in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPosition(self::Extended, symbol; params=Dict())
    positions = Base.fetch(self.fetchPositions(symbols = [symbol], params = params));
    return self.safeDict(positions, 0)

end
"""
fetch historical positions
see: https://api.docs.extended.exchange/#get-positions-history

# Arguments
- `symbols`::any: list of unified market symbols
- `since`::int, optional: the earliest time in ms to fetch positions for
- `limit`::int, optional: the maximum number of position structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPositionsHistory(self::Extended; symbols=nothing, since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    if functions.ccxtruthy(isa(symbols, AbstractString))
        symbols = [symbols];
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchPositionsHistory", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchPositionsHistory", symbol = symbols, since = since, limit = limit, params = params, cursorReceived = "cursor", cursorSent = "cursor", cursorIncrement = nothing, maxEntriesPerRequest = 10000))
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbols != nothing)
        marketIds = self.marketIds(symbols = symbols);
        request[Symbol("market")] = marketIds;
    end
    response = Base.fetch(self.v1PrivateGetUserPositionsHistory(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    pagination = self.safeDict(response, "pagination", defaultValue = Dict{Symbol, Any}());
    cursor = safeString(pagination, "cursor");
    result = [];
    dataLength = length(data);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, dataLength))
        entry = get(data, i + 1, nothing);
        if functions.ccxtruthy(@functions.ccxt_and((cursor != nothing), (i == dataLength - 1)))
            entry = extend(entry, Dict{Symbol, Any}(
    Symbol("cursor") => cursor
));
        end
        push!(result, entry);
        i += 1
    end
    positions = self.parsePositions(result, symbols = symbols);
    return self.filterBySinceLimit(positions, since = since, limit = limit, key = "timestamp")

end
function parsePosition(self::Extended, position; market=nothing)
    marketId = safeString(position, "market");
    market = self.safeMarket(marketId = marketId, market = market);
    timestamp = safeInteger2(position, "createdAt", "createdTime");
    lastUpdateTimestamp = safeInteger2(position, "updatedAt", "updatedTime");
    lastUpdateTimestamp = safeInteger(position, "closedTime", lastUpdateTimestamp);
    side = safeStringLower(position, "side");
    margin = safeString(position, "margin");
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => safeString(position, "id"),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastUpdateTimestamp") => lastUpdateTimestamp,
    Symbol("initialMargin") => margin,
    Symbol("initialMarginPercentage") => nothing,
    Symbol("maintenanceMargin") => nothing,
    Symbol("maintenanceMarginPercentage") => nothing,
    Symbol("entryPrice") => safeString(position, "openPrice"),
    Symbol("notional") => safeString(position, "value"),
    Symbol("leverage") => safeString(position, "leverage"),
    Symbol("unrealizedPnl") => safeString(position, "unrealisedPnl"),
    Symbol("realizedPnl") => safeString(position, "realisedPnl"),
    Symbol("contracts") => safeString(position, "size"),
    Symbol("contractSize") => safeString(market, "contractSize"),
    Symbol("marginRatio") => nothing,
    Symbol("liquidationPrice") => safeString(position, "liquidationPrice"),
    Symbol("markPrice") => safeString(position, "markPrice"),
    Symbol("lastPrice") => safeString(position, "exitPrice"),
    Symbol("collateral") => margin,
    Symbol("marginMode") => nothing,
    Symbol("side") => side,
    Symbol("percentage") => nothing,
    Symbol("hedged") => nothing,
    Symbol("stopLossPrice") => safeString(position, "slTriggerPrice"),
    Symbol("takeProfitPrice") => safeString(position, "tpTriggerPrice")
))

end
function getExtendedStarkAmount(self::Extended, amount, resolution; roundUp=false)
    resolutionString = numberToString(resolution);
    precise = stringMul(amount, resolutionString);
    result = decimalToPrecision(precise, TRUNCATE, 0, DECIMAL_PLACES, NO_PADDING);
    if functions.ccxtruthy(@functions.ccxt_and(roundUp, stringGt(precise, result)))
        result = stringAdd(result, "1");
    end
    return result

end
function fetchExtendedAccount(self::Extended; params=Dict())
    account = self.safeDict(self.options, "account");
    if functions.ccxtruthy(account != nothing)
            return account
    end
    accountData = Base.fetch(self.fetchAccount(params = params));
    account = get(accountData, Symbol("info"), nothing);
    self.options[Symbol("account")] = account;
    return account

end
function createOrderSettlementData(self::Extended, isBuy, amountString, priceString; params=Dict())
    totalFee = safeString(params, "totalFee");
    settlementExpiration = safeInteger(params, "settlementExpiration");
    nonce = safeInteger(params, "nonce");
    starkKey = safeString(params, "starkKey");
    collateralPosition = safeString(params, "collateralPosition");
    syntheticId = safeString(params, "syntheticId");
    collateralId = safeString(params, "collateralId");
    syntheticResolution = safeInteger(params, "syntheticResolution");
    collateralResolution = safeInteger(params, "collateralResolution");
    quoteAmount = stringMul(amountString, priceString);
    baseRoundUp = isBuy;
    quoteRoundUp = isBuy;
    baseAmount = self.getExtendedStarkAmount(amountString, syntheticResolution, roundUp = baseRoundUp);
    collateralAmount = self.getExtendedStarkAmount(quoteAmount, collateralResolution, roundUp = quoteRoundUp);
    if functions.ccxtruthy(isBuy)
        collateralAmount = stringNeg(collateralAmount);
    else
        baseAmount = stringNeg(baseAmount);
    end
    feeAmount = self.getExtendedStarkAmount(stringMul(totalFee, quoteAmount), collateralResolution, roundUp = true);
    settlement = Dict{Symbol, Any}(
        Symbol("starkKey") => starkKey,
        Symbol("collateralPosition") => collateralPosition,
        Symbol("baseAssetId") => syntheticId,
        Symbol("baseAmount") => baseAmount,
        Symbol("quoteAssetId") => collateralId,
        Symbol("quoteAmount") => collateralAmount,
        Symbol("feeAssetId") => collateralId,
        Symbol("feeAmount") => feeAmount,
        Symbol("expiration") => numberToString(settlementExpiration),
        Symbol("salt") => nonce
    );
    msgHash = self.getExtendedOrderMsgHash(settlement);
    sig = functions.ccxt_json_parse(self.extendedStarknetSign(msgHash, self.privateKey));
    r = self.getExtendedSignatureHex(get(sig, 1, nothing));
    s = self.getExtendedSignatureHex(get(sig, 2, nothing));
    settlement[Symbol("r")] = r;
    settlement[Symbol("s")] = s;
    return settlement

end
function createWithdrawalSettlementData(self::Extended, address, amountString, currency, account; params=Dict())
    now = milliseconds();
    settlementExpiration = safeInteger(params, "settlementExpiration", self.parseToInt((now + 999) / 1000) + 1209600 + 60);
    nonce = safeInteger(params, "nonce", self.nonce());
    positionId = safeString2(params, "positionId", "l2Vault", safeString(account, "l2Vault"));
    recipient = safeString(params, "recipient", address);
    currencyInfo = self.safeDict(currency, "info", defaultValue = Dict{Symbol, Any}());
    collateralId = safeString(params, "collateralId", safeString2(currencyInfo, "starkexId", "l1Id"));
    resolution = safeInteger(params, "resolution", safeValue2(currencyInfo, "starkexResolution", "l1Resolution"));
    starkKey = safeString(account, "l2Key");
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or((positionId == nothing), (collateralId == nothing)), (resolution == nothing)), (starkKey == nothing)))
        throw(BadRequest(string(self.id, " withdraw() requires currency starkexId/starkexResolution, account l2Vault and account l2Key")));
    end
    amount = self.getExtendedStarkAmount(amountString, resolution);
    settlement = Dict{Symbol, Any}(
        Symbol("recipient") => recipient,
        Symbol("positionId") => positionId,
        Symbol("collateralId") => collateralId,
        Symbol("amount") => amount,
        Symbol("expiration") => Dict{Symbol, Any}(
            Symbol("seconds") => settlementExpiration
        ),
        Symbol("salt") => nonce
    );
    msgHash = self.getExtendedWithdrawalMsgHash(settlement, starkKey);
    sig = functions.ccxt_json_parse(self.extendedStarknetSign(msgHash, self.privateKey));
    settlement[Symbol("signature")] = Dict{Symbol, Any}(
        Symbol("r") => self.getExtendedSignatureHex(get(sig, 1, nothing)),
        Symbol("s") => self.getExtendedSignatureHex(get(sig, 2, nothing))
    );
    return settlement

end
function createTransferSettlementData(self::Extended, amountString, currency, account, toVault, toL2Key; params=Dict())
    now = milliseconds();
    settlementExpiration = safeInteger(params, "settlementExpiration", self.parseToInt((now + 999) / 1000) + 1814400);
    nonce = safeInteger(params, "nonce", self.nonce());
    fromVault = safeString2(params, "fromVault", "senderPositionId", safeString(account, "l2Vault"));
    fromL2Key = safeString2(params, "fromL2Key", "senderPublicKey", safeString(account, "l2Key"));
    currencyInfo = self.safeDict(currency, "info", defaultValue = Dict{Symbol, Any}());
    collateralId = safeString2(params, "assetId", "collateralId", safeString2(currencyInfo, "starkexId", "l1Id"));
    resolution = safeInteger(params, "resolution", safeValue2(currencyInfo, "starkexResolution", "l1Resolution"));
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or((fromVault == nothing), (fromL2Key == nothing)), (collateralId == nothing)), (resolution == nothing)))
        throw(BadRequest(string(self.id, " transfer() requires currency starkexId/starkexResolution, account l2Vault and account l2Key")));
    end
    transferAmount = self.getExtendedStarkAmount(amountString, resolution);
    settlement = Dict{Symbol, Any}(
        Symbol("amount") => transferAmount,
        Symbol("assetId") => collateralId,
        Symbol("expirationTimestamp") => settlementExpiration,
        Symbol("nonce") => nonce,
        Symbol("receiverPositionId") => toVault,
        Symbol("receiverPublicKey") => toL2Key,
        Symbol("senderPositionId") => fromVault,
        Symbol("senderPublicKey") => fromL2Key
    );
    msgHash = self.getExtendedTransferMsgHash(settlement);
    sig = functions.ccxt_json_parse(self.extendedStarknetSign(msgHash, self.privateKey));
    settlement[Symbol("signature")] = Dict{Symbol, Any}(
        Symbol("r") => self.getExtendedSignatureHex(get(sig, 1, nothing)),
        Symbol("s") => self.getExtendedSignatureHex(get(sig, 2, nothing))
    );
    return settlement

end
function createExtendedOrderRequest(self::Extended, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(type_var == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a type argument")));
    end
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a side argument")));
    end
    Base.fetch(self.loadMarkets());
    market = self.market(symbol);
    uppercaseType = uppercase(type_var);
    uppercaseSide = uppercase(side);
    if functions.ccxtruthy(@functions.ccxt_and(get(market, Symbol("spot"), nothing), uppercaseType != "LIMIT"))
        throw(BadRequest(string(self.id, " createOrder() supports limit orders for spot markets only")));
    end
    if functions.ccxtruthy(!functions.ccxtruthy(inArray(uppercaseType, ["LIMIT", "MARKET", "CONDITIONAL", "TPSL"])))
        throw(BadRequest(string(self.id, " createOrder() supports limit, market, conditional and tpsl orders only")));
    end
    if functions.ccxtruthy(price == nothing)
        throw(ArgumentsRequired(string(self.id, " createOrder() requires a price argument")));
    end
    amountString = self.amountToPrecision(symbol, amount);
    priceString = self.priceToPrecision(symbol, price);
    postOnly = self.isPostOnly(uppercaseType == "MARKET", nothing, params = params);
    reduceOnly = self.safeBool2(params, "reduceOnly", "reduce_only", defaultValue = false);
    timeInForce = safeStringUpper(params, "timeInForce");
    if functions.ccxtruthy(timeInForce == nothing)
        timeInForce = functions.ccxtruthy((uppercaseType == "MARKET")) ? "IOC" : "GTT";
    end
    fee = safeString(params, "fee", "0.0005");
    builderFeeRate = nothing;
    builderId = nothing;
    if functions.ccxtruthy(self.isSandboxModeEnabled)
        builderFeeRate = safeString2(params, "builderFeeRate", "defaultBuilderFeeRate");
        builderId = safeString2(params, "builderId", "defaultBuilderId");
        params = omit(params, ["builderFeeRate", "defaultBuilderFeeRate", "builderId", "defaultBuilderId"]);
    else
        (builderFeeRate, params) = self.handleOptionAndParams(params, "createOrder", "builderFeeRate", defaultValue = "0.0001");
        (builderId, params) = self.handleOptionAndParams(params, "createOrder", "builderId");
    end
    totalFee = fee;
    if functions.ccxtruthy(builderFeeRate != nothing)
        totalFee = stringAdd(fee, builderFeeRate);
    end
    now = milliseconds();
    expiryEpochMillis = safeInteger(params, "expiryEpochMillis", now + 3600000);
    settlementExpiration = safeInteger(params, "settlementExpiration", self.parseToInt((expiryEpochMillis + 999) / 1000) + 1209600);
    nonce = numberToString(self.nonce());
    account = Base.fetch(self.fetchExtendedAccount());
    starkKey = safeString(account, "l2Key");
    collateralPosition = safeString(account, "l2Vault");
    info = self.safeDict(market, "info", defaultValue = Dict{Symbol, Any}());
    l2Config = self.safeDict(info, "l2Config", defaultValue = Dict{Symbol, Any}());
    syntheticId = safeString(l2Config, "syntheticId");
    collateralId = safeString(l2Config, "collateralId");
    syntheticResolution = safeInteger(l2Config, "syntheticResolution");
    collateralResolution = safeInteger(l2Config, "collateralResolution");
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or((syntheticId == nothing), (collateralId == nothing)), (syntheticResolution == nothing)), (collateralResolution == nothing)))
        throw(BadRequest(string(self.id, " createOrder() requires l2Config in market info")));
    end
    settlementParams = Dict{Symbol, Any}(
        Symbol("totalFee") => totalFee,
        Symbol("starkKey") => starkKey,
        Symbol("syntheticId") => syntheticId,
        Symbol("syntheticResolution") => syntheticResolution,
        Symbol("collateralId") => collateralId,
        Symbol("collateralResolution") => collateralResolution,
        Symbol("settlementExpiration") => settlementExpiration,
        Symbol("nonce") => nonce,
        Symbol("collateralPosition") => collateralPosition
    );
    isBuy = (uppercaseSide == "BUY");
    clientOrderId = safeString2(params, "clientOrderId", "client_id", uuid());
    request = Dict{Symbol, Any}(
        Symbol("id") => clientOrderId,
        Symbol("market") => get(market, Symbol("id"), nothing),
        Symbol("type") => uppercaseType,
        Symbol("side") => uppercaseSide,
        Symbol("qty") => amountString,
        Symbol("price") => priceString,
        Symbol("timeInForce") => timeInForce,
        Symbol("expiryEpochMillis") => expiryEpochMillis,
        Symbol("fee") => fee,
        Symbol("nonce") => nonce,
        Symbol("postOnly") => postOnly,
        Symbol("reduceOnly") => reduceOnly,
        Symbol("selfTradeProtectionLevel") => "ACCOUNT"
    );
    if functions.ccxtruthy(builderFeeRate != nothing)
        request[Symbol("builderFee")] = builderFeeRate;
    end
    if functions.ccxtruthy(builderId != nothing)
        request[Symbol("builderId")] = builderId;
    end
    cancelId = safeString2(params, "cancelId", "previousOrderId");
    if functions.ccxtruthy(cancelId != nothing)
        request[Symbol("cancelId")] = cancelId;
    end
    settlement = self.createOrderSettlementData(isBuy, amountString, priceString, params = settlementParams);
    request[Symbol("settlement")] = Dict{Symbol, Any}(
        Symbol("signature") => Dict{Symbol, Any}(
            Symbol("r") => get(settlement, Symbol("r"), nothing),
            Symbol("s") => get(settlement, Symbol("s"), nothing)
        ),
        Symbol("starkKey") => starkKey,
        Symbol("collateralPosition") => collateralPosition
    );
    triggerPriceStr = safeString2(params, "triggerPrice", "stopPrice");
    stopLossTriggerPrice = safeString(params, "stopLossPrice");
    takeProfitTriggerPrice = safeString(params, "takeProfitPrice");
    isStopLossOrder = stopLossTriggerPrice != nothing;
    isTakeProfitOrder = takeProfitTriggerPrice != nothing;
    stopLoss = self.safeDict(params, "stopLoss");
    takeProfit = self.safeDict(params, "takeProfit");
    hasStopLoss = (stopLoss != nothing);
    hasTakeProfit = (takeProfit != nothing);
    if functions.ccxtruthy(@functions.ccxt_or(hasStopLoss, hasTakeProfit))
        request[Symbol("tpSlType")] = "ORDER";
        if functions.ccxtruthy(hasStopLoss)
            stopLossTrigger = safeString(stopLoss, "triggerPrice");
            stopLossTriggerPriceType = safeString(stopLoss, "triggerPriceType");
            stopLossExecutionPrice = safeString(stopLoss, "price");
            stopLossType = safeString(stopLoss, "type");
            stopLossSettlement = self.createOrderSettlementData(!functions.ccxtruthy(isBuy), amountString, stopLossExecutionPrice, params = settlementParams);
            requestStopLoss = Dict{Symbol, Any}(
                Symbol("triggerPrice") => self.priceToPrecision(symbol, stopLossTrigger),
                Symbol("price") => self.priceToPrecision(symbol, stopLossExecutionPrice),
                Symbol("settlement") => Dict{Symbol, Any}(
                    Symbol("signature") => Dict{Symbol, Any}(
                        Symbol("r") => get(stopLossSettlement, Symbol("r"), nothing),
                        Symbol("s") => get(stopLossSettlement, Symbol("s"), nothing)
                    ),
                    Symbol("starkKey") => starkKey,
                    Symbol("collateralPosition") => collateralPosition
                )
            );
            if functions.ccxtruthy(stopLossTriggerPriceType != nothing)
                requestStopLoss[Symbol("triggerPriceType")] = stopLossTriggerPriceType;
            end
            if functions.ccxtruthy(stopLossType != nothing)
                requestStopLoss[Symbol("priceType")] = stopLossType;
            end
            request[Symbol("stopLoss")] = requestStopLoss;
        end
        if functions.ccxtruthy(hasTakeProfit)
            takeProfitTrigger = safeString(takeProfit, "triggerPrice");
            takeProfitTriggerPriceType = safeString(takeProfit, "triggerPriceType");
            takeProfitExecutionPrice = safeString(takeProfit, "price");
            takeProfitType = safeString(takeProfit, "type");
            takeProfitSettlement = self.createOrderSettlementData(!functions.ccxtruthy(isBuy), amountString, takeProfitExecutionPrice, params = settlementParams);
            requestTakeProfit = Dict{Symbol, Any}(
                Symbol("triggerPrice") => self.priceToPrecision(symbol, takeProfitTrigger),
                Symbol("price") => self.priceToPrecision(symbol, takeProfitExecutionPrice),
                Symbol("settlement") => Dict{Symbol, Any}(
                    Symbol("signature") => Dict{Symbol, Any}(
                        Symbol("r") => get(takeProfitSettlement, Symbol("r"), nothing),
                        Symbol("s") => get(takeProfitSettlement, Symbol("s"), nothing)
                    ),
                    Symbol("starkKey") => starkKey,
                    Symbol("collateralPosition") => collateralPosition
                )
            );
            if functions.ccxtruthy(takeProfitTriggerPriceType != nothing)
                requestTakeProfit[Symbol("triggerPriceType")] = takeProfitTriggerPriceType;
            end
            if functions.ccxtruthy(takeProfitType != nothing)
                requestTakeProfit[Symbol("priceType")] = takeProfitType;
            end
            request[Symbol("takeProfit")] = requestTakeProfit;
        end
    else
        if functions.ccxtruthy(triggerPriceStr != nothing)
            triggerDirection = safeStringUpper(params, "triggerDirection");
            if functions.ccxtruthy(triggerDirection == nothing)
                throw(ArgumentsRequired(string(self.id, " createOrder() requires triggerDirection for trigger order")));
            end
            trigger = Dict{Symbol, Any}(
                Symbol("triggerPrice") => self.priceToPrecision(symbol, triggerPriceStr)
            );
            trigger[Symbol("direction")] = triggerDirection;
            request[Symbol("type")] = "CONDITIONAL";
            request[Symbol("trigger")] = trigger;
        elseif functions.ccxtruthy(@functions.ccxt_or(isStopLossOrder, isTakeProfitOrder))
            triggerPriceStr = functions.ccxtruthy(isStopLossOrder) ? stopLossTriggerPrice : takeProfitTriggerPrice;
            trigger = Dict{Symbol, Any}(
                Symbol("triggerPrice") => self.priceToPrecision(symbol, triggerPriceStr)
            );
            if functions.ccxtruthy(isBuy)
                trigger[Symbol("direction")] = functions.ccxtruthy(isStopLossOrder) ? "UP" : "DOWN";
            else
                trigger[Symbol("direction")] = functions.ccxtruthy(isStopLossOrder) ? "DOWN" : "UP";
            end
            request[Symbol("type")] = "CONDITIONAL";
            request[Symbol("trigger")] = trigger;
        end
    end
    params = omit(params, ["clientOrderId", "client_id", "timeInForce", "postOnly", "reduceOnly", "reduce_only", "fee", "nonce", "expiryEpochMillis", "settlementExpiration", "cancelId", "previousOrderId", "brokerId", "referralCode", "triggerPrice", "stopPrice", "triggerDirection", "stopLossPrice", "takeProfitPrice", "stopLoss", "takeProfit"]);
    return Dict{Symbol, Any}(
    Symbol("request") => extend(request, params),
    Symbol("market") => market,
    Symbol("timestamp") => now,
    Symbol("clientOrderId") => clientOrderId,
    Symbol("price") => priceString,
    Symbol("amount") => amountString
)

end
"""
create a trade order
see: https://api.docs.extended.exchange/#create-or-edit-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'limit' or 'market'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, required for all order types
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: client order id, sent as the exchange order id
- `params.cancelId`::string, optional: previous external order id to replace
- `params.timeInForce`::string, optional: 'GTT' or 'IOC'
- `params.postOnly`::bool, optional: true if the order should only make liquidity
- `params.reduceOnly`::bool, optional: true if the order should only reduce a position
- `params.fee`::string, optional: max fee rate for the order, default is 0.0005
- `params.expiryEpochMillis`::int, optional: order expiration timestamp in milliseconds, default is now + 1 hour
- `params.triggerPrice`::float, optional: *swap only* The price at which a trigger order is triggered at
- `params.stopLossPrice`::float, optional: *swap only* The price at which a stop loss order is triggered at
- `params.takeProfitPrice`::float, optional: *swap only* The price at which a take profit order is triggered at
- `params.takeProfit`::object, optional: *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered (perpetual swap markets only)
- `params.takeProfit.triggerPrice`::float, optional: *swap only* take profit trigger price
- `params.takeProfit.price`::float, optional: *swap only* the execution price for a take profit attached to a trigger order
- `params.takeProfit.type`::string, optional: *swap only* the type for a take profit attached to a trigger order, 'LAST', 'MARK' or 'INDEX', default is ''
- `params.stopLoss`::object, optional: *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered (perpetual swap markets only)
- `params.stopLoss.triggerPrice`::float, optional: *swap only* stop loss trigger price
- `params.stopLoss.price`::float, optional: *swap only* the execution price for a stop loss attached to a trigger order
- `params.stopLoss.type`::string, optional: *swap only* the type for a stop loss attached to a trigger order, 'LAST', 'MARK' or 'INDEX', default is ''

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrder(self::Extended, symbol, type_var, side, amount; price=nothing, params=Dict())
    self.checkRequiredCredentials();
    extendedOrderRequest = Base.fetch(self.createExtendedOrderRequest(symbol, type_var, side, amount, price = price, params = params));
    request = self.safeDict(extendedOrderRequest, "request", defaultValue = Dict{Symbol, Any}());
    response = Base.fetch(self.v1PrivatePostUserOrder(request));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    market = get(extendedOrderRequest, Symbol("market"), nothing);
    now = safeInteger(extendedOrderRequest, "timestamp");
    data[Symbol("timestamp")] = now;
    data[Symbol("status")] = "NEW";
    return self.parseOrder(extend(request, data), market = market)

end
"""
edit a trade order
see: https://api.docs.extended.exchange/#create-or-edit-order

# Arguments
- `id`::string: order id assigned by Extended
- `symbol`::string: unified symbol of the market to edit an order in
- `type`::string: 'limit' or 'market'
- `side`::string: 'buy' or 'sell'
- `amount`::float, optional: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function editOrder(self::Extended, id, symbol, type_var, side; amount=nothing, price=nothing, params=Dict())
    if functions.ccxtruthy(id == nothing)
        throw(ArgumentsRequired(string(self.id, " editOrder() requires an id argument")));
    end
    expiryEpochMillis = safeInteger(params, "expiryEpochMillis");
    postOnly = self.safeBool(params, "postOnly");
    reduceOnly = self.safeBool2(params, "reduceOnly", "reduce_only");
    cancelId = safeString2(params, "cancelId", "previousOrderId");
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or((amount == nothing), (price == nothing)), (expiryEpochMillis == nothing)), (postOnly == nothing)), (reduceOnly == nothing)), (cancelId == nothing)))
        response = Base.fetch(self.v1PrivateGetUserOrdersId(Dict{Symbol, Any}(
            Symbol("id") => id
        )));
        order = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
        if functions.ccxtruthy(amount == nothing)
            amount = self.safeNumber(order, "qty");
        end
        if functions.ccxtruthy(price == nothing)
            price = self.safeNumber(order, "price");
        end
        if functions.ccxtruthy(expiryEpochMillis == nothing)
            expiryEpochMillis = safeInteger(order, "expireTime");
        end
        if functions.ccxtruthy(postOnly == nothing)
            postOnly = self.safeBool(order, "postOnly", defaultValue = false);
        end
        if functions.ccxtruthy(reduceOnly == nothing)
            reduceOnly = self.safeBool(order, "reduceOnly", defaultValue = false);
        end
        if functions.ccxtruthy(cancelId == nothing)
            cancelId = safeString(order, "externalId");
        end
    end
    if functions.ccxtruthy(amount == nothing)
        throw(ArgumentsRequired(string(self.id, " editOrder() requires an amount argument or an existing order with qty")));
    end
    if functions.ccxtruthy(price == nothing)
        throw(ArgumentsRequired(string(self.id, " editOrder() requires a price argument or an existing order with price")));
    end
    params = extend(Dict{Symbol, Any}(
    Symbol("postOnly") => postOnly,
    Symbol("reduceOnly") => reduceOnly
), params);
    requestParams = extend(params, Dict{Symbol, Any}(
        Symbol("cancelId") => cancelId,
        Symbol("expiryEpochMillis") => expiryEpochMillis
    ));
    extendedOrderRequest = Base.fetch(self.createExtendedOrderRequest(symbol, type_var, side, amount, price = price, params = requestParams));
    request = self.safeDict(extendedOrderRequest, "request", defaultValue = Dict{Symbol, Any}());
    editResponse = Base.fetch(self.v1PrivatePostUserOrder(request));
    responseData = self.safeDict(editResponse, "data", defaultValue = Dict{Symbol, Any}());
    market = get(extendedOrderRequest, Symbol("market"), nothing);
    now = safeInteger(extendedOrderRequest, "timestamp");
    responseData[Symbol("timestamp")] = now;
    responseData[Symbol("status")] = "NEW";
    return self.parseOrder(extend(request, responseData), market = market)

end
"""
cancels an open order
see: https://api.docs.extended.exchange/#cancel-order-by-id
see: https://api.docs.extended.exchange/#cancel-order-by-external-id

# Arguments
- `id`::string: order id assigned by Extended
- `symbol`::string, optional: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: user-defined order id, cancels by external id

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::Extended, id; symbol=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    response = nothing;
    clientOrderId = safeString2(params, "clientOrderId", "client_id");
    params = omit(params, ["clientOrderId", "client_id"]);
    if functions.ccxtruthy(clientOrderId != nothing)
        request = Dict{Symbol, Any}(
            Symbol("externalId") => clientOrderId
        );
        response = Base.fetch(self.v1PrivateDeleteUserOrder(extend(request, params)));
    else
        if functions.ccxtruthy(id == nothing)
            throw(ArgumentsRequired(string(self.id, " cancelOrder() requires an id argument")));
        end
        request = Dict{Symbol, Any}(
            Symbol("id") => id
        );
        response = Base.fetch(self.v1PrivateDeleteUserOrderId(extend(request, params)));
    end
    orderId = functions.ccxtruthy((clientOrderId == nothing)) ? id : nothing;
    orderSymbol = functions.ccxtruthy((market == nothing)) ? symbol : get(market, Symbol("symbol"), nothing);
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("id") => orderId,
    Symbol("clientOrderId") => clientOrderId,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("symbol") => orderSymbol,
    Symbol("status") => "canceled"
), market = market)

end
"""
cancel multiple orders by order ids or client order ids
see: https://api.docs.extended.exchange/#mass-cancel

# Arguments
- `ids`::array: order ids
- `symbol`::string, optional: unified market symbol, only used to populate the returned orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderIds`::array, optional: client order ids
- `params.clientOrderId`::string, optional: single client order id

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrders(self::Extended, ids; symbol=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    clientOrderIds = self.safeListN(params, ["clientOrderIds", "client_order_ids", "externalOrderIds", "external_order_ids"]);
    clientOrderId = safeString2(params, "clientOrderId", "client_id");
    params = omit(params, ["clientOrderIds", "client_order_ids", "clientOrderId", "client_id", "externalOrderIds", "external_order_ids", "orderIds", "order_ids", "markets", "cancelAll", "cancel_all"]);
    request = Dict{Symbol, Any}();
    hasOrderIds = ids != nothing;
    if functions.ccxtruthy(hasOrderIds)
        idsLength = length(ids);
        if functions.ccxtruthy(functions.ccxt_gt(idsLength, 0))
            request[Symbol("orderIds")] = ids;
        end
    end
    if functions.ccxtruthy(@functions.ccxt_and(clientOrderIds == nothing, clientOrderId != nothing))
        clientOrderIds = [clientOrderId];
    end
    hasClientOrderIds = clientOrderIds != nothing;
    if functions.ccxtruthy(clientOrderIds != nothing)
        clientOrderIdsLength = length(clientOrderIds);
        if functions.ccxtruthy(functions.ccxt_gt(clientOrderIdsLength, 0))
            request[Symbol("externalOrderIds")] = clientOrderIds;
        end
    end
    if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy(hasOrderIds), !functions.ccxtruthy(hasClientOrderIds)))
        throw(ArgumentsRequired(string(self.id, " cancelOrders() requires an ids argument or clientOrderIds parameter")));
    end
    Base.fetch(self.v1PrivatePostUserOrderMassCancel(extend(request, params)));
    return []

end
"""
cancels all open orders, optionally filtered by symbol
see: https://api.docs.extended.exchange/#mass-cancel

# Arguments
- `symbol`::string, optional: unified market symbol of the market to cancel orders in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelAllOrders(self::Extended; symbol=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    request = Dict{Symbol, Any}(
        Symbol("cancelAll") => true
    );
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("markets")] = [get(market, Symbol("id"), nothing)];
    end
    Base.fetch(self.v1PrivatePostUserOrderMassCancel(extend(request, params)));
    return []

end
"""
dead man's switch, cancel all orders after the given timeout
see: https://api.docs.extended.exchange/#mass-auto-cancel-dead-man-39-s-switch

# Arguments
- `timeout`::float: time in milliseconds, 0 represents cancel the timer
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the api result
"""
function cancelAllOrdersAfter(self::Extended, timeout; params=Dict())
    Base.fetch(self.loadMarkets());
    request = Dict{Symbol, Any}(
        Symbol("countdownTime") => functions.ccxtruthy((functions.ccxt_gt(timeout, 0))) ? self.parseToInt(timeout / 1000) : 0
    );
    return Base.fetch(self.v1PrivatePostUserDeadmanswitch(extend(request, params)))

end
"""
fetches information on an order made by the user
see: https://api.docs.extended.exchange/#get-order-by-id
see: https://api.docs.extended.exchange/#get-orders-by-external-id

# Arguments
- `id`::string: order id assigned by Extended
- `symbol`::string, optional: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: user-defined order id, fetches by external id

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrder(self::Extended, id; symbol=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    response = nothing;
    order = nothing;
    clientOrderId = safeString2(params, "clientOrderId", "client_id");
    params = omit(params, ["clientOrderId", "client_id"]);
    if functions.ccxtruthy(clientOrderId != nothing)
        request = Dict{Symbol, Any}(
            Symbol("externalId") => clientOrderId
        );
        response = Base.fetch(self.v1PrivateGetUserOrdersExternalExternalId(extend(request, params)));
        data = self.safeList(response, "data", defaultValue = []);
        order = self.safeDict(data, 0, defaultValue = Dict{Symbol, Any}());
    else
        if functions.ccxtruthy(id == nothing)
            throw(ArgumentsRequired(string(self.id, " fetchOrder() requires an id argument")));
        end
        request = Dict{Symbol, Any}(
            Symbol("id") => id
        );
        response = Base.fetch(self.v1PrivateGetUserOrdersId(extend(request, params)));
        order = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    end
    return self.parseOrder(order, market = market)

end
"""
fetch all unfilled currently open orders
see: https://api.docs.extended.exchange/#get-open-orders

# Arguments
- `symbol`::string, optional: unified market symbol of the orders
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of open order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Extended; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("market")] = get(market, Symbol("id"), nothing);
    end
    response = Base.fetch(self.v1PrivateGetUserOrders(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    orders = self.parseOrders(data, market = market, since = since, limit = limit);
    return self.filterBySymbolSinceLimit(orders, symbol = symbol, since = since, limit = limit)

end
"""
fetches information on multiple orders made by the user
see: https://api.docs.extended.exchange/#get-orders-history

# Arguments
- `symbol`::string, optional: unified market symbol of the orders
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrders(self::Extended; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOrders", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchOrders", symbol = symbol, since = since, limit = limit, params = params, cursorReceived = "cursor", cursorSent = "cursor", cursorIncrement = nothing, maxEntriesPerRequest = 100))
    end
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("market")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.v1PrivateGetUserOrdersHistory(extend(params, request)));
    data = self.safeList(response, "data", defaultValue = []);
    pagination = self.safeDict(response, "pagination", defaultValue = Dict{Symbol, Any}());
    cursor = safeString(pagination, "cursor");
    result = [];
    dataLength = length(data);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, dataLength))
        entry = get(data, i + 1, nothing);
        if functions.ccxtruthy(@functions.ccxt_and((cursor != nothing), (i == dataLength - 1)))
            entry = extend(entry, Dict{Symbol, Any}(
    Symbol("cursor") => cursor
));
        end
        push!(result, entry);
        i += 1
    end
    orders = self.parseOrders(result, market = market, since = since, limit = limit);
    return self.filterBySymbolSinceLimit(orders, symbol = symbol, since = since, limit = limit)

end
"""
fetches information on multiple closed orders made by the user
see: https://api.docs.extended.exchange/#get-orders-history

# Arguments
- `symbol`::string, optional: unified market symbol of the orders
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchClosedOrders(self::Extended; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    orders = Base.fetch(self.fetchOrders(symbol = symbol, since = since, limit = nothing, params = params));
    closedOrders = filterBy(orders, "status", "closed");
    return self.filterBySymbolSinceLimit(closedOrders, symbol = symbol, since = since, limit = limit)

end
"""
fetches information on multiple canceled orders made by the user
see: https://api.docs.extended.exchange/#get-orders-history

# Arguments
- `symbol`::string, optional: unified market symbol of the orders
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchCanceledOrders(self::Extended; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    orders = Base.fetch(self.fetchOrders(symbol = symbol, since = since, limit = nothing, params = params));
    canceledOrders = filterBy(orders, "status", "canceled");
    return self.filterBySymbolSinceLimit(canceledOrders, symbol = symbol, since = since, limit = limit)

end
function parseOrderStatus(self::Extended, status)
    statuses = Dict{Symbol, Any}(
        Symbol("NEW") => "open",
        Symbol("PARTIALLY_FILLED") => "open",
        Symbol("UNTRIGGERED") => "open",
        Symbol("TRIGGERED") => "open",
        Symbol("FILLED") => "closed",
        Symbol("CANCELLED") => "canceled",
        Symbol("REJECTED") => "rejected",
        Symbol("EXPIRED") => "expired"
    );
    return safeString(statuses, status, status)

end
function parseOrder(self::Extended, order; market=nothing)
    marketId = safeString(order, "market");
    market = self.safeMarket(marketId = marketId, market = market);
    timestamp = safeInteger2(order, "createdTime", "timestamp");
    lastUpdateTimestamp = safeInteger(order, "updatedTime");
    status = self.parseOrderStatus(safeString(order, "status"));
    side = safeStringLower(order, "side");
    type_var = safeStringLower(order, "type");
    amount = safeString(order, "qty");
    filled = safeString(order, "filledQty");
    feeCost = safeString(order, "payedFee");
    trigger = self.safeDict(order, "trigger", defaultValue = Dict{Symbol, Any}());
    takeProfit = self.safeDict(order, "takeProfit", defaultValue = Dict{Symbol, Any}());
    stopLoss = self.safeDict(order, "stopLoss", defaultValue = Dict{Symbol, Any}());
    fee = Dict{Symbol, Any}(
        Symbol("cost") => feeCost,
        Symbol("currency") => functions.ccxtruthy((market == nothing)) ? nothing : get(market, Symbol("settle"), nothing)
    );
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => safeString(order, "id"),
    Symbol("clientOrderId") => safeString(order, "externalId"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("lastUpdateTimestamp") => lastUpdateTimestamp,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("type") => type_var,
    Symbol("timeInForce") => safeString(order, "timeInForce"),
    Symbol("postOnly") => self.safeBool(order, "postOnly"),
    Symbol("reduceOnly") => self.safeBool(order, "reduceOnly"),
    Symbol("side") => side,
    Symbol("price") => safeString(order, "price"),
    Symbol("triggerPrice") => safeString(trigger, "triggerPrice"),
    Symbol("takeProfitPrice") => safeString(takeProfit, "triggerPrice"),
    Symbol("stopLossPrice") => safeString(stopLoss, "triggerPrice"),
    Symbol("amount") => amount,
    Symbol("cost") => nothing,
    Symbol("average") => safeString(order, "averagePrice"),
    Symbol("filled") => filled,
    Symbol("remaining") => nothing,
    Symbol("status") => status,
    Symbol("fee") => fee,
    Symbol("trades") => nothing
), market = market)

end
function getExtendedStringToFelt(self::Extended, value)
    return self.convertToBigInt(self.stringToBase16(value))

end
function getExtendedEncodeI64(self::Extended, value)
    prime = "3618502788666131213697322783095070105623107215331596699973092056135872020481";
    valueString = numberToString(value);
    if functions.ccxtruthy(stringLt(valueString, "0"))
            return stringAdd(prime, valueString)
    end
    return value

end
function getExtendedDecimalToBase16(self::Extended, value)
    decimalString = "";
    if functions.ccxtruthy(isa(value, AbstractString))
        decimalString = value;
    else
        decimalString = numberToString(value);
    end
    hexChars = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
    result = "";
    while functions.ccxtruthy(stringGt(decimalString, "0"))
        remainder = self.parseToInt(stringMod(decimalString, "16"));
        result = string(get(hexChars, remainder + 1, nothing), result);
        decimalString = stringDiv(decimalString, "16", 0);
    end
    if functions.ccxtruthy(result == "")
            return "0"
    end
    return result

end
function getExtendedSignatureHex(self::Extended, signature)
    if functions.ccxtruthy(isa(signature, AbstractString))
        if functions.ccxtruthy(findfirst("0x", signature) !== nothing)
                return signature
        end
            return string("0x", self.getExtendedDecimalToBase16(signature))
    end
    signatureString = numberToString(signature);
    if functions.ccxtruthy(findfirst("0x", signatureString) !== nothing)
            return signatureString
    end
    return string("0x", self.getExtendedDecimalToBase16(signatureString))

end
function getExtendedDomainHash(self::Extended, )
    domainTypeHash = self.convertToBigInt(self.extendedStarknetGetSelectorFromName("\"StarknetDomain\"(\"name\":\"shortstring\",\"version\":\"shortstring\",\"chainId\":\"shortstring\",\"revision\":\"shortstring\")"));
    isTestnet = findfirst("sepolia", get(get(self.urls, Symbol("api"), nothing), Symbol("rest"), nothing)) !== nothing;
    defaultChainId = functions.ccxtruthy(isTestnet) ? "SN_SEPOLIA" : "SN_MAIN";
    chainId = safeString(self.options, "chainId", defaultChainId);
    return self.convertToBigInt(self.extendedStarknetComputePoseidonHashOnElements([domainTypeHash, self.getExtendedStringToFelt("Perpetuals"), self.getExtendedStringToFelt("v0"), self.getExtendedStringToFelt(chainId), self.convertToBigInt("1")]))

end
function getExtendedOrderMsgHash(self::Extended, settlement)
    orderTypeHash = self.convertToBigInt(self.extendedStarknetGetSelectorFromName("\"Order\"(\"position_id\":\"felt\",\"base_asset_id\":\"AssetId\",\"base_amount\":\"i64\",\"quote_asset_id\":\"AssetId\",\"quote_amount\":\"i64\",\"fee_asset_id\":\"AssetId\",\"fee_amount\":\"u64\",\"expiration\":\"Timestamp\",\"salt\":\"felt\")\"PositionId\"(\"value\":\"u32\")\"AssetId\"(\"value\":\"felt\")\"Timestamp\"(\"seconds\":\"u64\")"));
    domainHash = self.getExtendedDomainHash();
    positionId = self.convertToBigInt(safeString(settlement, "collateralPosition", "0"));
    baseAssetId = safeString(settlement, "baseAssetId", "0");
    baseAmount = self.convertToBigInt(safeString(settlement, "baseAmount", "0"));
    quoteAssetId = safeString(settlement, "quoteAssetId", "0");
    quoteAmount = self.convertToBigInt(safeString(settlement, "quoteAmount", "0"));
    feeAssetId = safeString(settlement, "feeAssetId", "0");
    feeAmount = self.convertToBigInt(safeString(settlement, "feeAmount", "0"));
    expiration = self.convertToBigInt(safeString2(settlement, "expiration", "expirationTimestamp", "0"));
    salt = self.convertToBigInt(safeString2(settlement, "salt", "nonce", "0"));
    starkKey = self.convertToBigInt(safeString(settlement, "starkKey", "0"));
    orderHash = self.convertToBigInt(self.extendedStarknetComputePoseidonHashOnElements([orderTypeHash, positionId, self.convertToBigInt(baseAssetId), self.getExtendedEncodeI64(baseAmount), self.convertToBigInt(quoteAssetId), self.getExtendedEncodeI64(quoteAmount), self.convertToBigInt(feeAssetId), feeAmount, expiration, salt]));
    return self.extendedStarknetComputePoseidonHashOnElements([self.getExtendedStringToFelt("StarkNet Message"), domainHash, starkKey, orderHash])

end
function getExtendedWithdrawalMsgHash(self::Extended, settlement, starkKey)
    withdrawalTypeHash = self.convertToBigInt(self.extendedStarknetGetSelectorFromName("\"Withdrawal\"(\"recipient\":\"felt\",\"position_id\":\"PositionId\",\"collateral_id\":\"AssetId\",\"amount\":\"u64\",\"expiration\":\"Timestamp\",\"salt\":\"felt\")\"PositionId\"(\"value\":\"u32\")\"AssetId\"(\"value\":\"felt\")\"Timestamp\"(\"seconds\":\"u64\")"));
    domainHash = self.getExtendedDomainHash();
    expiration = self.safeDict(settlement, "expiration", defaultValue = Dict{Symbol, Any}());
    withdrawalHash = self.convertToBigInt(self.extendedStarknetComputePoseidonHashOnElements([withdrawalTypeHash, self.convertToBigInt(safeString(settlement, "recipient", "0")), self.convertToBigInt(safeString(settlement, "positionId", "0")), self.convertToBigInt(safeString(settlement, "collateralId", "0")), self.convertToBigInt(safeString(settlement, "amount", "0")), self.convertToBigInt(safeString(expiration, "seconds", "0")), self.convertToBigInt(safeString(settlement, "salt", "0"))]));
    return self.extendedStarknetComputePoseidonHashOnElements([self.getExtendedStringToFelt("StarkNet Message"), domainHash, self.convertToBigInt(starkKey), withdrawalHash])

end
function getExtendedTransferMsgHash(self::Extended, settlement)
    transferTypeHash = self.convertToBigInt(self.extendedStarknetGetSelectorFromName("\"Transfer\"(\"sender_position_id\":\"PositionId\",\"receiver_position_id\":\"PositionId\",\"asset_id\":\"AssetId\",\"amount\":\"u64\",\"expiration\":\"Timestamp\",\"salt\":\"felt\")\"PositionId\"(\"value\":\"u32\")\"AssetId\"(\"value\":\"felt\")\"Timestamp\"(\"seconds\":\"u64\")"));
    domainHash = self.getExtendedDomainHash();
    senderPublicKey = self.convertToBigInt(safeString(settlement, "senderPublicKey", "0"));
    transferHash = self.convertToBigInt(self.extendedStarknetComputePoseidonHashOnElements([transferTypeHash, self.convertToBigInt(safeString(settlement, "senderPositionId", "0")), self.convertToBigInt(safeString(settlement, "receiverPositionId", "0")), self.convertToBigInt(safeString(settlement, "assetId", "0")), self.convertToBigInt(safeString(settlement, "amount", "0")), self.convertToBigInt(safeString(settlement, "expirationTimestamp", "0")), self.convertToBigInt(safeString(settlement, "nonce", "0"))]));
    return self.extendedStarknetComputePoseidonHashOnElements([self.getExtendedStringToFelt("StarkNet Message"), domainHash, senderPublicKey, transferHash])

end
function handleErrors(self::Extended, httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(!functions.ccxtruthy(response))
            return nothing
    end
    status = safeStringLower(response, "status");
    if functions.ccxtruthy(status == "error")
        error = self.safeDict(response, "error");
        errorCode = safeString(error, "code");
        feedback = string(self.id, " ", json(response));
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), body, feedback);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), errorCode, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end
function sign(self::Extended, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    version = safeString(api, 0);
    accessibility = safeString(api, 1);
    endpoint = string("/", self.implodeParams(path, params));
    query = omit(params, self.extractParams(path));
    queryPost = (path == "user/deadmanswitch");
    url = self.implodeHostname(get(get(self.urls, Symbol("api"), nothing), Symbol("rest"), nothing));
    if functions.ccxtruthy(accessibility == "private")
        if functions.ccxtruthy(self.apiKey == nothing)
            throw(AuthenticationError(string(self.id, " sign() requires an apiKey for private endpoints")));
        end
        headers = Dict{Symbol, Any}(
            Symbol("X-Api-Key") => self.apiKey
        );
        if functions.ccxtruthy(@functions.ccxt_and((@functions.ccxt_or((method == "POST"), (method == "PATCH"))), !functions.ccxtruthy(queryPost)))
            body = json(query);
            headers[Symbol("Content-Type")] = "application/json";
        end
    end
    url = string(url, "/api/", version, endpoint);
    if functions.ccxtruthy(@functions.ccxt_and((@functions.ccxt_or(@functions.ccxt_or(method == "GET", method == "DELETE"), queryPost)), length(objectKeys(query))))
        url += string("?", self.urlencodeWithArrayRepeat(query));
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Extended, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function v1PublicGetInfoMarkets(self::Extended, params=Dict(), context=Dict())
    return request(self, "info/markets"; api=["v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PublicGetInfoAssets(self::Extended, params=Dict(), context=Dict())
    return request(self, "info/assets"; api=["v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PublicGetInfoAssetsAssetPrice(self::Extended, params=Dict(), context=Dict())
    return request(self, "info/assets/{asset}/price"; api=["v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PublicGetInfoMarketsMarketStats(self::Extended, params=Dict(), context=Dict())
    return request(self, "info/markets/{market}/stats"; api=["v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PublicGetInfoMarketsMarketOrderbook(self::Extended, params=Dict(), context=Dict())
    return request(self, "info/markets/{market}/orderbook"; api=["v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PublicGetInfoMarketsMarketTrades(self::Extended, params=Dict(), context=Dict())
    return request(self, "info/markets/{market}/trades"; api=["v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PublicGetInfoCandlesMarketCandleType(self::Extended, params=Dict(), context=Dict())
    return request(self, "info/candles/{market}/{candleType}"; api=["v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PublicGetInfoMarketFunding(self::Extended, params=Dict(), context=Dict())
    return request(self, "info/{market}/funding"; api=["v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PublicGetInfoMarketOpenInterests(self::Extended, params=Dict(), context=Dict())
    return request(self, "info/{market}/open-interests"; api=["v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PublicGetInfoBuilderDashboard(self::Extended, params=Dict(), context=Dict())
    return request(self, "info/builder/dashboard"; api=["v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetUserAccounts(self::Extended, params=Dict(), context=Dict())
    return request(self, "user/accounts"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetUserAccountInfo(self::Extended, params=Dict(), context=Dict())
    return request(self, "user/account/info"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetUserBalance(self::Extended, params=Dict(), context=Dict())
    return request(self, "user/balance"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetUserSpotBalances(self::Extended, params=Dict(), context=Dict())
    return request(self, "user/spot/balances"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetUserAssetOperations(self::Extended, params=Dict(), context=Dict())
    return request(self, "user/assetOperations"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetUserPositions(self::Extended, params=Dict(), context=Dict())
    return request(self, "user/positions"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetUserPositionsHistory(self::Extended, params=Dict(), context=Dict())
    return request(self, "user/positions/history"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetUserOrders(self::Extended, params=Dict(), context=Dict())
    return request(self, "user/orders"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetUserOrdersHistory(self::Extended, params=Dict(), context=Dict())
    return request(self, "user/orders/history"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetUserOrdersId(self::Extended, params=Dict(), context=Dict())
    return request(self, "user/orders/{id}"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetUserOrdersExternalExternalId(self::Extended, params=Dict(), context=Dict())
    return request(self, "user/orders/external/{externalId}"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetUserTrades(self::Extended, params=Dict(), context=Dict())
    return request(self, "user/trades"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetUserFundingHistory(self::Extended, params=Dict(), context=Dict())
    return request(self, "user/funding/history"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetUserRebatesStats(self::Extended, params=Dict(), context=Dict())
    return request(self, "user/rebates/stats"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetUserLeverage(self::Extended, params=Dict(), context=Dict())
    return request(self, "user/leverage"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetUserFees(self::Extended, params=Dict(), context=Dict())
    return request(self, "user/fees"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetUserBridgeConfig(self::Extended, params=Dict(), context=Dict())
    return request(self, "user/bridge/config"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetUserBridgeQuote(self::Extended, params=Dict(), context=Dict())
    return request(self, "user/bridge/quote"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetUserAffiliate(self::Extended, params=Dict(), context=Dict())
    return request(self, "user/affiliate"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetUserReferralsStatus(self::Extended, params=Dict(), context=Dict())
    return request(self, "user/referrals/status"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetUserReferralsLinks(self::Extended, params=Dict(), context=Dict())
    return request(self, "user/referrals/links"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetUserReferralsDashboard(self::Extended, params=Dict(), context=Dict())
    return request(self, "user/referrals/dashboard"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetUserRewardsEarned(self::Extended, params=Dict(), context=Dict())
    return request(self, "user/rewards/earned"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetUserRewardsLeaderboardStats(self::Extended, params=Dict(), context=Dict())
    return request(self, "user/rewards/leaderboard/stats"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetPortfolioChartsEquities(self::Extended, params=Dict(), context=Dict())
    return request(self, "portfolio/charts/equities"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetPortfolioChartsPnl(self::Extended, params=Dict(), context=Dict())
    return request(self, "portfolio/charts/pnl"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetVaultPublicPerformance(self::Extended, params=Dict(), context=Dict())
    return request(self, "vault/public/performance"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetVaultPublicSummary(self::Extended, params=Dict(), context=Dict())
    return request(self, "vault/public/summary"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetBuilderTrades(self::Extended, params=Dict(), context=Dict())
    return request(self, "builder/trades"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostUserOrder(self::Extended, params=Dict(), context=Dict())
    return request(self, "user/order"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostUserOrderMassCancel(self::Extended, params=Dict(), context=Dict())
    return request(self, "user/order/massCancel"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostUserDeadmanswitch(self::Extended, params=Dict(), context=Dict())
    return request(self, "user/deadmanswitch"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostUserBridgeQuote(self::Extended, params=Dict(), context=Dict())
    return request(self, "user/bridge/quote"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostUserWithdrawal(self::Extended, params=Dict(), context=Dict())
    return request(self, "user/withdrawal"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostUserTransfer(self::Extended, params=Dict(), context=Dict())
    return request(self, "user/transfer"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostUserReferralsUse(self::Extended, params=Dict(), context=Dict())
    return request(self, "user/referrals/use"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostUserReferrals(self::Extended, params=Dict(), context=Dict())
    return request(self, "user/referrals"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePutUserReferrals(self::Extended, params=Dict(), context=Dict())
    return request(self, "user/referrals"; api=["v1", "private"], method="PUT", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePatchUserLeverage(self::Extended, params=Dict(), context=Dict())
    return request(self, "user/leverage"; api=["v1", "private"], method="PATCH", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateDeleteUserOrderId(self::Extended, params=Dict(), context=Dict())
    return request(self, "user/order/{id}"; api=["v1", "private"], method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateDeleteUserOrder(self::Extended, params=Dict(), context=Dict())
    return request(self, "user/order"; api=["v1", "private"], method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function Extended(; kwargs...)
    inst = Extended(Exchange(), describe, loadMarkets, indexByStringifiedNumericId, fetchMarkets, parseMarket, fetchCurrencies, parseCurrency, fetchTicker, fetchTickers, parseTicker, fetchOrderBook, fetchTrades, fetchMyTrades, fetchFundingHistory, parseFundingHistory, parseFundingHistories, parseTrade, fetchOHLCV, parseOHLCV, fetchFundingRateHistory, parseFundingRateHistory, fetchOpenInterestHistory, parseOpenInterest, fetchBalance, parseBalance, fetchAccount, fetchAccounts, parseAccount, fetchLedger, parseLedgerEntry, fetchTransactions, fetchDeposits, fetchWithdrawals, withdraw, fetchTransfers, transfer, parseTransfer, getExtendedCurrencyCodeById, parseTransactionStatus, parseTransactionType, parseTransaction, fetchTradingFee, fetchTradingFees, parseTradingFee, fetchLeverage, setLeverage, parseLeverage, fetchPositions, fetchPosition, fetchPositionsHistory, parsePosition, getExtendedStarkAmount, fetchExtendedAccount, createOrderSettlementData, createWithdrawalSettlementData, createTransferSettlementData, createExtendedOrderRequest, createOrder, editOrder, cancelOrder, cancelOrders, cancelAllOrders, cancelAllOrdersAfter, fetchOrder, fetchOpenOrders, fetchOrders, fetchClosedOrders, fetchCanceledOrders, parseOrderStatus, parseOrder, getExtendedStringToFelt, getExtendedEncodeI64, getExtendedDecimalToBase16, getExtendedSignatureHex, getExtendedDomainHash, getExtendedOrderMsgHash, getExtendedWithdrawalMsgHash, getExtendedTransferMsgHash, handleErrors, sign, v1PublicGetInfoMarkets, v1PublicGetInfoAssets, v1PublicGetInfoAssetsAssetPrice, v1PublicGetInfoMarketsMarketStats, v1PublicGetInfoMarketsMarketOrderbook, v1PublicGetInfoMarketsMarketTrades, v1PublicGetInfoCandlesMarketCandleType, v1PublicGetInfoMarketFunding, v1PublicGetInfoMarketOpenInterests, v1PublicGetInfoBuilderDashboard, v1PrivateGetUserAccounts, v1PrivateGetUserAccountInfo, v1PrivateGetUserBalance, v1PrivateGetUserSpotBalances, v1PrivateGetUserAssetOperations, v1PrivateGetUserPositions, v1PrivateGetUserPositionsHistory, v1PrivateGetUserOrders, v1PrivateGetUserOrdersHistory, v1PrivateGetUserOrdersId, v1PrivateGetUserOrdersExternalExternalId, v1PrivateGetUserTrades, v1PrivateGetUserFundingHistory, v1PrivateGetUserRebatesStats, v1PrivateGetUserLeverage, v1PrivateGetUserFees, v1PrivateGetUserBridgeConfig, v1PrivateGetUserBridgeQuote, v1PrivateGetUserAffiliate, v1PrivateGetUserReferralsStatus, v1PrivateGetUserReferralsLinks, v1PrivateGetUserReferralsDashboard, v1PrivateGetUserRewardsEarned, v1PrivateGetUserRewardsLeaderboardStats, v1PrivateGetPortfolioChartsEquities, v1PrivateGetPortfolioChartsPnl, v1PrivateGetVaultPublicPerformance, v1PrivateGetVaultPublicSummary, v1PrivateGetBuilderTrades, v1PrivatePostUserOrder, v1PrivatePostUserOrderMassCancel, v1PrivatePostUserDeadmanswitch, v1PrivatePostUserBridgeQuote, v1PrivatePostUserWithdrawal, v1PrivatePostUserTransfer, v1PrivatePostUserReferralsUse, v1PrivatePostUserReferrals, v1PrivatePutUserReferrals, v1PrivatePatchUserLeverage, v1PrivateDeleteUserOrderId, v1PrivateDeleteUserOrder)
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
function __ccxt_doc_Extended_fetchMarkets() end
"""
retrieves data on all markets for extended
see: https://api.docs.extended.exchange/#get-markets

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Extended_fetchMarkets

function __ccxt_doc_Extended_fetchCurrencies() end
"""
fetches all available currencies on an exchange
see: https://api.docs.extended.exchange/#get-assets

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
__ccxt_doc_Extended_fetchCurrencies

function __ccxt_doc_Extended_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://api.docs.extended.exchange/#get-market-statistics

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Extended_fetchTicker

function __ccxt_doc_Extended_fetchTickers() end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for all markets
see: https://api.docs.extended.exchange/#get-markets

# Arguments
- `symbols`::array, optional: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Extended_fetchTickers

function __ccxt_doc_Extended_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://api.docs.extended.exchange/#get-market-order-book

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Extended_fetchOrderBook

function __ccxt_doc_Extended_fetchTrades() end
"""
get the list of most recent trades for a particular symbol
see: https://api.docs.extended.exchange/#get-market-last-trades

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
__ccxt_doc_Extended_fetchTrades

function __ccxt_doc_Extended_fetchMyTrades() end
"""
fetch all trades made by the user
see: https://api.docs.extended.exchange/#get-trades

# Arguments
- `symbol`::string, optional: unified market symbol of the trades
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trade structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Extended_fetchMyTrades

function __ccxt_doc_Extended_fetchFundingHistory() end
"""
fetch the funding payments history
see: https://api.docs.extended.exchange/#get-funding-payments

# Arguments
- `symbol`::string, optional: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch funding history for
- `limit`::int, optional: the maximum number of funding history structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [funding history structures]{@link https://docs.ccxt.com/?id=funding-history-structure}
"""
__ccxt_doc_Extended_fetchFundingHistory

function __ccxt_doc_Extended_fetchOHLCV() end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://api.docs.extended.exchange/#get-candles-history

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch, default 100
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.candleType`::string, optional: candle type: 'trades' (default), 'mark-prices', or 'index-prices'
- `params.price`::string, optional: *ignored if params.candleType is set* 'mark' or 'index' for mark price and index price candles
- `params.until`::int, optional: end timestamp in ms for the requested period

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Extended_fetchOHLCV

function __ccxt_doc_Extended_fetchFundingRateHistory() end
"""
fetches historical funding rate prices
see: https://api.docs.extended.exchange/#get-funding-rates-history

# Arguments
- `symbol`::string: unified symbol of the market to fetch funding rate history for
- `since`::int, optional: timestamp in ms of the earliest funding rate to fetch
- `limit`::int, optional: the maximum amount of entries to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest funding rate to fetch
- `params.endTime`::int, optional: exchange-specific end timestamp in ms of the latest funding rate to fetch
- `params.cursor`::int, optional: offset of the result set
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
"""
__ccxt_doc_Extended_fetchFundingRateHistory

function __ccxt_doc_Extended_fetchOpenInterestHistory() end
"""
Retrieves the open interest history of a currency
see: https://api.docs.extended.exchange/#get-open-interest-history

# Arguments
- `symbol`::string: unified CCXT market symbol
- `timeframe`::string: '1h' or '1d'
- `since`::int, optional: the time(ms) of the earliest record to retrieve as a unix timestamp
- `limit`::int, optional: the maximum amount of open interest structures to retrieve
- `params`::object, optional: exchange specific parameters
- `params.until`::int, optional: timestamp in ms of the latest open interest record to fetch

# Returns
- an array of [open interest structures]{@link https://docs.ccxt.com/?id=open-interest-structure}
"""
__ccxt_doc_Extended_fetchOpenInterestHistory

function __ccxt_doc_Extended_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://api.docs.extended.exchange/#get-spot-balances

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Extended_fetchBalance

function __ccxt_doc_Extended_fetchAccount() end
"""
fetch the current authenticated sub-account
see: https://api.docs.extended.exchange/#get-account-details

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [account structure]{@link https://docs.ccxt.com/?id=account-structure}
"""
__ccxt_doc_Extended_fetchAccount

function __ccxt_doc_Extended_fetchAccounts() end
"""
fetch the current authenticated sub-account, extended private endpoints only return records for the authenticated sub-account
see: https://api.docs.extended.exchange/#get-sub-accounts

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [account structures]{@link https://docs.ccxt.com/?id=account-structure}
"""
__ccxt_doc_Extended_fetchAccounts

function __ccxt_doc_Extended_fetchLedger() end
"""
fetch the history of changes, actions done by the user or operations that altered the balance of the user
see: https://api.docs.extended.exchange/#get-deposits-withdrawals-transfers-history

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: timestamp in ms of the earliest ledger entry
- `limit`::int, optional: max number of ledger entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [ledger structures]{@link https://docs.ccxt.com/?id=ledger}
"""
__ccxt_doc_Extended_fetchLedger

function __ccxt_doc_Extended_fetchTransactions() end
"""
fetch history of deposits, withdrawals, and transfers
see: https://api.docs.extended.exchange/#get-deposits-withdrawals-transfers-history

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: the earliest time in ms to fetch transactions for
- `limit`::int, optional: the maximum number of transaction structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Extended_fetchTransactions

function __ccxt_doc_Extended_fetchDeposits() end
"""
fetch all deposits made to an account
see: https://api.docs.extended.exchange/#get-deposits-withdrawals-transfers-history

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposit structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Extended_fetchDeposits

function __ccxt_doc_Extended_fetchWithdrawals() end
"""
fetch all withdrawals made from an account
see: https://api.docs.extended.exchange/#get-deposits-withdrawals-transfers-history

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawal structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Extended_fetchWithdrawals

function __ccxt_doc_Extended_withdraw() end
"""
make a Starknet withdrawal
see: https://api.docs.extended.exchange/#withdrawals

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the Starknet address to withdraw to
- `tag`::string: unused
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.chainId`::string, optional: only STRK is supported
- `params.settlementExpiration`::int, optional: settlement expiration timestamp in seconds, defaults to now + 14 days + 60 seconds

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Extended_withdraw

function __ccxt_doc_Extended_fetchTransfers() end
"""
fetch a history of internal transfers made on an account
see: https://api.docs.extended.exchange/#get-deposits-withdrawals-transfers-history

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: the earliest time in ms to fetch transfers for
- `limit`::int, optional: the maximum number of transfer structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
__ccxt_doc_Extended_fetchTransfers

function __ccxt_doc_Extended_transfer() end
"""
transfer collateral between sub-accounts associated with the same wallet
see: https://api.docs.extended.exchange/#create-transfer

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to transfer
- `fromAccount`::string: source account id, defaults to the authenticated account id
- `toAccount`::string: destination account id
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.toVault`::string: destination account L2 vault
- `params.toL2Key`::string: destination account L2 public key
- `params.settlementExpiration`::int, optional: settlement expiration timestamp in seconds, defaults to now + 21 days

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
__ccxt_doc_Extended_transfer

function __ccxt_doc_Extended_fetchTradingFee() end
"""
fetch the trading fees for a market
see: https://api.docs.extended.exchange/#get-fees

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.builderId`::string, optional: builder client id

# Returns
- a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
"""
__ccxt_doc_Extended_fetchTradingFee

function __ccxt_doc_Extended_fetchTradingFees() end
"""
fetch the trading fees for multiple markets
see: https://api.docs.extended.exchange/#get-fees

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.market`::string, optional: exchange market id
- `params.builderId`::string, optional: builder client id

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
"""
__ccxt_doc_Extended_fetchTradingFees

function __ccxt_doc_Extended_fetchLeverage() end
"""
fetch the set leverage for a market
see: https://api.docs.extended.exchange/#get-leverage

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [leverage structure]{@link https://docs.ccxt.com/?id=leverage-structure}
"""
__ccxt_doc_Extended_fetchLeverage

function __ccxt_doc_Extended_setLeverage() end
"""
set the level of leverage for a market
see: https://api.docs.extended.exchange/#update-leverage

# Arguments
- `leverage`::int: the rate of leverage
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from the exchange
"""
__ccxt_doc_Extended_setLeverage

function __ccxt_doc_Extended_fetchPositions() end
"""
fetch all open positions
see: https://api.docs.extended.exchange/#get-positions

# Arguments
- `symbols`::any: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Extended_fetchPositions

function __ccxt_doc_Extended_fetchPosition() end
"""
fetch data on an open position
see: https://api.docs.extended.exchange/#get-positions

# Arguments
- `symbol`::string: unified market symbol of the market the position is held in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Extended_fetchPosition

function __ccxt_doc_Extended_fetchPositionsHistory() end
"""
fetch historical positions
see: https://api.docs.extended.exchange/#get-positions-history

# Arguments
- `symbols`::any: list of unified market symbols
- `since`::int, optional: the earliest time in ms to fetch positions for
- `limit`::int, optional: the maximum number of position structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Extended_fetchPositionsHistory

function __ccxt_doc_Extended_createOrder() end
"""
create a trade order
see: https://api.docs.extended.exchange/#create-or-edit-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'limit' or 'market'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, required for all order types
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: client order id, sent as the exchange order id
- `params.cancelId`::string, optional: previous external order id to replace
- `params.timeInForce`::string, optional: 'GTT' or 'IOC'
- `params.postOnly`::bool, optional: true if the order should only make liquidity
- `params.reduceOnly`::bool, optional: true if the order should only reduce a position
- `params.fee`::string, optional: max fee rate for the order, default is 0.0005
- `params.expiryEpochMillis`::int, optional: order expiration timestamp in milliseconds, default is now + 1 hour
- `params.triggerPrice`::float, optional: *swap only* The price at which a trigger order is triggered at
- `params.stopLossPrice`::float, optional: *swap only* The price at which a stop loss order is triggered at
- `params.takeProfitPrice`::float, optional: *swap only* The price at which a take profit order is triggered at
- `params.takeProfit`::object, optional: *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered (perpetual swap markets only)
- `params.takeProfit.triggerPrice`::float, optional: *swap only* take profit trigger price
- `params.takeProfit.price`::float, optional: *swap only* the execution price for a take profit attached to a trigger order
- `params.takeProfit.type`::string, optional: *swap only* the type for a take profit attached to a trigger order, 'LAST', 'MARK' or 'INDEX', default is ''
- `params.stopLoss`::object, optional: *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered (perpetual swap markets only)
- `params.stopLoss.triggerPrice`::float, optional: *swap only* stop loss trigger price
- `params.stopLoss.price`::float, optional: *swap only* the execution price for a stop loss attached to a trigger order
- `params.stopLoss.type`::string, optional: *swap only* the type for a stop loss attached to a trigger order, 'LAST', 'MARK' or 'INDEX', default is ''

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Extended_createOrder

function __ccxt_doc_Extended_editOrder() end
"""
edit a trade order
see: https://api.docs.extended.exchange/#create-or-edit-order

# Arguments
- `id`::string: order id assigned by Extended
- `symbol`::string: unified symbol of the market to edit an order in
- `type`::string: 'limit' or 'market'
- `side`::string: 'buy' or 'sell'
- `amount`::float, optional: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Extended_editOrder

function __ccxt_doc_Extended_cancelOrder() end
"""
cancels an open order
see: https://api.docs.extended.exchange/#cancel-order-by-id
see: https://api.docs.extended.exchange/#cancel-order-by-external-id

# Arguments
- `id`::string: order id assigned by Extended
- `symbol`::string, optional: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: user-defined order id, cancels by external id

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Extended_cancelOrder

function __ccxt_doc_Extended_cancelOrders() end
"""
cancel multiple orders by order ids or client order ids
see: https://api.docs.extended.exchange/#mass-cancel

# Arguments
- `ids`::array: order ids
- `symbol`::string, optional: unified market symbol, only used to populate the returned orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderIds`::array, optional: client order ids
- `params.clientOrderId`::string, optional: single client order id

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Extended_cancelOrders

function __ccxt_doc_Extended_cancelAllOrders() end
"""
cancels all open orders, optionally filtered by symbol
see: https://api.docs.extended.exchange/#mass-cancel

# Arguments
- `symbol`::string, optional: unified market symbol of the market to cancel orders in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Extended_cancelAllOrders

function __ccxt_doc_Extended_cancelAllOrdersAfter() end
"""
dead man's switch, cancel all orders after the given timeout
see: https://api.docs.extended.exchange/#mass-auto-cancel-dead-man-39-s-switch

# Arguments
- `timeout`::float: time in milliseconds, 0 represents cancel the timer
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the api result
"""
__ccxt_doc_Extended_cancelAllOrdersAfter

function __ccxt_doc_Extended_fetchOrder() end
"""
fetches information on an order made by the user
see: https://api.docs.extended.exchange/#get-order-by-id
see: https://api.docs.extended.exchange/#get-orders-by-external-id

# Arguments
- `id`::string: order id assigned by Extended
- `symbol`::string, optional: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: user-defined order id, fetches by external id

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Extended_fetchOrder

function __ccxt_doc_Extended_fetchOpenOrders() end
"""
fetch all unfilled currently open orders
see: https://api.docs.extended.exchange/#get-open-orders

# Arguments
- `symbol`::string, optional: unified market symbol of the orders
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of open order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Extended_fetchOpenOrders

function __ccxt_doc_Extended_fetchOrders() end
"""
fetches information on multiple orders made by the user
see: https://api.docs.extended.exchange/#get-orders-history

# Arguments
- `symbol`::string, optional: unified market symbol of the orders
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Extended_fetchOrders

function __ccxt_doc_Extended_fetchClosedOrders() end
"""
fetches information on multiple closed orders made by the user
see: https://api.docs.extended.exchange/#get-orders-history

# Arguments
- `symbol`::string, optional: unified market symbol of the orders
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Extended_fetchClosedOrders

function __ccxt_doc_Extended_fetchCanceledOrders() end
"""
fetches information on multiple canceled orders made by the user
see: https://api.docs.extended.exchange/#get-orders-history

# Arguments
- `symbol`::string, optional: unified market symbol of the orders
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Extended_fetchCanceledOrders
