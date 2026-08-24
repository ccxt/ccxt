@kwdef mutable struct Deepcoin <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    handleMarketTypeAndParams::Function = handleMarketTypeAndParams
    convertToInstrumentType::Function = convertToInstrumentType
    fetchMarkets::Function = fetchMarkets
    fetchMarketsByType::Function = fetchMarketsByType
    parseMarket::Function = parseMarket
    setMarkets::Function = setMarkets
    fetchOrderBook::Function = fetchOrderBook
    fetchOHLCV::Function = fetchOHLCV
    fetchTickers::Function = fetchTickers
    parseTicker::Function = parseTicker
    fetchTrades::Function = fetchTrades
    getProductGroupFromMarket::Function = getProductGroupFromMarket
    parseTrade::Function = parseTrade
    parseTakerOrMaker::Function = parseTakerOrMaker
    fetchBalance::Function = fetchBalance
    parseBalance::Function = parseBalance
    fetchDeposits::Function = fetchDeposits
    fetchWithdrawals::Function = fetchWithdrawals
    parseTransaction::Function = parseTransaction
    parseTransactionStatus::Function = parseTransactionStatus
    fetchDepositAddresses::Function = fetchDepositAddresses
    fetchDepositAddress::Function = fetchDepositAddress
    parseDepositAddress::Function = parseDepositAddress
    fetchLedger::Function = fetchLedger
    parseLedgerEntry::Function = parseLedgerEntry
    parseLedgerEntryType::Function = parseLedgerEntryType
    transfer::Function = transfer
    parseTransfer::Function = parseTransfer
    parseTransferStatus::Function = parseTransferStatus
    createOrder::Function = createOrder
    createOrderRequest::Function = createOrderRequest
    createRegularOrderRequest::Function = createRegularOrderRequest
    createTriggerOrderRequest::Function = createTriggerOrderRequest
    handleTypePostOnlyAndTimeInForce::Function = handleTypePostOnlyAndTimeInForce
    createMarketOrderWithCost::Function = createMarketOrderWithCost
    createMarketBuyOrderWithCost::Function = createMarketBuyOrderWithCost
    createMarketSellOrderWithCost::Function = createMarketSellOrderWithCost
    fetchClosedOrder::Function = fetchClosedOrder
    fetchOpenOrder::Function = fetchOpenOrder
    fetchCanceledAndClosedOrders::Function = fetchCanceledAndClosedOrders
    fetchCanceledOrders::Function = fetchCanceledOrders
    fetchClosedOrders::Function = fetchClosedOrders
    fetchOpenOrders::Function = fetchOpenOrders
    cancelOrder::Function = cancelOrder
    cancelAllOrders::Function = cancelAllOrders
    editOrder::Function = editOrder
    cancelOrders::Function = cancelOrders
    parseOrder::Function = parseOrder
    parseOrderStatus::Function = parseOrderStatus
    parseOrderType::Function = parseOrderType
    parseOrderTimeInForce::Function = parseOrderTimeInForce
    fetchPositionsForSymbol::Function = fetchPositionsForSymbol
    fetchPositions::Function = fetchPositions
    parsePosition::Function = parsePosition
    setLeverage::Function = setLeverage
    fetchFundingRates::Function = fetchFundingRates
    fetchFundingRate::Function = fetchFundingRate
    parseFundingRate::Function = parseFundingRate
    fetchFundingRateHistory::Function = fetchFundingRateHistory
    parseFundingRateHistory::Function = parseFundingRateHistory
    fetchMyTrades::Function = fetchMyTrades
    fetchOrderTrades::Function = fetchOrderTrades
    closePosition::Function = closePosition
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    publicGetDeepcoinMarketBooks::Function = publicGetDeepcoinMarketBooks
    publicGetDeepcoinMarketCandles::Function = publicGetDeepcoinMarketCandles
    publicGetDeepcoinMarketInstruments::Function = publicGetDeepcoinMarketInstruments
    publicGetDeepcoinMarketTickers::Function = publicGetDeepcoinMarketTickers
    publicGetDeepcoinMarketIndexCandles::Function = publicGetDeepcoinMarketIndexCandles
    publicGetDeepcoinMarketTrades::Function = publicGetDeepcoinMarketTrades
    publicGetDeepcoinMarketMarkPriceCandles::Function = publicGetDeepcoinMarketMarkPriceCandles
    publicGetDeepcoinMarketStepMargin::Function = publicGetDeepcoinMarketStepMargin
    publicGetDeepcoinTradeFundingRate::Function = publicGetDeepcoinTradeFundingRate
    publicGetDeepcoinTradeFundRateCurrentFundingRate::Function = publicGetDeepcoinTradeFundRateCurrentFundingRate
    publicGetDeepcoinTradeFundRateHistory::Function = publicGetDeepcoinTradeFundRateHistory
    privateGetDeepcoinAccountBalances::Function = privateGetDeepcoinAccountBalances
    privateGetDeepcoinAccountBills::Function = privateGetDeepcoinAccountBills
    privateGetDeepcoinAccountPositions::Function = privateGetDeepcoinAccountPositions
    privateGetDeepcoinTradeFills::Function = privateGetDeepcoinTradeFills
    privateGetDeepcoinTradeOrderByID::Function = privateGetDeepcoinTradeOrderByID
    privateGetDeepcoinTradeFinishOrderByID::Function = privateGetDeepcoinTradeFinishOrderByID
    privateGetDeepcoinTradeOrdersHistory::Function = privateGetDeepcoinTradeOrdersHistory
    privateGetDeepcoinTradeV2OrdersPending::Function = privateGetDeepcoinTradeV2OrdersPending
    privateGetDeepcoinTradeTriggerOrdersPending::Function = privateGetDeepcoinTradeTriggerOrdersPending
    privateGetDeepcoinTradeTriggerOrdersHistory::Function = privateGetDeepcoinTradeTriggerOrdersHistory
    privateGetDeepcoinCopytradingSupportContracts::Function = privateGetDeepcoinCopytradingSupportContracts
    privateGetDeepcoinCopytradingLeaderPosition::Function = privateGetDeepcoinCopytradingLeaderPosition
    privateGetDeepcoinCopytradingEstimateProfit::Function = privateGetDeepcoinCopytradingEstimateProfit
    privateGetDeepcoinCopytradingHistoryProfit::Function = privateGetDeepcoinCopytradingHistoryProfit
    privateGetDeepcoinCopytradingFollowerRank::Function = privateGetDeepcoinCopytradingFollowerRank
    privateGetDeepcoinInternalTransferSupport::Function = privateGetDeepcoinInternalTransferSupport
    privateGetDeepcoinInternalTransferHistoryOrder::Function = privateGetDeepcoinInternalTransferHistoryOrder
    privateGetDeepcoinRebateConfig::Function = privateGetDeepcoinRebateConfig
    privateGetDeepcoinAgentsUsers::Function = privateGetDeepcoinAgentsUsers
    privateGetDeepcoinAgentsUsersRebateList::Function = privateGetDeepcoinAgentsUsersRebateList
    privateGetDeepcoinAgentsUsersRebates::Function = privateGetDeepcoinAgentsUsersRebates
    privateGetDeepcoinAssetDepositList::Function = privateGetDeepcoinAssetDepositList
    privateGetDeepcoinAssetWithdrawList::Function = privateGetDeepcoinAssetWithdrawList
    privateGetDeepcoinAssetRechargeChainList::Function = privateGetDeepcoinAssetRechargeChainList
    privateGetDeepcoinListenkeyAcquire::Function = privateGetDeepcoinListenkeyAcquire
    privateGetDeepcoinListenkeyExtend::Function = privateGetDeepcoinListenkeyExtend
    privatePostDeepcoinAccountSetLeverage::Function = privatePostDeepcoinAccountSetLeverage
    privatePostDeepcoinTradeOrder::Function = privatePostDeepcoinTradeOrder
    privatePostDeepcoinTradeReplaceOrder::Function = privatePostDeepcoinTradeReplaceOrder
    privatePostDeepcoinTradeCancelOrder::Function = privatePostDeepcoinTradeCancelOrder
    privatePostDeepcoinTradeBatchCancelOrder::Function = privatePostDeepcoinTradeBatchCancelOrder
    privatePostDeepcoinTradeCancelTriggerOrder::Function = privatePostDeepcoinTradeCancelTriggerOrder
    privatePostDeepcoinTradeSwapCancelAll::Function = privatePostDeepcoinTradeSwapCancelAll
    privatePostDeepcoinTradeTriggerOrder::Function = privatePostDeepcoinTradeTriggerOrder
    privatePostDeepcoinTradeBatchClosePosition::Function = privatePostDeepcoinTradeBatchClosePosition
    privatePostDeepcoinTradeReplaceOrderSltp::Function = privatePostDeepcoinTradeReplaceOrderSltp
    privatePostDeepcoinTradeClosePositionByIds::Function = privatePostDeepcoinTradeClosePositionByIds
    privatePostDeepcoinCopytradingLeaderSettings::Function = privatePostDeepcoinCopytradingLeaderSettings
    privatePostDeepcoinCopytradingSetContracts::Function = privatePostDeepcoinCopytradingSetContracts
    privatePostDeepcoinInternalTransfer::Function = privatePostDeepcoinInternalTransfer
    privatePostDeepcoinRebateConfig::Function = privatePostDeepcoinRebateConfig
    privatePostDeepcoinAssetTransfer::Function = privatePostDeepcoinAssetTransfer

end
function describe(self::Deepcoin, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "deepcoin",
    Symbol("name") => "DeepCoin",
    Symbol("countries") => ["SG"],
    Symbol("rateLimit") => 200,
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
        Symbol("cancelOrders") => true,
        Symbol("cancelWithdraw") => false,
        Symbol("closePosition") => true,
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
        Symbol("createOrders") => false,
        Symbol("createOrderWithTakeProfitAndStopLoss") => true,
        Symbol("createPostOnlyOrder") => true,
        Symbol("createReduceOnlyOrder") => true,
        Symbol("createStopLossOrder") => false,
        Symbol("createTakeProfitOrder") => false,
        Symbol("createTrailingAmountOrder") => false,
        Symbol("createTrailingPercentOrder") => false,
        Symbol("createTriggerOrder") => true,
        Symbol("editOrder") => true,
        Symbol("fetchAccounts") => false,
        Symbol("fetchBalance") => true,
        Symbol("fetchCanceledAndClosedOrders") => true,
        Symbol("fetchCanceledOrders") => true,
        Symbol("fetchClosedOrder") => true,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchConvertCurrencies") => false,
        Symbol("fetchConvertQuote") => false,
        Symbol("fetchConvertTrade") => false,
        Symbol("fetchConvertTradeHistory") => false,
        Symbol("fetchCurrencies") => false,
        Symbol("fetchDepositAddress") => true,
        Symbol("fetchDepositAddresses") => true,
        Symbol("fetchDeposits") => true,
        Symbol("fetchDepositsWithdrawals") => false,
        Symbol("fetchDepositWithdrawFees") => false,
        Symbol("fetchFundingHistory") => false,
        Symbol("fetchFundingRate") => true,
        Symbol("fetchFundingRateHistory") => true,
        Symbol("fetchFundingRates") => true,
        Symbol("fetchIndexOHLCV") => true,
        Symbol("fetchLedger") => true,
        Symbol("fetchLeverage") => false,
        Symbol("fetchLeverageTiers") => false,
        Symbol("fetchMarginAdjustmentHistory") => false,
        Symbol("fetchMarginMode") => false,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => true,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterest") => false,
        Symbol("fetchOpenInterestHistory") => false,
        Symbol("fetchOpenOrder") => true,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOrder") => false,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrders") => false,
        Symbol("fetchOrderTrades") => true,
        Symbol("fetchPosition") => true,
        Symbol("fetchPositionHistory") => false,
        Symbol("fetchPositionMode") => false,
        Symbol("fetchPositions") => true,
        Symbol("fetchPositionsForSymbol") => true,
        Symbol("fetchPositionsHistory") => true,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchStatus") => false,
        Symbol("fetchTicker") => false,
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => false,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => false,
        Symbol("fetchTradingFees") => false,
        Symbol("fetchTransactions") => false,
        Symbol("fetchTransfers") => false,
        Symbol("fetchWithdrawals") => true,
        Symbol("reduceMargin") => false,
        Symbol("sandbox") => false,
        Symbol("setLeverage") => true,
        Symbol("setMargin") => false,
        Symbol("setMarginMode") => false,
        Symbol("setPositionMode") => false,
        Symbol("transfer") => true,
        Symbol("withdraw") => false
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "1m",
        Symbol("5m") => "5m",
        Symbol("15m") => "15m",
        Symbol("30m") => "30m",
        Symbol("1h") => "1H",
        Symbol("4h") => "4H",
        Symbol("12h") => "12H",
        Symbol("1d") => "1D",
        Symbol("1w") => "1W",
        Symbol("1M") => "1M",
        Symbol("1y") => "1Y"
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/ddf3e178-c3b6-409d-8f9f-af8b7cf80454",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => "https://api.deepcoin.com",
            Symbol("private") => "https://api.deepcoin.com"
        ),
        Symbol("www") => "https://www.deepcoin.com/",
        Symbol("doc") => "https://www.deepcoin.com/docs",
        Symbol("referral") => Dict{Symbol, Any}(
            Symbol("url") => "https://s.deepcoin.com/UzkyODgy",
            Symbol("discount") => 0.1
        )
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("deepcoin/market/books") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("deepcoin/market/candles") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("deepcoin/market/instruments") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("deepcoin/market/tickers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("deepcoin/market/index-candles") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("deepcoin/market/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("deepcoin/market/mark-price-candles") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("deepcoin/market/step-margin") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("deepcoin/trade/funding-rate") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("deepcoin/trade/fund-rate/current-funding-rate") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("deepcoin/trade/fund-rate/history") => Dict{Symbol, Any}(
    Symbol("cost") => 5
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("deepcoin/account/balances") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("deepcoin/account/bills") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("deepcoin/account/positions") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("deepcoin/trade/fills") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("deepcoin/trade/orderByID") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("deepcoin/trade/finishOrderByID") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("deepcoin/trade/orders-history") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("deepcoin/trade/v2/orders-pending") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("deepcoin/trade/trigger-orders-pending") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("deepcoin/trade/trigger-orders-history") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("deepcoin/copytrading/support-contracts") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("deepcoin/copytrading/leader-position") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("deepcoin/copytrading/estimate-profit") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("deepcoin/copytrading/history-profit") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("deepcoin/copytrading/follower-rank") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("deepcoin/internal-transfer/support") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("deepcoin/internal-transfer/history-order") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("deepcoin/rebate/config") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("deepcoin/agents/users") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("deepcoin/agents/users/rebate-list") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("deepcoin/agents/users/rebates") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("deepcoin/asset/deposit-list") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("deepcoin/asset/withdraw-list") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("deepcoin/asset/recharge-chain-list") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("deepcoin/listenkey/acquire") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("deepcoin/listenkey/extend") => Dict{Symbol, Any}(
    Symbol("cost") => 5
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("deepcoin/account/set-leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("deepcoin/trade/order") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("deepcoin/trade/replace-order") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("deepcoin/trade/cancel-order") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("deepcoin/trade/batch-cancel-order") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("deepcoin/trade/cancel-trigger-order") => Dict{Symbol, Any}(
    Symbol("cost") => 1 / 6
),
                Symbol("deepcoin/trade/swap/cancel-all") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("deepcoin/trade/trigger-order") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("deepcoin/trade/batch-close-position") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("deepcoin/trade/replace-order-sltp") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("deepcoin/trade/close-position-by-ids") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("deepcoin/copytrading/leader-settings") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("deepcoin/copytrading/set-contracts") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("deepcoin/internal-transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("deepcoin/rebate/config") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("deepcoin/asset/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 5
)
            )
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("taker") => self.parseNumber("0.0015"),
            Symbol("maker") => self.parseNumber("0.0010")
        )
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("sandbox") => false,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("triggerPrice") => true,
                Symbol("triggerPriceType") => Dict{Symbol, Any}(
                    Symbol("last") => true,
                    Symbol("mark") => false,
                    Symbol("index") => false
                ),
                Symbol("triggerDirection") => false,
                Symbol("stopLossPrice") => true,
                Symbol("takeProfitPrice") => true,
                Symbol("attachedStopLossTakeProfit") => Dict{Symbol, Any}(
                    Symbol("triggerPriceType") => Dict{Symbol, Any}(
                        Symbol("last") => false,
                        Symbol("mark") => false,
                        Symbol("index") => false
                    ),
                    Symbol("price") => true
                ),
                Symbol("timeInForce") => Dict{Symbol, Any}(
                    Symbol("IOC") => true,
                    Symbol("FOK") => true,
                    Symbol("PO") => true,
                    Symbol("GTD") => false
                ),
                Symbol("hedged") => true,
                Symbol("trailing") => false,
                Symbol("marketBuyRequiresPrice") => false
            ),
            Symbol("createOrders") => nothing,
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => 60,
                Symbol("untilDays") => nothing,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOrder") => nothing,
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("trigger") => true,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOrders") => nothing,
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => nothing,
                Symbol("daysBackCanceled") => nothing,
                Symbol("untilDays") => nothing,
                Symbol("trigger") => true,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 300
            )
        ),
        Symbol("swap") => Dict{Symbol, Any}(
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("extends") => "spot"
            ),
            Symbol("inverse") => Dict{Symbol, Any}(
                Symbol("extends") => "spot"
            )
        )
    ),
    Symbol("requiredCredentials") => Dict{Symbol, Any}(
        Symbol("apiKey") => true,
        Symbol("secret") => true,
        Symbol("password") => true
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("recvWindow") => 5000,
        Symbol("defaultNetworks") => Dict{Symbol, Any}(
            Symbol("ETH") => "ERC20",
            Symbol("USDT") => "TRC20",
            Symbol("USDC") => "ERC20"
        ),
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("ERC20") => "ERC20",
            Symbol("TRC20") => "TRC20",
            Symbol("ARBITRUM") => "ARBITRUM",
            Symbol("BSC") => "BSC(BEP20)",
            Symbol("SOL") => "SOL",
            Symbol("BTC") => "Bitcoin",
            Symbol("ADA") => "Cardano"
        ),
        Symbol("networksById") => Dict{Symbol, Any}(),
        Symbol("fetchMarkets") => Dict{Symbol, Any}(
            Symbol("types") => ["spot", "swap"]
        ),
        Symbol("timeInForce") => Dict{Symbol, Any}(
            Symbol("GTC") => "GTC",
            Symbol("IOC") => "IOC",
            Symbol("PO") => "PO"
        ),
        Symbol("exchangeType") => Dict{Symbol, Any}(
            Symbol("spot") => "SPOT",
            Symbol("swap") => "SWAP",
            Symbol("SPOT") => "SPOT",
            Symbol("SWAP") => "SWAP"
        ),
        Symbol("accountsByType") => Dict{Symbol, Any}(
            Symbol("spot") => 1,
            Symbol("fund") => 2,
            Symbol("rebate") => 3,
            Symbol("inverse") => 5,
            Symbol("linear") => 7,
            Symbol("demo") => 10
        )
    ),
    Symbol("commonCurrencies") => Dict{Symbol, Any}(),
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("24") => OrderNotFound,
            Symbol("31") => InsufficientFunds,
            Symbol("36") => InsufficientFunds,
            Symbol("44") => BadRequest,
            Symbol("49") => InvalidOrder,
            Symbol("194") => InvalidOrder,
            Symbol("195") => InvalidOrder,
            Symbol("199") => BadRequest,
            Symbol("100010") => InsufficientFunds,
            Symbol("unsupportedAction") => BadRequest,
            Symbol("localIDNotExist") => BadRequest
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("no available") => NotSupported,
            Symbol("field is required") => ArgumentsRequired,
            Symbol("not in acceptable range") => BadRequest,
            Symbol("subscription cluster does not \"exist\"") => BadRequest,
            Symbol("must be equal or lesser than") => BadRequest
        )
    )
))

end
function handleMarketTypeAndParams(self::Deepcoin, methodName; market=nothing, params=Dict(), defaultValue=nothing)
    instType = safeString(params, "instType");
    params = omit(params, "instType");
    type_var = safeString(params, "type");
    if functions.ccxtruthy(@functions.ccxt_and((type_var == nothing), (instType != nothing)))
        params = extend(params, Dict{Symbol, Any}(
    Symbol("type") => instType
));
    end
    return handleMarketTypeAndParams(self.parent, methodName, market = market, params = params, defaultValue = defaultValue)

end
function convertToInstrumentType(self::Deepcoin, type_var)
    exchangeTypes = self.safeDict(self.options, "exchangeType", defaultValue = Dict{Symbol, Any}());
    return safeString(exchangeTypes, type_var, type_var)

end
"""
retrieves data on all markets for okcoin
see: https://www.deepcoin.com/docs/DeepCoinMarket/getBaseInfo

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Deepcoin; params=Dict())
    types = ["spot", "swap"];
    fetchMarketsOption = self.safeDict(self.options, "fetchMarkets");
    if functions.ccxtruthy(fetchMarketsOption != nothing)
        types = self.safeList(fetchMarketsOption, "types", defaultValue = types);
    else
        types = self.safeList(self.options, "fetchMarkets", defaultValue = types);
    end
    promises = [];
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(types)))
        push!(promises, self.fetchMarketsByType(get(types, i + 1, nothing), params = params));
        i += 1
    end
    promises = Base.fetch(asyncmap(Base.fetch, promises));
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(promises)))
        result = arrayConcat(result, get(promises, i + 1, nothing));
        i += 1
    end
    return result

end
function fetchMarketsByType(self::Deepcoin, type_var; params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("instType") => self.convertToInstrumentType(type_var)
    );
    response = Base.fetch(self.publicGetDeepcoinMarketInstruments(extend(request, params)));
    dataResponse = self.safeList(response, "data", defaultValue = []);
    return self.parseMarkets(dataResponse)

end
function parseMarket(self::Deepcoin, market)
    id = safeString(market, "instId");
    type_var = safeStringLower(market, "instType");
    spot = (type_var == "spot");
    swap = (type_var == "swap");
    baseId = safeString(market, "baseCcy");
    quoteId = safeString(market, "quoteCcy", "");
    settleId = nothing;
    settle = nothing;
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    symbol = string(base, "/", quote_var);
    isLinear = nothing;
    if functions.ccxtruthy(swap)
        isLinear = (quoteId != "USD");
        settleId = functions.ccxtruthy(isLinear) ? quoteId : baseId;
        settle = self.safeCurrencyCode(settleId);
        symbol = string(symbol, ":", settle);
    end
    fees = self.safeDict2(self.fees, type_var, "trading", defaultValue = Dict{Symbol, Any}());
    maxLeverage = safeString(market, "lever", "1");
    maxLeverage = stringMax(maxLeverage, "1");
    maxMarketSize = safeString(market, "maxMktSz");
    maxLimitSize = safeString(market, "maxLmtSz");
    maxAmount = self.parseNumber(stringMax(maxMarketSize, maxLimitSize));
    state = safeString(market, "state");
    isMargin = @functions.ccxt_and(spot, (stringGt(maxLeverage, "1")));
    isInverse = functions.ccxtruthy(swap) ? (!functions.ccxtruthy(isLinear)) : nothing;
    return extend(fees, Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => settle,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => settleId,
    Symbol("type") => type_var,
    Symbol("spot") => spot,
    Symbol("margin") => isMargin,
    Symbol("swap") => swap,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => state == "live",
    Symbol("contract") => swap,
    Symbol("linear") => isLinear,
    Symbol("inverse") => isInverse,
    Symbol("contractSize") => functions.ccxtruthy(swap) ? self.safeNumber(market, "ctVal") : nothing,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("created") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.safeNumber(market, "lotSz"),
        Symbol("price") => self.safeNumber(market, "tickSz")
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => self.parseNumber("1"),
            Symbol("max") => self.parseNumber(maxLeverage)
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "minSz"),
            Symbol("max") => maxAmount
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
    Symbol("info") => market
))

end
function setMarkets(self::Deepcoin, markets; currencies=nothing)
    result = setMarkets(self.parent, markets, currencies = currencies);
    symbols = objectKeys(result);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(symbols)))
        symbol = get(symbols, i + 1, nothing);
        market = get(result, Symbol(symbol), nothing);
        if functions.ccxtruthy(@functions.ccxt_and((market != nothing), get(market, Symbol("swap"), nothing)))
            additionalId = string(safeString(market, "baseId", ""), safeString(market, "quoteId", ""));
            if functions.ccxtruthy(self.markets_by_id != nothing)
                self.markets_by_id[Symbol(additionalId)] = [market];
            end
        end
        i += 1
    end
    return result

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://www.deepcoin.com/docs/DeepCoinMarket/marketBooks

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Deepcoin, symbol; limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(limit == nothing)
        limit = 400;
    end
    request = Dict{Symbol, Any}(
        Symbol("instId") => get(market, Symbol("id"), nothing),
        Symbol("sz") => limit
    );
    response = Base.fetch(self.publicGetDeepcoinMarketBooks(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseOrderBook(data, symbol, timestamp = nothing, bidsKey = "bids", asksKey = "asks", priceKey = 0, amountKey = 1)

end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://www.deepcoin.com/docs/DeepCoinMarket/getKlineData
see: https://www.deepcoin.com/docs/DeepCoinMarket/getIndexKlineData
see: https://www.deepcoin.com/docs/DeepCoinMarket/getMarkKlineData

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest candle to fetch
- `params.price`::string, optional: "mark" or "index" for mark price and index price candles
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchOHLCV(self::Deepcoin, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    maxLimit = 300;
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOHLCV", "paginate", defaultValue = false);
    if functions.ccxtruthy(paginate)
        params = extend(params, Dict{Symbol, Any}(
    Symbol("calculateUntil") => true
));
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchOHLCV", symbol = symbol, since = since, limit = limit, timeframe = timeframe, params = params, maxEntriesPerRequest = maxLimit))
    end
    market = self.market(symbol);
    price = safeString(params, "price");
    params = omit(params, "price");
    bar = safeString(self.timeframes, timeframe, timeframe);
    request = Dict{Symbol, Any}(
        Symbol("instId") => get(market, Symbol("id"), nothing),
        Symbol("bar") => bar
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    until = safeInteger(params, "until");
    if functions.ccxtruthy(until != nothing)
        request[Symbol("after")] = until;
        params = omit(params, "until");
    end
    calculateUntil = self.safeBool(params, "calculateUntil", defaultValue = false);
    if functions.ccxtruthy(calculateUntil)
        params = omit(params, "calculateUntil");
        if functions.ccxtruthy(since != nothing)
            duration = self.parseTimeframe(timeframe);
            numberOfCandles = functions.ccxtruthy((limit == nothing)) ? maxLimit : limit;
            endTime = since + (duration * numberOfCandles) * 1000;
            if functions.ccxtruthy(until != nothing)
                endTime = min(endTime, until);
            end
            now = milliseconds();
            request[Symbol("after")] = min(endTime, now);
        end
    end
    response = nothing;
    if functions.ccxtruthy(price == "mark")
        response = Base.fetch(self.publicGetDeepcoinMarketMarkPriceCandles(extend(request, params)));
    elseif functions.ccxtruthy(price == "index")
        response = Base.fetch(self.publicGetDeepcoinMarketIndexCandles(extend(request, params)));
    else
        response = Base.fetch(self.publicGetDeepcoinMarketCandles(extend(request, params)));
    end
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseOHLCVs(data, market = market, timeframe = timeframe, since = since, limit = limit)

end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://www.deepcoin.com/docs/DeepCoinMarket/getMarketTickers

# Arguments
- `symbols`::array, optional: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTickers(self::Deepcoin; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols);
    market = self.getMarketFromSymbols(symbols = symbols);
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchTickers", market = market, params = params);
    request = Dict{Symbol, Any}(
        Symbol("instType") => self.convertToInstrumentType(marketType)
    );
    response = Base.fetch(self.publicGetDeepcoinMarketTickers(extend(request, params)));
    tickers = self.safeList(response, "data", defaultValue = []);
    return self.parseTickers(tickers, symbols = symbols)

end
function parseTicker(self::Deepcoin, ticker; market=nothing)
    timestamp = safeInteger(ticker, "ts");
    marketId = safeString(ticker, "instId");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = "-");
    symbol = get(market, Symbol("symbol"), nothing);
    last_var = safeString(ticker, "last");
    open = safeString(ticker, "open24h");
    quoteVolume = safeString(ticker, "volCcy24h");
    baseVolume = safeString(ticker, "vol24h");
    if functions.ccxtruthy(@functions.ccxt_and(get(market, Symbol("swap"), nothing), get(market, Symbol("inverse"), nothing)))
        temp = baseVolume;
        baseVolume = quoteVolume;
        quoteVolume = temp;
    end
    high = safeString(ticker, "high24h");
    low = safeString(ticker, "low24h");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => high,
    Symbol("low") => low,
    Symbol("bid") => safeString(ticker, "bidPx"),
    Symbol("bidVolume") => safeString(ticker, "bidSz"),
    Symbol("ask") => safeString(ticker, "askPx"),
    Symbol("askVolume") => safeString(ticker, "askSz"),
    Symbol("vwap") => nothing,
    Symbol("open") => open,
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => nothing,
    Symbol("average") => nothing,
    Symbol("baseVolume") => baseVolume,
    Symbol("quoteVolume") => quoteVolume,
    Symbol("markPrice") => nothing,
    Symbol("indexPrice") => nothing,
    Symbol("info") => ticker
), market = market)

end
"""
get the list of most recent trades for a particular symbol
see: https://www.deepcoin.com/docs/DeepCoinMarket/getTrades

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch (default 100, max 500)
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
function fetchTrades(self::Deepcoin, symbol; since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instId") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 500);
    end
    productGroup = self.getProductGroupFromMarket(market);
    request[Symbol("productGroup")] = productGroup;
    response = Base.fetch(self.publicGetDeepcoinMarketTrades(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseTrades(data, market = market, since = since, limit = limit)

end
function getProductGroupFromMarket(self::Deepcoin, market)
    productGroup = "Spot";
    if functions.ccxtruthy(self.safeBool(market, "swap"))
        if functions.ccxtruthy(self.safeBool(market, "linear"))
            productGroup = "SwapU";
        else
            productGroup = "Swap";
        end
    end
    return productGroup

end
function parseTrade(self::Deepcoin, trade; market=nothing)
    marketId = safeString(trade, "instId");
    market = self.safeMarket(marketId = marketId, market = market);
    timestamp = safeInteger(trade, "ts");
    side = safeString(trade, "side");
    execType = safeString(trade, "execType");
    fee = nothing;
    feeCost = safeString(trade, "fee");
    if functions.ccxtruthy(feeCost != nothing)
        feeCurrencyId = safeString(trade, "feeCcy");
        feeCurrencyCode = self.safeCurrencyCode(feeCurrencyId);
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCost,
            Symbol("currency") => feeCurrencyCode
        );
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("id") => safeString(trade, "tradeId"),
    Symbol("order") => safeString(trade, "ordId"),
    Symbol("type") => nothing,
    Symbol("takerOrMaker") => self.parseTakerOrMaker(execType),
    Symbol("side") => side,
    Symbol("price") => safeString2(trade, "fillPx", "px"),
    Symbol("amount") => safeString2(trade, "fillSz", "sz"),
    Symbol("cost") => nothing,
    Symbol("fee") => fee
), market = market)

end
function parseTakerOrMaker(self::Deepcoin, execType)
    types = Dict{Symbol, Any}(
        Symbol("T") => "taker",
        Symbol("M") => "maker"
    );
    return safeString(types, execType, execType)

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://www.deepcoin.com/docs/DeepCoinAccount/getAccountBalance

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: "spot" or "swap", the market type for the balance

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Deepcoin; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchBalance", market = nothing, params = params, defaultValue = marketType);
    request = Dict{Symbol, Any}(
        Symbol("instType") => self.convertToInstrumentType(marketType)
    );
    response = Base.fetch(self.privateGetDeepcoinAccountBalances(extend(request, params)));
    return self.parseBalance(response)

end
function parseBalance(self::Deepcoin, response)
    result = Dict{Symbol, Any}(
        Symbol("info") => response,
        Symbol("timestamp") => nothing,
        Symbol("datetime") => nothing
    );
    balances = self.safeList(response, "data", defaultValue = []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(balances)))
        balance = get(balances, i + 1, nothing);
        symbol = safeString(balance, "ccy");
        code = self.safeCurrencyCode(symbol);
        account = self.account();
        account[Symbol("total")] = safeString(balance, "bal");
        account[Symbol("used")] = safeString(balance, "frozenBal");
        account[Symbol("free")] = safeString(balance, "availBal");
        result[Symbol(code)] = account;
        i += 1
    end
    return self.safeBalance(result)

end
"""
fetch all deposits made to an account
see: https://www.deepcoin.com/docs/assets/deposit

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDeposits(self::Deepcoin; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchDeposits", "paginate", defaultValue = false);
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchDeposits", symbol = code, since = since, limit = limit, params = params, cursorReceived = "code", cursorSent = nothing, cursorIncrement = 1, maxEntriesPerRequest = 50))
    end
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("coin")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("size")] = limit;
    end
    until = safeInteger(params, "until");
    if functions.ccxtruthy(until != nothing)
        request[Symbol("endTime")] = until;
        params = omit(params, "until");
    end
    response = Base.fetch(self.privateGetDeepcoinAssetDepositList(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    items = self.safeList(data, "data", defaultValue = []);
    transactionParams = Dict{Symbol, Any}(
        Symbol("type") => "deposit"
    );
    return self.parseTransactions(items, currency = currency, since = since, limit = limit, params = transactionParams)

end
"""
fetch all withdrawals made from an account
see: https://www.deepcoin.com/docs/assets/withdraw

# Arguments
- `code`::string: unified currency code of the currency transferred
- `since`::int, optional: the earliest time in ms to fetch transfers for (default 24 hours ago)
- `limit`::int, optional: the maximum number of transfer structures to retrieve (default 50, max 200)
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch transfers for (default time now)
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchWithdrawals(self::Deepcoin; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchWithdrawals", "paginate", defaultValue = false);
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchWithdrawals", symbol = code, since = since, limit = limit, params = params, cursorReceived = "code", cursorSent = nothing, cursorIncrement = 1, maxEntriesPerRequest = 50))
    end
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("coin")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("size")] = limit;
    end
    until = safeInteger(params, "until");
    if functions.ccxtruthy(until != nothing)
        request[Symbol("endTime")] = until;
        params = omit(params, "until");
    end
    response = Base.fetch(self.privateGetDeepcoinAssetWithdrawList(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    items = self.safeList(data, "data", defaultValue = []);
    transactionParams = Dict{Symbol, Any}(
        Symbol("type") => "withdrawal"
    );
    return self.parseTransactions(items, currency = currency, since = since, limit = limit, params = transactionParams)

end
function parseTransaction(self::Deepcoin, transaction; currency=nothing)
    txid = safeString(transaction, "txHash");
    currencyId = safeString(transaction, "coin");
    code = self.safeCurrencyCode(currencyId, currency = currency);
    amount = self.safeNumber(transaction, "amount");
    timestamp = safeTimestamp(transaction, "createTime");
    networkId = safeString(transaction, "chainName");
    network = self.networkIdToCode(networkId = networkId, currencyCode = code);
    status = self.parseTransactionStatus(safeString(transaction, "status"));
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => nothing,
    Symbol("currency") => code,
    Symbol("amount") => amount,
    Symbol("network") => network,
    Symbol("addressFrom") => nothing,
    Symbol("addressTo") => nothing,
    Symbol("address") => safeString(transaction, "address"),
    Symbol("tagFrom") => nothing,
    Symbol("tagTo") => nothing,
    Symbol("tag") => nothing,
    Symbol("status") => status,
    Symbol("type") => nothing,
    Symbol("updated") => nothing,
    Symbol("txid") => txid,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("internal") => nothing,
    Symbol("comment") => nothing,
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("currency") => nothing,
        Symbol("cost") => nothing
    )
)

end
function parseTransactionStatus(self::Deepcoin, status)
    statuses = Dict{Symbol, Any}(
        Symbol("confirming") => "pending",
        Symbol("succeed") => "ok"
    );
    return safeString(statuses, status, status)

end
"""
fetch deposit addresses for multiple currencies and chain types
see: https://www.deepcoin.com/docs/assets/chainlist

# Arguments
- `codes`::any: list of unified currency codes, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [address structures]{@link https://docs.ccxt.com/?id=address-structure}
"""
function fetchDepositAddresses(self::Deepcoin; codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(codes == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchDepositAddresses requires a list with one currency code")));
    end
    len = length(codes);
    if functions.ccxtruthy(len != 1)
        throw(NotSupported(string(self.id, " fetchDepositAddresses requires a list with one currency code")));
    end
    code = get(codes, 1, nothing);
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency_id") => get(currency, Symbol("id"), nothing),
        Symbol("lang") => "en"
    );
    response = Base.fetch(self.privateGetDeepcoinAssetRechargeChainList(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    list = self.safeList(data, "list", defaultValue = []);
    additionalParams = Dict{Symbol, Any}(
        Symbol("currency") => code
    );
    return self.parseDepositAddresses(list, codes = codes, indexed = false, params = additionalParams)

end
"""
fetch the deposit address for a currency associated with this account
see: https://www.deepcoin.com/docs/assets/chainlist

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.network`::string, optional: unified network code for deposit chain

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
function fetchDepositAddress(self::Deepcoin, code; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    network = safeString(params, "network");
    defaultNetworks = self.safeDict(self.options, "defaultNetworks", defaultValue = Dict{Symbol, Any}());
    defaultNetwork = safeString(defaultNetworks, code);
    network = functions.ccxtruthy(network) ? network : defaultNetwork;
    if functions.ccxtruthy(network != nothing)
        params = omit(params, "network");
    end
    addressess = Base.fetch(self.fetchDepositAddresses(codes = [code], params = params));
    len = length(addressess);
    address = self.safeDict(addressess, 0, defaultValue = Dict{Symbol, Any}());
    if functions.ccxtruthy(@functions.ccxt_and((network != nothing), (functions.ccxt_gt(len, 1))))
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, len))
            entry = get(addressess, i + 1, nothing);
            if functions.ccxtruthy(get(entry, Symbol("network"), nothing) == network)
                address = entry;
            end
            i += 1
        end

    end
    return address

end
function parseDepositAddress(self::Deepcoin, response; currency=nothing)
    chain = safeString(response, "chain");
    address = safeString(response, "address");
    self.checkAddress(address = address);
    code = safeString(currency, "code");
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("currency") => nothing,
    Symbol("network") => self.networkIdToCode(networkId = chain, currencyCode = code),
    Symbol("address") => address,
    Symbol("tag") => safeString(response, "memo")
)

end
"""
fetch the history of changes, actions done by the user or operations that altered the balance of the user
see: https://www.deepcoin.com/docs/DeepCoinAccount/getAccountBills

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: timestamp in ms of the earliest ledger entry
- `limit`::int, optional: max number of ledger entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest ledger entry
- `params.type`::string, optional: 'spot' or 'swap', the market type for the ledger (default 'spot')

# Returns
- a list of [ledger structures]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
"""
function fetchLedger(self::Deepcoin; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    marketType = "spot";
    (marketType, params) = self.handleMarketTypeAndParams("fetchLedger", market = nothing, params = params, defaultValue = marketType);
    request = Dict{Symbol, Any}(
        Symbol("instType") => self.convertToInstrumentType(marketType)
    );
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("ccy")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("after")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    until = safeInteger(params, "until");
    if functions.ccxtruthy(until != nothing)
        request[Symbol("before")] = until;
        params = omit(params, "until");
    end
    response = Base.fetch(self.privateGetDeepcoinAccountBills(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseLedger(data, currency = currency, since = since, limit = limit)

end
function parseLedgerEntry(self::Deepcoin, item; currency=nothing)
    timestamp = safeInteger(item, "ts");
    change = safeString(item, "balChg");
    amount = stringAbs(change);
    direction = functions.ccxtruthy(stringLt(change, "0")) ? "out" : "in";
    currencyId = safeString(item, "ccy");
    currency = self.safeCurrency(currencyId, currency = currency);
    type_var = safeString(item, "type");
    return self.safeLedgerEntry(Dict{Symbol, Any}(
    Symbol("info") => item,
    Symbol("id") => safeString(item, "billId"),
    Symbol("direction") => direction,
    Symbol("account") => nothing,
    Symbol("referenceAccount") => nothing,
    Symbol("referenceId") => nothing,
    Symbol("type") => self.parseLedgerEntryType(type_var),
    Symbol("currency") => get(currency, Symbol("code"), nothing),
    Symbol("amount") => amount,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("before") => nothing,
    Symbol("after") => safeString(item, "bal"),
    Symbol("status") => nothing,
    Symbol("fee") => nothing
), currency = currency)

end
function parseLedgerEntryType(self::Deepcoin, type_var)
    ledgerType = Dict{Symbol, Any}(
        Symbol("1") => "trade",
        Symbol("2") => "trade",
        Symbol("3") => "transfer",
        Symbol("4") => "transfer",
        Symbol("5") => "fee"
    );
    return safeString(ledgerType, type_var, type_var)

end
"""
transfer currency internally between wallets on the same account
see: https://www.deepcoin.com/docs/assets/transfer

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: account to transfer from ('spot', 'inverse', 'linear', 'fund', 'rebate' or 'demo')
- `toAccount`::string: account to transfer to ('spot', 'inverse', 'linear', 'fund', 'rebate' or 'demo')
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.userId`::string, optional: user id

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
function transfer(self::Deepcoin, code, amount, fromAccount, toAccount; params=Dict())
    userId = nothing;
    (userId, params) = self.handleOptionAndParams(params, "transfer", "userId");
    userId = functions.ccxtruthy(userId) ? userId : safeString(params, "uid");
    if functions.ccxtruthy(userId == nothing)
        throw(ArgumentsRequired(string(self.id, " Ccxt.transfer() requires a userId parameter")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    accountsByType = self.safeDict(self.options, "accountsByType", defaultValue = Dict{Symbol, Any}());
    fromId = safeString(accountsByType, fromAccount, fromAccount);
    toId = safeString(accountsByType, toAccount, toAccount);
    request = Dict{Symbol, Any}(
        Symbol("currency_id") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => self.currencyToPrecision(code, amount),
        Symbol("from_id") => fromId,
        Symbol("to_id") => toId,
        Symbol("uid") => userId
    );
    response = Base.fetch(self.privatePostDeepcoinAssetTransfer(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    transfer = self.parseTransfer(data, currency = currency);
    transferOptions = self.safeDict(self.options, "transfer", defaultValue = Dict{Symbol, Any}());
    fillResponseFromRequest = self.safeBool(transferOptions, "fillResponseFromRequest", defaultValue = true);
    if functions.ccxtruthy(fillResponseFromRequest)
        transfer[Symbol("fromAccount")] = fromAccount;
        transfer[Symbol("toAccount")] = toAccount;
        transfer[Symbol("amount")] = amount;
    end
    return transfer

end
function parseTransfer(self::Deepcoin, transfer; currency=nothing)
    status = safeString(transfer, "retCode");
    currencyCode = self.safeCurrencyCode(nothing, currency = currency);
    return Dict{Symbol, Any}(
    Symbol("info") => transfer,
    Symbol("id") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("currency") => currencyCode,
    Symbol("amount") => nothing,
    Symbol("fromAccount") => nothing,
    Symbol("toAccount") => nothing,
    Symbol("status") => self.parseTransferStatus(status)
)

end
function parseTransferStatus(self::Deepcoin, status)
    if functions.ccxtruthy(status == "0")
            return "ok"
    end
    return "failed"

end
"""
create a trade order
see: https://www.deepcoin.com/docs/DeepCoinTrade/order
see: https://www.deepcoin.com/docs/DeepCoinTrade/triggerOrder

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: a unique id for the order
- `params.timeInForce`::string, optional: *non trigger orders only* 'GTC' (Good Till Cancel), 'IOC' (Immediate Or Cancel) or 'PO' (Post Only)
- `params.postOnly`::bool, optional: *non trigger orders only* true to place a post only order
- `params.reduceOnly`::bool, optional: *non trigger orders only* a mark to reduce the position size for margin, swap and future orders
- `params.triggerPrice`::float, optional: the price a trigger order is triggered at
- `params.stopLoss.triggerPrice`::float, optional: the price that a stop loss order is triggered at
- `params.takeProfit.triggerPrice`::float, optional: the price that a take profit order is triggered at
- `params.positionSide`::string, optional: if position mode is one-way: set to 'net', if position mode is hedge-mode: set to 'long' or 'short'
- `params.hedged`::bool, optional: *swap only* true for hedged mode, false for one way mode
- `params.marginMode`::string, optional: *swap only*'cross' or 'isolated', the default is 'cash' for spot and 'cross' for swap

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrder(self::Deepcoin, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    triggerPrice = safeString(params, "triggerPrice");
    request = self.createOrderRequest(symbol, type_var, side, amount, price = price, params = params);
    response = nothing;
    if functions.ccxtruthy(triggerPrice != nothing)
        response = Base.fetch(self.privatePostDeepcoinTradeTriggerOrder(request));
    else
        response = Base.fetch(self.privatePostDeepcoinTradeOrder(request));
    end
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(data, market = market)

end
function createOrderRequest(self::Deepcoin, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(type_var == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a type argument")));
    end
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a side argument")));
    end
    market = self.market(symbol);
    triggerPrice = safeString(params, "triggerPrice");
    isTriggerOrder = (triggerPrice != nothing);
    cost = safeString(params, "cost");
    if functions.ccxtruthy(cost != nothing)
        if functions.ccxtruthy(@functions.ccxt_or(!functions.ccxtruthy(get(market, Symbol("spot"), nothing)), (triggerPrice != nothing)))
            throw(BadRequest(string(self.id, " createOrder() accepts a cost parameter for spot non-trigger market orders only")));
        end
    end
    if functions.ccxtruthy(isTriggerOrder)
            return self.createTriggerOrderRequest(symbol, type_var, side, amount, price = price, params = params)
    else
        return self.createRegularOrderRequest(symbol, type_var, side, amount, price = price, params = params)
    end

end
function createRegularOrderRequest(self::Deepcoin, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(type_var == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a type argument")));
    end
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a side argument")));
    end
    market = self.market(symbol);
    orderType = type_var;
    (orderType, params) = self.handleTypePostOnlyAndTimeInForce(type_var, params);
    request = Dict{Symbol, Any}(
        Symbol("instId") => get(market, Symbol("id"), nothing),
        Symbol("side") => side,
        Symbol("ordType") => orderType
    );
    clientOrderId = safeString(params, "clientOrderId");
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("clOrdId")] = clientOrderId;
        params = omit(params, "clientOrderId");
    end
    stopLoss = self.safeDict(params, "stopLoss", defaultValue = Dict{Symbol, Any}());
    stopLossPrice = safeString(stopLoss, "triggerPrice");
    if functions.ccxtruthy(stopLossPrice != nothing)
        params = omit(params, ["stopLoss"]);
        request[Symbol("slTriggerPx")] = self.priceToPrecision(symbol, stopLossPrice);
    end
    takeProfit = self.safeDict(params, "takeProfit", defaultValue = Dict{Symbol, Any}());
    takeProfitPrice = safeString(takeProfit, "triggerPrice");
    if functions.ccxtruthy(takeProfitPrice != nothing)
        params = omit(params, ["takeProfit"]);
        request[Symbol("tpTriggerPx")] = self.priceToPrecision(symbol, takeProfitPrice);
    end
    isMarketOrder = (type_var == "market");
    if functions.ccxtruthy(price != nothing)
        if functions.ccxtruthy(isMarketOrder)
            throw(BadRequest(string(self.id, " createOrder() does not require a price argument for market orders")));
        end
        request[Symbol("px")] = self.priceToPrecision(symbol, price);
    elseif functions.ccxtruthy(!functions.ccxtruthy(isMarketOrder))
        throw(BadRequest(string(self.id, " createOrder() requires a price argument for limit orders")));
    end
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        cost = safeString(params, "cost");
        if functions.ccxtruthy(cost != nothing)
            if functions.ccxtruthy(!functions.ccxtruthy(isMarketOrder))
                throw(BadRequest(string(self.id, " createOrder() accepts a cost parameter for spot market orders only")));
            end
            params = omit(params, "cost");
            request[Symbol("sz")] = self.costToPrecision(symbol, cost);
            request[Symbol("tgtCcy")] = "quote_ccy";
        else
            request[Symbol("sz")] = self.amountToPrecision(symbol, amount);
            request[Symbol("tgtCcy")] = "base_ccy";
        end
        request[Symbol("side")] = side;
        request[Symbol("tdMode")] = "cash";
    else
        request[Symbol("sz")] = self.amountToPrecision(symbol, amount);
        marginMode = "cross";
        (marginMode, params) = self.handleMarginModeAndParams("createOrder", params = params, defaultValue = marginMode);
        request[Symbol("tdMode")] = marginMode;
        mrgPosition = "merge";
        (mrgPosition, params) = self.handleOptionAndParams(params, "createOrder", "mrgPosition", defaultValue = mrgPosition);
        request[Symbol("mrgPosition")] = mrgPosition;
        posSide = nothing;
        reduceOnly = self.safeBool(params, "reduceOnly", defaultValue = false);
        if functions.ccxtruthy(reduceOnly)
            if functions.ccxtruthy(side == "buy")
                posSide = "short";
            elseif functions.ccxtruthy(side == "sell")
                posSide = "long";
            end
        else
            if functions.ccxtruthy(side == "buy")
                posSide = "long";
            elseif functions.ccxtruthy(side == "sell")
                posSide = "short";
            end
        end
        request[Symbol("posSide")] = posSide;
    end
    return extend(request, params)

end
function createTriggerOrderRequest(self::Deepcoin, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(type_var == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a type argument")));
    end
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a side argument")));
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instId") => get(market, Symbol("id"), nothing),
        Symbol("productGroup") => capitalize(get(market, Symbol("type"), nothing)),
        Symbol("sz") => self.amountToPrecision(symbol, amount),
        Symbol("side") => side,
        Symbol("orderType") => type_var
    );
    triggerPrice = safeString(params, "triggerPrice");
    request[Symbol("triggerPrice")] = self.priceToPrecision(symbol, triggerPrice);
    if functions.ccxtruthy(price != nothing)
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    elseif functions.ccxtruthy(type_var == "limit")
        throw(ArgumentsRequired(string(self.id, " createOrder() requires a price argument for limit trigger orders")));
    end
    marginMode = "cross";
    (marginMode, params) = self.handleMarginModeAndParams("createOrder", params = params, defaultValue = marginMode);
    isCrossMargin = 1;
    if functions.ccxtruthy(marginMode == "isolated")
        isCrossMargin = 0;
    end
    reduceOnly = self.safeBool(params, "reduceOnly", defaultValue = false);
    params = omit(params, "reduceOnly");
    request[Symbol("isCrossMargin")] = isCrossMargin;
    request[Symbol("tdMode")] = marginMode;
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        if functions.ccxtruthy(reduceOnly)
            if functions.ccxtruthy(side == "buy")
                request[Symbol("posSide")] = "short";
            elseif functions.ccxtruthy(side == "sell")
                request[Symbol("posSide")] = "long";
            end
        else
            if functions.ccxtruthy(side == "buy")
                request[Symbol("posSide")] = "long";
            elseif functions.ccxtruthy(side == "sell")
                request[Symbol("posSide")] = "short";
            end
        end
    end
    mrgPosition = "merge";
    (mrgPosition, params) = self.handleOptionAndParams(params, "createOrder", "mrgPosition", defaultValue = mrgPosition);
    request[Symbol("mrgPosition")] = mrgPosition;
    return extend(request, params)

end
function handleTypePostOnlyAndTimeInForce(self::Deepcoin, type_var, params)
    postOnly = false;
    (postOnly, params) = self.handlePostOnly(type_var == "market", type_var == "post_only", params = params);
    if functions.ccxtruthy(postOnly)
        type_var = "post_only";
    end
    timeInForce = self.handleTimeInForce(params = params);
    params = omit(params, "timeInForce");
    if functions.ccxtruthy(@functions.ccxt_and((timeInForce != nothing), (timeInForce == "IOC")))
        type_var = "ioc";
    end
    return [type_var, params]

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
function createMarketOrderWithCost(self::Deepcoin, symbol, side, cost; params=Dict())
    params = extend(params, Dict{Symbol, Any}(
    Symbol("cost") => cost
));
    return Base.fetch(self.createOrder(symbol, "market", side, 0, price = nothing, params = params))

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
function createMarketBuyOrderWithCost(self::Deepcoin, symbol, cost; params=Dict())
    params = extend(params, Dict{Symbol, Any}(
    Symbol("cost") => cost
));
    return Base.fetch(self.createOrder(symbol, "market", "buy", 0, price = nothing, params = params))

end
"""
create a market sell order by providing the symbol and cost

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createMarketSellOrderWithCost(self::Deepcoin, symbol, cost; params=Dict())
    params = extend(params, Dict{Symbol, Any}(
    Symbol("cost") => cost
));
    return Base.fetch(self.createOrder(symbol, "market", "sell", 0, price = nothing, params = params))

end
"""
fetches information on a closed order made by the user
see: https://www.deepcoin.com/docs/DeepCoinTrade/finishOrderByID

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchClosedOrder(self::Deepcoin, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchClosedOrder() requires a symbol argument")));
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instId") => get(market, Symbol("id"), nothing),
        Symbol("ordId") => id
    );
    response = Base.fetch(self.privateGetDeepcoinTradeFinishOrderByID(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    entry = self.safeDict(data, 0, defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(entry, market = market)

end
"""
fetch an open order by it's id
see: https://www.deepcoin.com/docs/DeepCoinTrade/orderByID

# Arguments
- `id`::string: order id
- `symbol`::string: unified market symbol, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrder(self::Deepcoin, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchClosedOrder() requires a symbol argument")));
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instId") => get(market, Symbol("id"), nothing),
        Symbol("ordId") => id
    );
    response = Base.fetch(self.privateGetDeepcoinTradeOrderByID(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    len = length(data);
    if functions.ccxtruthy(len == 0)
        throw(OrderNotFound(string(self.id, " fetchOpenOrder() could not find order id ", id)));
    end
    entry = self.safeDict(data, 0, defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(entry, market = market)

end
"""
fetches information on multiple canceled and closed orders made by the user
see: https://www.deepcoin.com/docs/DeepCoinTrade/ordersHistory
see: https://www.deepcoin.com/docs/DeepCoinTrade/triggerOrdersHistory

# Arguments
- `symbol`::string, optional: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: whether to fetch trigger/algo orders (default false)
- `params.type`::string, optional: *non trigger orders only* 'spot' or 'swap', the market type for the orders
- `params.state`::string, optional: *non trigger orders only* 'canceled' or 'filled', the order state to filter by
- `params.OrderType`::string, optional: *trigger orders only* 'limit' or 'market'
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchCanceledAndClosedOrders(self::Deepcoin; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchCanceledAndClosedOrders", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchCanceledAndClosedOrders", symbol = symbol, since = since, limit = limit, params = params))
    end
    trigger = self.safeBool(params, "trigger", defaultValue = false);
    methodName = "fetchCanceledAndClosedOrders";
    (methodName, params) = self.handleParamString(params, "methodName", defaultValue = methodName);
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("instId")] = get(market, Symbol("id"), nothing);
    end
    marketType = "spot";
    (marketType, params) = self.handleMarketTypeAndParams(methodName, market = market, params = params, defaultValue = marketType);
    request[Symbol("instType")] = self.convertToInstrumentType(marketType);
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = nothing;
    if functions.ccxtruthy(trigger)
        if functions.ccxtruthy(methodName != "fetchCanceledAndClosedOrders")
            throw(BadRequest(string(self.id, " ", methodName, "() does not support trigger orders")));
        end
        if functions.ccxtruthy(market == nothing)
            throw(ArgumentsRequired(string(self.id, " fetchCanceledAndClosedOrders() requires a symbol argument for trigger orders")));
        end
        params = omit(params, "trigger");
        response = Base.fetch(self.privateGetDeepcoinTradeTriggerOrdersHistory(extend(request, params)));
    else
        response = Base.fetch(self.privateGetDeepcoinTradeOrdersHistory(extend(request, params)));
    end
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseOrders(data, market = market, since = since, limit = limit)

end
"""
fetches information on multiple canceled orders made by the user
see: https://www.deepcoin.com/docs/DeepCoinTrade/ordersHistory

# Arguments
- `symbol`::string: unified market symbol of the market the orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap', the market type for the orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchCanceledOrders(self::Deepcoin; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    methodName = "fetchCanceledOrders";
    params = extend(params, Dict{Symbol, Any}(
    Symbol("methodName") => methodName
));
    params = extend(params, Dict{Symbol, Any}(
    Symbol("state") => "canceled"
));
    return Base.fetch(self.fetchCanceledAndClosedOrders(symbol = symbol, since = since, limit = limit, params = params))

end
"""
fetches information on multiple closed orders made by the user
see: https://www.deepcoin.com/docs/DeepCoinTrade/ordersHistory

# Arguments
- `symbol`::string: unified market symbol of the market the orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap', the market type for the orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchClosedOrders(self::Deepcoin; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    methodName = "fetchClosedOrders";
    params = extend(params, Dict{Symbol, Any}(
    Symbol("methodName") => methodName
));
    params = extend(params, Dict{Symbol, Any}(
    Symbol("state") => "filled"
));
    return Base.fetch(self.fetchCanceledAndClosedOrders(symbol = symbol, since = since, limit = limit, params = params))

end
"""
fetch all unfilled currently open orders
see: https://www.deepcoin.com/docs/DeepCoinTrade/ordersPendingV2
see: https://www.deepcoin.com/docs/DeepCoinTrade/triggerOrdersPending

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: whether to fetch trigger/algo orders (default false)
- `params.index`::int, optional: *non trigger orders only* pagination index, default is 1
- `params.orderType`::string, optional: *trigger orders only* 'limit' or 'market'

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Deepcoin; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOpenOrders() requires a symbol argument")));
    end
    market = self.market(symbol);
    index = safeInteger(params, "index", 1);
    request = Dict{Symbol, Any}(
        Symbol("instId") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    trigger = self.safeBool(params, "trigger", defaultValue = false);
    response = nothing;
    if functions.ccxtruthy(trigger)
        params = omit(params, "trigger");
        request[Symbol("instType")] = self.convertToInstrumentType(get(market, Symbol("type"), nothing));
        response = Base.fetch(self.privateGetDeepcoinTradeTriggerOrdersPending(extend(request, params)));
    else
        request[Symbol("index")] = index;
        response = Base.fetch(self.privateGetDeepcoinTradeV2OrdersPending(extend(request, params)));
    end
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseOrders(data, market = market, since = since, limit = limit, params = Dict{Symbol, Any}(
    Symbol("status") => "open"
))

end
"""
cancels an open order
see: https://www.deepcoin.com/docs/DeepCoinTrade/cancelOrder

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: whether the order is a trigger/algo order (default false)

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::Deepcoin, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a symbol argument")));
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instId") => get(market, Symbol("id"), nothing),
        Symbol("ordId") => id
    );
    response = nothing;
    trigger = self.safeBool(params, "trigger", defaultValue = false);
    if functions.ccxtruthy(trigger)
        params = omit(params, "trigger");
        response = Base.fetch(self.privatePostDeepcoinTradeCancelTriggerOrder(extend(request, params)));
    else
        response = Base.fetch(self.privatePostDeepcoinTradeCancelOrder(extend(request, params)));
    end
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(data, market = market)

end
"""
cancel all open orders in a market
see: https://www.deepcoin.com/docs/DeepCoinTrade/cancelAllOrder

# Arguments
- `symbol`::string: unified market symbol of the market to cancel orders in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: *swap only* 'cross' or 'isolated', the default is 'cash' for spot and 'cross' for swap
- `params.merged`::bool, optional: *swap only* true for merged positions, false for split positions (default true)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelAllOrders(self::Deepcoin; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelAllOrders() requires a symbol argument")));
    end
    market = self.market(symbol);
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        throw(NotSupported(string(self.id, " cancelAllOrders() is not supported for spot markets")));
    end
    productGroup = self.getProductGroupFromMarket(market);
    marginMode = safeString(params, "marginMode");
    encodedMarginMode = 1;
    if functions.ccxtruthy(marginMode != nothing)
        params = omit(params, "marginMode");
        if functions.ccxtruthy(marginMode == "isolated")
            encodedMarginMode = 0;
        end
    end
    merged = true;
    (merged, params) = self.handleOptionAndParams(params, "cancelAllOrders", "merged", defaultValue = merged);
    isMergedMode = functions.ccxtruthy(merged) ? 1 : 0;
    request = Dict{Symbol, Any}(
        Symbol("InstrumentID") => get(market, Symbol("id"), nothing),
        Symbol("ProductGroup") => productGroup,
        Symbol("IsCrossMargin") => encodedMarginMode,
        Symbol("IsMergeMode") => isMergedMode
    );
    response = Base.fetch(self.privatePostDeepcoinTradeSwapCancelAll(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseOrders(data, market = market)

end
"""
edit a trade order
see: https://www.deepcoin.com/docs/DeepCoinTrade/replaceOrder
see: https://www.deepcoin.com/docs/DeepCoinTrade/replaceTPSL

# Arguments
- `id`::string: cancel order id
- `symbol`::string, optional: unified symbol of the market to create an order in (not used in deepcoin editOrder)
- `type`::string, optional: 'market' or 'limit' (not used in deepcoin editOrder)
- `side`::string, optional: 'buy' or 'sell' (not used in deepcoin editOrder)
- `amount`::float, optional: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.stopLossPrice`::float, optional: the price that a stop loss order is triggered at
- `params.takeProfitPrice`::float, optional: the price that a take profit order is triggered at

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function editOrder(self::Deepcoin, id, symbol, type_var, side; amount=nothing, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("OrderSysID") => id
    );
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
            throw(NotSupported(string(self.id, " editOrder() is not supported for spot markets")));
        end
        symbol = get(market, Symbol("symbol"), nothing);
    end
    stopLossPrice = self.safeNumber(params, "stopLossPrice");
    takeProfitPrice = self.safeNumber(params, "takeProfitPrice");
    isTPSL = @functions.ccxt_or((stopLossPrice != nothing), (takeProfitPrice != nothing));
    response = nothing;
    if functions.ccxtruthy(isTPSL)
        if functions.ccxtruthy(@functions.ccxt_or((price != nothing), (amount != nothing)))
            throw(BadRequest(string(self.id, " editOrder() with stopLossPrice or takeProfitPrice cannot have price or amount. Either use stopLossPrice/takeProfitPrice or price/amount to edit order.")));
        end
        if functions.ccxtruthy(stopLossPrice != nothing)
            request[Symbol("slTriggerPx")] = functions.ccxtruthy(symbol) ? self.priceToPrecision(symbol, stopLossPrice) : numberToString(stopLossPrice);
        end
        if functions.ccxtruthy(takeProfitPrice != nothing)
            request[Symbol("tpTriggerPx")] = functions.ccxtruthy(symbol) ? self.priceToPrecision(symbol, takeProfitPrice) : numberToString(takeProfitPrice);
        end
        params = omit(params, ["stopLossPrice", "takeProfitPrice"]);
        response = Base.fetch(self.privatePostDeepcoinTradeReplaceOrderSltp(extend(request, params)));
    else
        if functions.ccxtruthy(price != nothing)
            if functions.ccxtruthy(symbol != nothing)
                request[Symbol("price")] = self.priceToPrecision(symbol, price);
            else
                request[Symbol("price")] = numberToString(price);
            end
        end
        if functions.ccxtruthy(amount != nothing)
            if functions.ccxtruthy(symbol != nothing)
                request[Symbol("volume")] = self.amountToPrecision(symbol, amount);
            else
                request[Symbol("volume")] = numberToString(amount);
            end
        end
        response = Base.fetch(self.privatePostDeepcoinTradeReplaceOrder(extend(request, params)));
    end
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(data)

end
"""
cancel multiple orders

# Arguments
- `ids`::array: order ids
- `symbol`::string, optional: unified market symbol, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrders(self::Deepcoin, ids; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
            throw(NotSupported(string(self.id, " cancelOrders() is not supported for spot markets")));
        end
    end
    request = Dict{Symbol, Any}(
        Symbol("OrderSysIDs") => ids
    );
    response = Base.fetch(self.privatePostDeepcoinTradeBatchCancelOrder(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseOrders(data, market = market)

end
function parseOrder(self::Deepcoin, order; market=nothing)
    marketId = safeString(order, "instId");
    market = self.safeMarket(marketId = marketId, market = market);
    timestamp = safeInteger(order, "cTime");
    timestampString = safeString(order, "cTime", "");
    if functions.ccxtruthy(functions.ccxt_lt(length(timestampString), 13))
        timestamp = safeTimestamp(order, "cTime");
    end
    state = safeString(order, "state");
    orderType = safeString(order, "ordType");
    average = safeString(order, "avgPx");
    if functions.ccxtruthy(average == "")
        average = nothing;
    end
    feeCurrencyId = safeString(order, "feeCcy");
    fee = nothing;
    if functions.ccxtruthy(feeCurrencyId != nothing)
        feeCost = safeString(order, "fee");
        fee = Dict{Symbol, Any}(
            Symbol("cost") => self.parseNumber(feeCost),
            Symbol("currency") => self.safeCurrencyCode(feeCurrencyId)
        );
    end
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => safeString(order, "ordId"),
    Symbol("clientOrderId") => safeString(order, "clOrdId"),
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("timestamp") => timestamp,
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("lastUpdateTimestamp") => safeInteger(order, "uTime"),
    Symbol("status") => self.parseOrderStatus(state),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("type") => self.parseOrderType(orderType),
    Symbol("timeInForce") => self.parseOrderTimeInForce(orderType),
    Symbol("side") => safeString(order, "side"),
    Symbol("price") => safeString2(order, "px", "ordPx"),
    Symbol("average") => average,
    Symbol("amount") => safeString(order, "sz"),
    Symbol("filled") => safeString(order, "accFillSz"),
    Symbol("remaining") => nothing,
    Symbol("triggerPrice") => omitZero(safeString(order, "triggerPx")),
    Symbol("takeProfitPrice") => safeString2(order, "tpTriggerPx", "tpTriggerPrice"),
    Symbol("stopLossPrice") => safeString2(order, "slTriggerPx", "slTriggerPrice"),
    Symbol("cost") => nothing,
    Symbol("trades") => nothing,
    Symbol("fee") => fee,
    Symbol("reduceOnly") => nothing,
    Symbol("postOnly") => functions.ccxtruthy(orderType) ? (orderType == "post_only") : nothing,
    Symbol("info") => order
), market = market)

end
function parseOrderStatus(self::Deepcoin, status)
    statuses = Dict{Symbol, Any}(
        Symbol("live") => "open",
        Symbol("filled") => "closed",
        Symbol("canceled") => "canceled",
        Symbol("partially_filled") => "open"
    );
    return safeString(statuses, status, status)

end
function parseOrderType(self::Deepcoin, type_var)
    types = Dict{Symbol, Any}(
        Symbol("limit") => "limit",
        Symbol("market") => "market",
        Symbol("post_only") => "limit",
        Symbol("ioc") => "market",
        Symbol("TPSL") => "market"
    );
    return safeString(types, type_var, type_var)

end
function parseOrderTimeInForce(self::Deepcoin, type_var)
    timeInForces = Dict{Symbol, Any}(
        Symbol("post_only") => "PO",
        Symbol("ioc") => "IOC",
        Symbol("limit") => "GTC",
        Symbol("market") => "GTC"
    );
    return safeString(timeInForces, type_var, type_var)

end
"""
fetch open positions for a single market fetch all open positions for specific symbol
see: https://www.deepcoin.com/docs/DeepCoinAccount/accountPositions

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPositionsForSymbol(self::Deepcoin, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    instrumentType = self.convertToInstrumentType(get(market, Symbol("type"), nothing));
    request = Dict{Symbol, Any}(
        Symbol("instType") => instrumentType,
        Symbol("instId") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateGetDeepcoinAccountPositions(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parsePositions(data, symbols = [get(market, Symbol("symbol"), nothing)])

end
"""
fetch all open positions
see: https://www.deepcoin.com/docs/DeepCoinAccount/accountPositions

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPositions(self::Deepcoin; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols, type_var = nothing, allowEmpty = true, sameTypeOnly = true);
    marketType = "swap";
    market = nothing;
    if functions.ccxtruthy(symbols != nothing)
        firstSymbol = safeString(symbols, 0);
        market = self.market(firstSymbol);
    end
    (marketType, params) = self.handleMarketTypeAndParams("fetchPositions", market = market, params = params, defaultValue = marketType);
    instrumentType = self.convertToInstrumentType(marketType);
    request = Dict{Symbol, Any}(
        Symbol("instType") => instrumentType
    );
    response = Base.fetch(self.privateGetDeepcoinAccountPositions(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parsePositions(data, symbols = symbols)

end
function parsePosition(self::Deepcoin, position; market=nothing)
    marketId = safeString(position, "instId");
    market = self.safeMarket(marketId = marketId, market = market);
    timestamp = safeInteger(position, "cTime");
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("id") => safeString(position, "posId"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("contracts") => safeString(position, "pos"),
    Symbol("contractSize") => nothing,
    Symbol("side") => safeString(position, "posSide"),
    Symbol("notional") => nothing,
    Symbol("leverage") => omitZero(safeString(position, "lever")),
    Symbol("unrealizedPnl") => nothing,
    Symbol("realizedPnl") => nothing,
    Symbol("collateral") => nothing,
    Symbol("entryPrice") => safeString(position, "avgPx"),
    Symbol("markPrice") => nothing,
    Symbol("liquidationPrice") => safeString(position, "liqPx"),
    Symbol("marginMode") => safeString(position, "mgnMode"),
    Symbol("hedged") => true,
    Symbol("maintenanceMargin") => safeString(position, "useMargin"),
    Symbol("maintenanceMarginPercentage") => nothing,
    Symbol("initialMargin") => nothing,
    Symbol("initialMarginPercentage") => nothing,
    Symbol("marginRatio") => nothing,
    Symbol("lastUpdateTimestamp") => safeInteger(position, "uTime"),
    Symbol("lastPrice") => nothing,
    Symbol("stopLossPrice") => nothing,
    Symbol("takeProfitPrice") => nothing,
    Symbol("percentage") => nothing,
    Symbol("info") => position
))

end
"""
set the level of leverage for a market
see: https://www.deepcoin.com/docs/DeepCoinAccount/accountSetLeverage

# Arguments
- `leverage`::float: the rate of leverage
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: 'cross' or 'isolated' (default is cross)
- `params.mrgPosition`::string, optional: 'merge' or 'split', default is merge

# Returns
- response from the exchange
"""
function setLeverage(self::Deepcoin, leverage; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setLeverage() requires a symbol argument")));
    end
    if functions.ccxtruthy(functions.ccxt_lt(leverage, 1))
        throw(BadRequest(string(self.id, " setLeverage() leverage should be minimum 1")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    marginMode = "cross";
    (marginMode, params) = self.handleMarginModeAndParams("setLeverage", params = params, defaultValue = marginMode);
    if functions.ccxtruthy(@functions.ccxt_and((marginMode != "cross"), (marginMode != "isolated")))
        throw(BadRequest(string(self.id, " setLeverage() requires a marginMode parameter that must be either cross or isolated")));
    end
    mrgPosition = "merge";
    (mrgPosition, params) = self.handleOptionAndParams(params, "setLeverage", "mrgPosition", defaultValue = mrgPosition);
    if functions.ccxtruthy(@functions.ccxt_and(mrgPosition != "merge", mrgPosition != "split"))
        throw(BadRequest(string(self.id, " setLeverage() mrgPosition parameter must be either merge or split")));
    end
    request = Dict{Symbol, Any}(
        Symbol("lever") => leverage,
        Symbol("mgnMode") => marginMode,
        Symbol("instId") => get(market, Symbol("id"), nothing),
        Symbol("mrgPosition") => mrgPosition
    );
    response = Base.fetch(self.privatePostDeepcoinAccountSetLeverage(extend(request, params)));
    return response

end
"""
fetch the funding rate for multiple markets
see: https://www.deepcoin.com/docs/DeepCoinTrade/currentFundRate

# Arguments
- `symbols`::any: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.subType`::string, optional: "linear" or "inverse"

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rates-structure}, indexed by market symbols
"""
function fetchFundingRates(self::Deepcoin; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols, type_var = "swap", allowEmpty = true, sameTypeOnly = true, sameSubTypeOnly = true);
    subType = "linear";
    firstMarket = nothing;
    if functions.ccxtruthy(symbols != nothing)
        firstSymbol = safeString(symbols, 0);
        firstMarket = self.market(firstSymbol);
    end
    (subType, params) = self.handleSubTypeAndParams("fetchFundingRates", market = firstMarket, params = params, defaultValue = subType);
    instType = "SwapU";
    if functions.ccxtruthy(subType == "inverse")
        instType = "Swap";
    elseif functions.ccxtruthy(subType != "linear")
        throw(BadRequest(string(self.id, " fetchFundingRates() subType parameter must be either linear or inverse")));
    end
    request = Dict{Symbol, Any}(
        Symbol("instType") => instType
    );
    response = Base.fetch(self.publicGetDeepcoinTradeFundRateCurrentFundingRate(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    rates = self.safeList(data, "current_fund_rates", defaultValue = []);
    return self.parseFundingRates(rates, symbols = symbols)

end
"""
fetch the current funding rate
see: https://www.deepcoin.com/docs/DeepCoinTrade/currentFundRate

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
function fetchFundingRate(self::Deepcoin, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
        throw(ExchangeError(string(self.id, " fetchFundingRate() is only valid for swap markets")));
    end
    request = Dict{Symbol, Any}(
        Symbol("instId") => get(market, Symbol("id"), nothing),
        Symbol("instType") => self.getProductGroupFromMarket(market)
    );
    response = Base.fetch(self.publicGetDeepcoinTradeFundRateCurrentFundingRate(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    rates = self.safeList(data, "current_fund_rates", defaultValue = []);
    entry = self.safeDict(rates, 0, defaultValue = Dict{Symbol, Any}());
    return self.parseFundingRate(entry, market = market)

end
function parseFundingRate(self::Deepcoin, contract; market=nothing)
    marketId = safeString2(contract, "instrumentId", "instrumentID");
    symbol = self.safeSymbol(marketId, market = market);
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => symbol,
    Symbol("markPrice") => nothing,
    Symbol("indexPrice") => nothing,
    Symbol("interestRate") => nothing,
    Symbol("estimatedSettlePrice") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("fundingRate") => self.safeNumber(contract, "fundingRate"),
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
fetches historical funding rate prices
see: https://www.deepcoin.com/docs/DeepCoinTrade/fundingRateHistory

# Arguments
- `symbol`::string: unified symbol of the market to fetch the funding rate history for
- `since`::int, optional: timestamp in ms of the earliest funding rate to fetch
- `limit`::int, optional: the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.page`::int, optional: pagination page number

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
"""
function fetchFundingRateHistory(self::Deepcoin; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchFundingRateHistory() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instId") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("size")] = limit;
    end
    response = Base.fetch(self.publicGetDeepcoinTradeFundRateHistory(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    rows = self.safeList(data, "rows", defaultValue = []);
    return self.parseFundingRateHistories(rows, market = market, since = since, limit = limit)

end
function parseFundingRateHistory(self::Deepcoin, info; market=nothing)
    timestamp = safeTimestamp(info, "CreateTime");
    instrumentID = safeString2(info, "instrumentID", "instrumentId");
    market = self.safeMarket(marketId = instrumentID, market = market, delimiter = nothing, marketType = "swap");
    return Dict{Symbol, Any}(
    Symbol("info") => info,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("fundingRate") => self.safeNumber(info, "rate"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
)

end
"""
fetch all trades made by the user
see: https://www.deepcoin.com/docs/DeepCoinTrade/tradeFills

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest trade to fetch
- `params.type`::string, optional: 'spot' or 'swap', the market type for the trades (default is 'spot')
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchMyTrades(self::Deepcoin; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchMyTrades", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchMyTrades", symbol = symbol, since = since, limit = limit, params = params))
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    marketType = "spot";
    (marketType, params) = self.handleMarketTypeAndParams("fetchMyTrades", market = market, params = params, defaultValue = marketType);
    request = Dict{Symbol, Any}(
        Symbol("instType") => self.convertToInstrumentType(marketType)
    );
    if functions.ccxtruthy(market != nothing)
        request[Symbol("instId")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("begin")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    until = safeInteger(params, "until");
    if functions.ccxtruthy(until != nothing)
        params = omit(params, "until");
        request[Symbol("end")] = until;
    end
    response = Base.fetch(self.privateGetDeepcoinTradeFills(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseTrades(data, market = market, since = since, limit = limit)

end
"""
fetch all the trades made from a single order
see: https://www.deepcoin.com/docs/DeepCoinTrade/tradeFills

# Arguments
- `id`::string: order id
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap', the market type for the trades

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchOrderTrades(self::Deepcoin, id; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    marketType = safeString(params, "type");
    if functions.ccxtruthy(@functions.ccxt_and(symbol == nothing, marketType == nothing))
        throw(ArgumentsRequired(string(self.id, " fetchOrderTrades requires a symbol argument or a market type in the params")));
    end
    params = extend(Dict{Symbol, Any}(
    Symbol("ordId") => id
), params);
    return Base.fetch(self.fetchMyTrades(symbol = symbol, since = since, limit = limit, params = params))

end
"""
closes open positions for a market
see: https://www.deepcoin.com/docs/DeepCoinTrade/batchClosePosition
see: https://www.deepcoin.com/docs/DeepCoinTrade/closePositionByIds

# Arguments
- `symbol`::string: Unified CCXT market symbol
- `side`::string, optional: not used by deepcoin
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.positionId`::any, optional: the id of the position you would like to close
- `params.positionIds`::any, optional: list of position ids to close (for batch closing)

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function closePosition(self::Deepcoin, symbol; side=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    productGroup = self.getProductGroupFromMarket(market);
    positionId = safeString(params, "positionId");
    positionIds = self.safeList(params, "positionIds");
    request = Dict{Symbol, Any}(
        Symbol("instId") => get(market, Symbol("id"), nothing),
        Symbol("productGroup") => productGroup
    );
    response = nothing;
    if functions.ccxtruthy(@functions.ccxt_and(positionId == nothing, positionIds == nothing))
        response = Base.fetch(self.privatePostDeepcoinTradeBatchClosePosition(extend(request, params)));
    else
        if functions.ccxtruthy(positionId != nothing)
            params = omit(params, "positionId");
            request[Symbol("positionIds")] = [positionId];
        end
        response = Base.fetch(self.privatePostDeepcoinTradeClosePositionByIds(extend(request, params)));
    end
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseOrder(data, market = market)

end
function sign(self::Deepcoin, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    requestPath = path;
    if functions.ccxtruthy(method == "GET")
        query = self.urlencode(params);
        if functions.ccxtruthy(length(query))
            requestPath += string("?", query);
        end
    end
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing), "/", requestPath);
    if functions.ccxtruthy(api == "private")
        self.checkRequiredCredentials();
        timestamp = milliseconds();
        dateTime = self.iso8601(timestamp);
        payload = string(dateTime, method, "/", requestPath);
        headers = Dict{Symbol, Any}(
            Symbol("DC-ACCESS-KEY") => self.apiKey,
            Symbol("DC-ACCESS-TIMESTAMP") => dateTime,
            Symbol("DC-ACCESS-PASSPHRASE") => self.password,
            Symbol("appid") => "200103"
        );
        if functions.ccxtruthy(method != "GET")
            body = json(params);
            headers[Symbol("Content-Type")] = "application/json";
            payload += body;
        end
        signature = self.hmac(self.encode(payload), self.encode(self.secret), sha256, "base64");
        headers[Symbol("DC-ACCESS-SIGN")] = signature;
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Deepcoin, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    msg = safeString(response, "msg");
    messageCode = safeString(response, "code");
    sCode = safeString(data, "sCode");
    sMsg = safeString(data, "sMsg");
    errorCode = safeString(data, "errorCode");
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and((msg != nothing), (msg == "")), (sMsg != nothing)))
        msg = sMsg;
    end
    errorList = self.safeList(data, "errorList");
    if functions.ccxtruthy(errorList != nothing)
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(errorList)))
            entry = self.safeDict(errorList, i, defaultValue = Dict{Symbol, Any}());
            errorCode = safeString(entry, "errorCode");
            i += 1
        end

    end
    feedback = string(self.id, " ", body);
    if functions.ccxtruthy(@functions.ccxt_and((sCode == nothing), (errorCode != nothing)))
        sCode = errorCode;
    end
    retCode = safeString(data, "retCode");
    if functions.ccxtruthy(@functions.ccxt_and((sCode == nothing), (retCode != nothing)))
        sCode = retCode;
    end
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or((code != 200), (messageCode != "0")), (@functions.ccxt_and(sCode != nothing, sCode != "0"))))
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), messageCode, feedback);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), sCode, feedback);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), msg, feedback);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), msg, feedback);
        throw(ExchangeError(feedback));
    else
        list = self.safeList(data, "list", defaultValue = []);
        if functions.ccxtruthy(@functions.ccxt_and((ccxt_in("list", data)), (list == nothing)))
            throw(NullResponse(feedback));
        end
    end
    return nothing

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Deepcoin, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetDeepcoinMarketBooks(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/market/books"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetDeepcoinMarketCandles(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/market/candles"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetDeepcoinMarketInstruments(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/market/instruments"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetDeepcoinMarketTickers(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/market/tickers"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetDeepcoinMarketIndexCandles(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/market/index-candles"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetDeepcoinMarketTrades(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/market/trades"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetDeepcoinMarketMarkPriceCandles(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/market/mark-price-candles"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetDeepcoinMarketStepMargin(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/market/step-margin"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetDeepcoinTradeFundingRate(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/trade/funding-rate"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetDeepcoinTradeFundRateCurrentFundingRate(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/trade/fund-rate/current-funding-rate"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetDeepcoinTradeFundRateHistory(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/trade/fund-rate/history"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetDeepcoinAccountBalances(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/account/balances"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetDeepcoinAccountBills(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/account/bills"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetDeepcoinAccountPositions(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/account/positions"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetDeepcoinTradeFills(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/trade/fills"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetDeepcoinTradeOrderByID(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/trade/orderByID"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetDeepcoinTradeFinishOrderByID(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/trade/finishOrderByID"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetDeepcoinTradeOrdersHistory(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/trade/orders-history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetDeepcoinTradeV2OrdersPending(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/trade/v2/orders-pending"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetDeepcoinTradeTriggerOrdersPending(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/trade/trigger-orders-pending"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetDeepcoinTradeTriggerOrdersHistory(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/trade/trigger-orders-history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetDeepcoinCopytradingSupportContracts(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/copytrading/support-contracts"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetDeepcoinCopytradingLeaderPosition(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/copytrading/leader-position"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetDeepcoinCopytradingEstimateProfit(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/copytrading/estimate-profit"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetDeepcoinCopytradingHistoryProfit(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/copytrading/history-profit"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetDeepcoinCopytradingFollowerRank(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/copytrading/follower-rank"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetDeepcoinInternalTransferSupport(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/internal-transfer/support"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetDeepcoinInternalTransferHistoryOrder(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/internal-transfer/history-order"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetDeepcoinRebateConfig(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/rebate/config"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetDeepcoinAgentsUsers(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/agents/users"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetDeepcoinAgentsUsersRebateList(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/agents/users/rebate-list"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetDeepcoinAgentsUsersRebates(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/agents/users/rebates"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetDeepcoinAssetDepositList(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/asset/deposit-list"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetDeepcoinAssetWithdrawList(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/asset/withdraw-list"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetDeepcoinAssetRechargeChainList(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/asset/recharge-chain-list"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetDeepcoinListenkeyAcquire(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/listenkey/acquire"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetDeepcoinListenkeyExtend(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/listenkey/extend"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDeepcoinAccountSetLeverage(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/account/set-leverage"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDeepcoinTradeOrder(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/trade/order"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDeepcoinTradeReplaceOrder(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/trade/replace-order"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDeepcoinTradeCancelOrder(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/trade/cancel-order"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDeepcoinTradeBatchCancelOrder(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/trade/batch-cancel-order"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDeepcoinTradeCancelTriggerOrder(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/trade/cancel-trigger-order"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDeepcoinTradeSwapCancelAll(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/trade/swap/cancel-all"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDeepcoinTradeTriggerOrder(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/trade/trigger-order"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDeepcoinTradeBatchClosePosition(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/trade/batch-close-position"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDeepcoinTradeReplaceOrderSltp(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/trade/replace-order-sltp"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDeepcoinTradeClosePositionByIds(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/trade/close-position-by-ids"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDeepcoinCopytradingLeaderSettings(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/copytrading/leader-settings"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDeepcoinCopytradingSetContracts(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/copytrading/set-contracts"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDeepcoinInternalTransfer(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/internal-transfer"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDeepcoinRebateConfig(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/rebate/config"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDeepcoinAssetTransfer(self::Deepcoin, params=Dict(), context=Dict())
    return request(self, "deepcoin/asset/transfer"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function Deepcoin(; kwargs...)
    inst = Deepcoin(Exchange(), describe, handleMarketTypeAndParams, convertToInstrumentType, fetchMarkets, fetchMarketsByType, parseMarket, setMarkets, fetchOrderBook, fetchOHLCV, fetchTickers, parseTicker, fetchTrades, getProductGroupFromMarket, parseTrade, parseTakerOrMaker, fetchBalance, parseBalance, fetchDeposits, fetchWithdrawals, parseTransaction, parseTransactionStatus, fetchDepositAddresses, fetchDepositAddress, parseDepositAddress, fetchLedger, parseLedgerEntry, parseLedgerEntryType, transfer, parseTransfer, parseTransferStatus, createOrder, createOrderRequest, createRegularOrderRequest, createTriggerOrderRequest, handleTypePostOnlyAndTimeInForce, createMarketOrderWithCost, createMarketBuyOrderWithCost, createMarketSellOrderWithCost, fetchClosedOrder, fetchOpenOrder, fetchCanceledAndClosedOrders, fetchCanceledOrders, fetchClosedOrders, fetchOpenOrders, cancelOrder, cancelAllOrders, editOrder, cancelOrders, parseOrder, parseOrderStatus, parseOrderType, parseOrderTimeInForce, fetchPositionsForSymbol, fetchPositions, parsePosition, setLeverage, fetchFundingRates, fetchFundingRate, parseFundingRate, fetchFundingRateHistory, parseFundingRateHistory, fetchMyTrades, fetchOrderTrades, closePosition, sign, handleErrors, publicGetDeepcoinMarketBooks, publicGetDeepcoinMarketCandles, publicGetDeepcoinMarketInstruments, publicGetDeepcoinMarketTickers, publicGetDeepcoinMarketIndexCandles, publicGetDeepcoinMarketTrades, publicGetDeepcoinMarketMarkPriceCandles, publicGetDeepcoinMarketStepMargin, publicGetDeepcoinTradeFundingRate, publicGetDeepcoinTradeFundRateCurrentFundingRate, publicGetDeepcoinTradeFundRateHistory, privateGetDeepcoinAccountBalances, privateGetDeepcoinAccountBills, privateGetDeepcoinAccountPositions, privateGetDeepcoinTradeFills, privateGetDeepcoinTradeOrderByID, privateGetDeepcoinTradeFinishOrderByID, privateGetDeepcoinTradeOrdersHistory, privateGetDeepcoinTradeV2OrdersPending, privateGetDeepcoinTradeTriggerOrdersPending, privateGetDeepcoinTradeTriggerOrdersHistory, privateGetDeepcoinCopytradingSupportContracts, privateGetDeepcoinCopytradingLeaderPosition, privateGetDeepcoinCopytradingEstimateProfit, privateGetDeepcoinCopytradingHistoryProfit, privateGetDeepcoinCopytradingFollowerRank, privateGetDeepcoinInternalTransferSupport, privateGetDeepcoinInternalTransferHistoryOrder, privateGetDeepcoinRebateConfig, privateGetDeepcoinAgentsUsers, privateGetDeepcoinAgentsUsersRebateList, privateGetDeepcoinAgentsUsersRebates, privateGetDeepcoinAssetDepositList, privateGetDeepcoinAssetWithdrawList, privateGetDeepcoinAssetRechargeChainList, privateGetDeepcoinListenkeyAcquire, privateGetDeepcoinListenkeyExtend, privatePostDeepcoinAccountSetLeverage, privatePostDeepcoinTradeOrder, privatePostDeepcoinTradeReplaceOrder, privatePostDeepcoinTradeCancelOrder, privatePostDeepcoinTradeBatchCancelOrder, privatePostDeepcoinTradeCancelTriggerOrder, privatePostDeepcoinTradeSwapCancelAll, privatePostDeepcoinTradeTriggerOrder, privatePostDeepcoinTradeBatchClosePosition, privatePostDeepcoinTradeReplaceOrderSltp, privatePostDeepcoinTradeClosePositionByIds, privatePostDeepcoinCopytradingLeaderSettings, privatePostDeepcoinCopytradingSetContracts, privatePostDeepcoinInternalTransfer, privatePostDeepcoinRebateConfig, privatePostDeepcoinAssetTransfer)
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
function __ccxt_doc_Deepcoin_fetchMarkets() end
"""
retrieves data on all markets for okcoin
see: https://www.deepcoin.com/docs/DeepCoinMarket/getBaseInfo

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Deepcoin_fetchMarkets

function __ccxt_doc_Deepcoin_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://www.deepcoin.com/docs/DeepCoinMarket/marketBooks

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Deepcoin_fetchOrderBook

function __ccxt_doc_Deepcoin_fetchOHLCV() end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://www.deepcoin.com/docs/DeepCoinMarket/getKlineData
see: https://www.deepcoin.com/docs/DeepCoinMarket/getIndexKlineData
see: https://www.deepcoin.com/docs/DeepCoinMarket/getMarkKlineData

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest candle to fetch
- `params.price`::string, optional: "mark" or "index" for mark price and index price candles
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Deepcoin_fetchOHLCV

function __ccxt_doc_Deepcoin_fetchTickers() end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://www.deepcoin.com/docs/DeepCoinMarket/getMarketTickers

# Arguments
- `symbols`::array, optional: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Deepcoin_fetchTickers

function __ccxt_doc_Deepcoin_fetchTrades() end
"""
get the list of most recent trades for a particular symbol
see: https://www.deepcoin.com/docs/DeepCoinMarket/getTrades

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch (default 100, max 500)
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
__ccxt_doc_Deepcoin_fetchTrades

function __ccxt_doc_Deepcoin_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://www.deepcoin.com/docs/DeepCoinAccount/getAccountBalance

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: "spot" or "swap", the market type for the balance

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Deepcoin_fetchBalance

function __ccxt_doc_Deepcoin_fetchDeposits() end
"""
fetch all deposits made to an account
see: https://www.deepcoin.com/docs/assets/deposit

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Deepcoin_fetchDeposits

function __ccxt_doc_Deepcoin_fetchWithdrawals() end
"""
fetch all withdrawals made from an account
see: https://www.deepcoin.com/docs/assets/withdraw

# Arguments
- `code`::string: unified currency code of the currency transferred
- `since`::int, optional: the earliest time in ms to fetch transfers for (default 24 hours ago)
- `limit`::int, optional: the maximum number of transfer structures to retrieve (default 50, max 200)
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch transfers for (default time now)
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Deepcoin_fetchWithdrawals

function __ccxt_doc_Deepcoin_fetchDepositAddresses() end
"""
fetch deposit addresses for multiple currencies and chain types
see: https://www.deepcoin.com/docs/assets/chainlist

# Arguments
- `codes`::any: list of unified currency codes, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [address structures]{@link https://docs.ccxt.com/?id=address-structure}
"""
__ccxt_doc_Deepcoin_fetchDepositAddresses

function __ccxt_doc_Deepcoin_fetchDepositAddress() end
"""
fetch the deposit address for a currency associated with this account
see: https://www.deepcoin.com/docs/assets/chainlist

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.network`::string, optional: unified network code for deposit chain

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
__ccxt_doc_Deepcoin_fetchDepositAddress

function __ccxt_doc_Deepcoin_fetchLedger() end
"""
fetch the history of changes, actions done by the user or operations that altered the balance of the user
see: https://www.deepcoin.com/docs/DeepCoinAccount/getAccountBills

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: timestamp in ms of the earliest ledger entry
- `limit`::int, optional: max number of ledger entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest ledger entry
- `params.type`::string, optional: 'spot' or 'swap', the market type for the ledger (default 'spot')

# Returns
- a list of [ledger structures]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
"""
__ccxt_doc_Deepcoin_fetchLedger

function __ccxt_doc_Deepcoin_transfer() end
"""
transfer currency internally between wallets on the same account
see: https://www.deepcoin.com/docs/assets/transfer

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: account to transfer from ('spot', 'inverse', 'linear', 'fund', 'rebate' or 'demo')
- `toAccount`::string: account to transfer to ('spot', 'inverse', 'linear', 'fund', 'rebate' or 'demo')
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.userId`::string, optional: user id

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
__ccxt_doc_Deepcoin_transfer

function __ccxt_doc_Deepcoin_createOrder() end
"""
create a trade order
see: https://www.deepcoin.com/docs/DeepCoinTrade/order
see: https://www.deepcoin.com/docs/DeepCoinTrade/triggerOrder

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: a unique id for the order
- `params.timeInForce`::string, optional: *non trigger orders only* 'GTC' (Good Till Cancel), 'IOC' (Immediate Or Cancel) or 'PO' (Post Only)
- `params.postOnly`::bool, optional: *non trigger orders only* true to place a post only order
- `params.reduceOnly`::bool, optional: *non trigger orders only* a mark to reduce the position size for margin, swap and future orders
- `params.triggerPrice`::float, optional: the price a trigger order is triggered at
- `params.stopLoss.triggerPrice`::float, optional: the price that a stop loss order is triggered at
- `params.takeProfit.triggerPrice`::float, optional: the price that a take profit order is triggered at
- `params.positionSide`::string, optional: if position mode is one-way: set to 'net', if position mode is hedge-mode: set to 'long' or 'short'
- `params.hedged`::bool, optional: *swap only* true for hedged mode, false for one way mode
- `params.marginMode`::string, optional: *swap only*'cross' or 'isolated', the default is 'cash' for spot and 'cross' for swap

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Deepcoin_createOrder

function __ccxt_doc_Deepcoin_createMarketOrderWithCost() end
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
__ccxt_doc_Deepcoin_createMarketOrderWithCost

function __ccxt_doc_Deepcoin_createMarketBuyOrderWithCost() end
"""
create a market buy order by providing the symbol and cost

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Deepcoin_createMarketBuyOrderWithCost

function __ccxt_doc_Deepcoin_createMarketSellOrderWithCost() end
"""
create a market sell order by providing the symbol and cost

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Deepcoin_createMarketSellOrderWithCost

function __ccxt_doc_Deepcoin_fetchClosedOrder() end
"""
fetches information on a closed order made by the user
see: https://www.deepcoin.com/docs/DeepCoinTrade/finishOrderByID

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Deepcoin_fetchClosedOrder

function __ccxt_doc_Deepcoin_fetchOpenOrder() end
"""
fetch an open order by it's id
see: https://www.deepcoin.com/docs/DeepCoinTrade/orderByID

# Arguments
- `id`::string: order id
- `symbol`::string: unified market symbol, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Deepcoin_fetchOpenOrder

function __ccxt_doc_Deepcoin_fetchCanceledAndClosedOrders() end
"""
fetches information on multiple canceled and closed orders made by the user
see: https://www.deepcoin.com/docs/DeepCoinTrade/ordersHistory
see: https://www.deepcoin.com/docs/DeepCoinTrade/triggerOrdersHistory

# Arguments
- `symbol`::string, optional: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: whether to fetch trigger/algo orders (default false)
- `params.type`::string, optional: *non trigger orders only* 'spot' or 'swap', the market type for the orders
- `params.state`::string, optional: *non trigger orders only* 'canceled' or 'filled', the order state to filter by
- `params.OrderType`::string, optional: *trigger orders only* 'limit' or 'market'
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Deepcoin_fetchCanceledAndClosedOrders

function __ccxt_doc_Deepcoin_fetchCanceledOrders() end
"""
fetches information on multiple canceled orders made by the user
see: https://www.deepcoin.com/docs/DeepCoinTrade/ordersHistory

# Arguments
- `symbol`::string: unified market symbol of the market the orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap', the market type for the orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Deepcoin_fetchCanceledOrders

function __ccxt_doc_Deepcoin_fetchClosedOrders() end
"""
fetches information on multiple closed orders made by the user
see: https://www.deepcoin.com/docs/DeepCoinTrade/ordersHistory

# Arguments
- `symbol`::string: unified market symbol of the market the orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap', the market type for the orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Deepcoin_fetchClosedOrders

function __ccxt_doc_Deepcoin_fetchOpenOrders() end
"""
fetch all unfilled currently open orders
see: https://www.deepcoin.com/docs/DeepCoinTrade/ordersPendingV2
see: https://www.deepcoin.com/docs/DeepCoinTrade/triggerOrdersPending

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: whether to fetch trigger/algo orders (default false)
- `params.index`::int, optional: *non trigger orders only* pagination index, default is 1
- `params.orderType`::string, optional: *trigger orders only* 'limit' or 'market'

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Deepcoin_fetchOpenOrders

function __ccxt_doc_Deepcoin_cancelOrder() end
"""
cancels an open order
see: https://www.deepcoin.com/docs/DeepCoinTrade/cancelOrder

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: whether the order is a trigger/algo order (default false)

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Deepcoin_cancelOrder

function __ccxt_doc_Deepcoin_cancelAllOrders() end
"""
cancel all open orders in a market
see: https://www.deepcoin.com/docs/DeepCoinTrade/cancelAllOrder

# Arguments
- `symbol`::string: unified market symbol of the market to cancel orders in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: *swap only* 'cross' or 'isolated', the default is 'cash' for spot and 'cross' for swap
- `params.merged`::bool, optional: *swap only* true for merged positions, false for split positions (default true)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Deepcoin_cancelAllOrders

function __ccxt_doc_Deepcoin_editOrder() end
"""
edit a trade order
see: https://www.deepcoin.com/docs/DeepCoinTrade/replaceOrder
see: https://www.deepcoin.com/docs/DeepCoinTrade/replaceTPSL

# Arguments
- `id`::string: cancel order id
- `symbol`::string, optional: unified symbol of the market to create an order in (not used in deepcoin editOrder)
- `type`::string, optional: 'market' or 'limit' (not used in deepcoin editOrder)
- `side`::string, optional: 'buy' or 'sell' (not used in deepcoin editOrder)
- `amount`::float, optional: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.stopLossPrice`::float, optional: the price that a stop loss order is triggered at
- `params.takeProfitPrice`::float, optional: the price that a take profit order is triggered at

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Deepcoin_editOrder

function __ccxt_doc_Deepcoin_cancelOrders() end
"""
cancel multiple orders

# Arguments
- `ids`::array: order ids
- `symbol`::string, optional: unified market symbol, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Deepcoin_cancelOrders

function __ccxt_doc_Deepcoin_fetchPositionsForSymbol() end
"""
fetch open positions for a single market fetch all open positions for specific symbol
see: https://www.deepcoin.com/docs/DeepCoinAccount/accountPositions

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Deepcoin_fetchPositionsForSymbol

function __ccxt_doc_Deepcoin_fetchPositions() end
"""
fetch all open positions
see: https://www.deepcoin.com/docs/DeepCoinAccount/accountPositions

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Deepcoin_fetchPositions

function __ccxt_doc_Deepcoin_setLeverage() end
"""
set the level of leverage for a market
see: https://www.deepcoin.com/docs/DeepCoinAccount/accountSetLeverage

# Arguments
- `leverage`::float: the rate of leverage
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: 'cross' or 'isolated' (default is cross)
- `params.mrgPosition`::string, optional: 'merge' or 'split', default is merge

# Returns
- response from the exchange
"""
__ccxt_doc_Deepcoin_setLeverage

function __ccxt_doc_Deepcoin_fetchFundingRates() end
"""
fetch the funding rate for multiple markets
see: https://www.deepcoin.com/docs/DeepCoinTrade/currentFundRate

# Arguments
- `symbols`::any: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.subType`::string, optional: "linear" or "inverse"

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rates-structure}, indexed by market symbols
"""
__ccxt_doc_Deepcoin_fetchFundingRates

function __ccxt_doc_Deepcoin_fetchFundingRate() end
"""
fetch the current funding rate
see: https://www.deepcoin.com/docs/DeepCoinTrade/currentFundRate

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
__ccxt_doc_Deepcoin_fetchFundingRate

function __ccxt_doc_Deepcoin_fetchFundingRateHistory() end
"""
fetches historical funding rate prices
see: https://www.deepcoin.com/docs/DeepCoinTrade/fundingRateHistory

# Arguments
- `symbol`::string: unified symbol of the market to fetch the funding rate history for
- `since`::int, optional: timestamp in ms of the earliest funding rate to fetch
- `limit`::int, optional: the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.page`::int, optional: pagination page number

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
"""
__ccxt_doc_Deepcoin_fetchFundingRateHistory

function __ccxt_doc_Deepcoin_fetchMyTrades() end
"""
fetch all trades made by the user
see: https://www.deepcoin.com/docs/DeepCoinTrade/tradeFills

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest trade to fetch
- `params.type`::string, optional: 'spot' or 'swap', the market type for the trades (default is 'spot')
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Deepcoin_fetchMyTrades

function __ccxt_doc_Deepcoin_fetchOrderTrades() end
"""
fetch all the trades made from a single order
see: https://www.deepcoin.com/docs/DeepCoinTrade/tradeFills

# Arguments
- `id`::string: order id
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap', the market type for the trades

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Deepcoin_fetchOrderTrades

function __ccxt_doc_Deepcoin_closePosition() end
"""
closes open positions for a market
see: https://www.deepcoin.com/docs/DeepCoinTrade/batchClosePosition
see: https://www.deepcoin.com/docs/DeepCoinTrade/closePositionByIds

# Arguments
- `symbol`::string: Unified CCXT market symbol
- `side`::string, optional: not used by deepcoin
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.positionId`::any, optional: the id of the position you would like to close
- `params.positionIds`::any, optional: list of position ids to close (for batch closing)

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Deepcoin_closePosition
