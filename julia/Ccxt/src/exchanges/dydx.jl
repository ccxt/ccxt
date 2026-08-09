@kwdef mutable struct Dydx <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchTime::Function = fetchTime
    parseMarket::Function = parseMarket
    fetchMarkets::Function = fetchMarkets
    parseTrade::Function = parseTrade
    fetchTrades::Function = fetchTrades
    parseOHLCV::Function = parseOHLCV
    fetchOHLCV::Function = fetchOHLCV
    fetchFundingRateHistory::Function = fetchFundingRateHistory
    handlePublicAddress::Function = handlePublicAddress
    parseOrder::Function = parseOrder
    parseOrderStatus::Function = parseOrderStatus
    parseOrderType::Function = parseOrderType
    fetchOrder::Function = fetchOrder
    fetchOrders::Function = fetchOrders
    fetchOpenOrders::Function = fetchOpenOrders
    fetchClosedOrders::Function = fetchClosedOrders
    parsePosition::Function = parsePosition
    fetchPosition::Function = fetchPosition
    fetchPositions::Function = fetchPositions
    hashMessage::Function = hashMessage
    signHash::Function = signHash
    signMessage::Function = signMessage
    signOnboardingAction::Function = signOnboardingAction
    signDydxTx::Function = signDydxTx
    retrieveCredentials::Function = retrieveCredentials
    fetchDydxAccount::Function = fetchDydxAccount
    pow::Function = pow
    createOrderRequest::Function = createOrderRequest
    createOrderIdFromParts::Function = createOrderIdFromParts
    fetchLatestBlockHeight::Function = fetchLatestBlockHeight
    createOrder::Function = createOrder
    cancelOrder::Function = cancelOrder
    cancelOrders::Function = cancelOrders
    fetchOrderBook::Function = fetchOrderBook
    parseLedgerEntry::Function = parseLedgerEntry
    parseLedgerEntryType::Function = parseLedgerEntryType
    fetchLedger::Function = fetchLedger
    estimateTxFee::Function = estimateTxFee
    transfer::Function = transfer
    parseTransfer::Function = parseTransfer
    fetchTransfers::Function = fetchTransfers
    parseTransaction::Function = parseTransaction
    withdraw::Function = withdraw
    fetchWithdrawals::Function = fetchWithdrawals
    fetchDeposits::Function = fetchDeposits
    fetchDepositsWithdrawals::Function = fetchDepositsWithdrawals
    fetchTransactionsHelper::Function = fetchTransactionsHelper
    fetchAccounts::Function = fetchAccounts
    fetchBalance::Function = fetchBalance
    parseBalance::Function = parseBalance
    nonce::Function = nonce
    getWalletAddress::Function = getWalletAddress
    sign::Function = sign
    handleErrors::Function = handleErrors
    setSandboxMode::Function = setSandboxMode

# Generated REST endpoint fields
    indexerGetAddressesAddress::Function = indexerGetAddressesAddress
    indexerGetAddressesAddressParentSubaccountNumberNumber::Function = indexerGetAddressesAddressParentSubaccountNumberNumber
    indexerGetAddressesAddressSubaccountNumberSubaccountNumber::Function = indexerGetAddressesAddressSubaccountNumberSubaccountNumber
    indexerGetAssetPositions::Function = indexerGetAssetPositions
    indexerGetAssetPositionsParentSubaccountNumber::Function = indexerGetAssetPositionsParentSubaccountNumber
    indexerGetCandlesPerpetualMarketsMarket::Function = indexerGetCandlesPerpetualMarketsMarket
    indexerGetComplianceScreenAddress::Function = indexerGetComplianceScreenAddress
    indexerGetFills::Function = indexerGetFills
    indexerGetFillsParentSubaccountNumber::Function = indexerGetFillsParentSubaccountNumber
    indexerGetFundingPayments::Function = indexerGetFundingPayments
    indexerGetFundingPaymentsParentSubaccount::Function = indexerGetFundingPaymentsParentSubaccount
    indexerGetHeight::Function = indexerGetHeight
    indexerGetHistoricalPnl::Function = indexerGetHistoricalPnl
    indexerGetHistoricalPnlParentSubaccountNumber::Function = indexerGetHistoricalPnlParentSubaccountNumber
    indexerGetHistoricalBlockTradingRewardsAddress::Function = indexerGetHistoricalBlockTradingRewardsAddress
    indexerGetHistoricalFundingMarket::Function = indexerGetHistoricalFundingMarket
    indexerGetHistoricalTradingRewardAggregationsAddress::Function = indexerGetHistoricalTradingRewardAggregationsAddress
    indexerGetOrderbooksPerpetualMarketMarket::Function = indexerGetOrderbooksPerpetualMarketMarket
    indexerGetOrders::Function = indexerGetOrders
    indexerGetOrdersParentSubaccountNumber::Function = indexerGetOrdersParentSubaccountNumber
    indexerGetOrdersOrderId::Function = indexerGetOrdersOrderId
    indexerGetPerpetualMarkets::Function = indexerGetPerpetualMarkets
    indexerGetPerpetualPositions::Function = indexerGetPerpetualPositions
    indexerGetPerpetualPositionsParentSubaccountNumber::Function = indexerGetPerpetualPositionsParentSubaccountNumber
    indexerGetScreen::Function = indexerGetScreen
    indexerGetSparklines::Function = indexerGetSparklines
    indexerGetTime::Function = indexerGetTime
    indexerGetTradesPerpetualMarketMarket::Function = indexerGetTradesPerpetualMarketMarket
    indexerGetTransfers::Function = indexerGetTransfers
    indexerGetTransfersBetween::Function = indexerGetTransfersBetween
    indexerGetTransfersParentSubaccountNumber::Function = indexerGetTransfersParentSubaccountNumber
    indexerGetVaultV1MegavaultHistoricalPnl::Function = indexerGetVaultV1MegavaultHistoricalPnl
    indexerGetVaultV1MegavaultPositions::Function = indexerGetVaultV1MegavaultPositions
    indexerGetVaultV1VaultsHistoricalPnl::Function = indexerGetVaultV1VaultsHistoricalPnl
    indexerGetPerpetualMarketSparklines::Function = indexerGetPerpetualMarketSparklines
    indexerGetPerpetualMarketsTicker::Function = indexerGetPerpetualMarketsTicker
    indexerGetPerpetualMarketsTickerOrderbook::Function = indexerGetPerpetualMarketsTickerOrderbook
    indexerGetTradesPerpetualMarketTicker::Function = indexerGetTradesPerpetualMarketTicker
    indexerGetHistoricalFundingTicker::Function = indexerGetHistoricalFundingTicker
    indexerGetCandlesTickerResolution::Function = indexerGetCandlesTickerResolution
    indexerGetAddressesAddressSubaccounts::Function = indexerGetAddressesAddressSubaccounts
    indexerGetAddressesAddressSubaccountNumberSubaccountNumberAssetPositions::Function = indexerGetAddressesAddressSubaccountNumberSubaccountNumberAssetPositions
    indexerGetAddressesAddressSubaccountNumberSubaccountNumberPerpetualPositions::Function = indexerGetAddressesAddressSubaccountNumberSubaccountNumberPerpetualPositions
    indexerGetAddressesAddressSubaccountNumberSubaccountNumberOrders::Function = indexerGetAddressesAddressSubaccountNumberSubaccountNumberOrders
    indexerGetFillsParentSubaccount::Function = indexerGetFillsParentSubaccount
    indexerGetHistoricalPnlParentSubaccount::Function = indexerGetHistoricalPnlParentSubaccount
    nodeRpcGetAbciInfo::Function = nodeRpcGetAbciInfo
    nodeRpcGetBlock::Function = nodeRpcGetBlock
    nodeRpcGetBroadcastTxAsync::Function = nodeRpcGetBroadcastTxAsync
    nodeRpcGetBroadcastTxSync::Function = nodeRpcGetBroadcastTxSync
    nodeRpcGetTx::Function = nodeRpcGetTx
    nodeRestGetCosmosAuthV1beta1AccountInfoDydxAddress::Function = nodeRestGetCosmosAuthV1beta1AccountInfoDydxAddress
    nodeRestPostCosmosTxV1beta1Encode::Function = nodeRestPostCosmosTxV1beta1Encode
    nodeRestPostCosmosTxV1beta1Simulate::Function = nodeRestPostCosmosTxV1beta1Simulate

end
function describe(self::Dydx, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "dydx",
    Symbol("name") => "dYdX",
    Symbol("countries") => ["US"],
    Symbol("rateLimit") => 100,
    Symbol("version") => "v4",
    Symbol("certified") => false,
    Symbol("dex") => true,
    Symbol("pro") => true,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => false,
        Symbol("margin") => false,
        Symbol("swap") => true,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("addMargin") => false,
        Symbol("cancelAllOrders") => false,
        Symbol("cancelAllOrdersAfter") => false,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => true,
        Symbol("cancelWithdraw") => false,
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => false,
        Symbol("createConvertTrade") => false,
        Symbol("createDepositAddress") => false,
        Symbol("createMarketBuyOrderWithCost") => false,
        Symbol("createMarketOrder") => false,
        Symbol("createMarketOrderWithCost") => false,
        Symbol("createMarketSellOrderWithCost") => false,
        Symbol("createOrder") => true,
        Symbol("createOrderWithTakeProfitAndStopLoss") => false,
        Symbol("createReduceOnlyOrder") => false,
        Symbol("createStopLimitOrder") => false,
        Symbol("createStopLossOrder") => false,
        Symbol("createStopMarketOrder") => false,
        Symbol("createStopOrder") => false,
        Symbol("createTakeProfitOrder") => false,
        Symbol("createTrailingAmountOrder") => false,
        Symbol("createTrailingPercentOrder") => false,
        Symbol("createTriggerOrder") => false,
        Symbol("fetchAccounts") => true,
        Symbol("fetchBalance") => true,
        Symbol("fetchCanceledOrders") => false,
        Symbol("fetchClosedOrder") => false,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchConvertCurrencies") => false,
        Symbol("fetchConvertQuote") => false,
        Symbol("fetchConvertTrade") => false,
        Symbol("fetchConvertTradeHistory") => false,
        Symbol("fetchCurrencies") => false,
        Symbol("fetchDepositAddress") => false,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => false,
        Symbol("fetchDeposits") => true,
        Symbol("fetchDepositsWithdrawals") => true,
        Symbol("fetchFundingHistory") => false,
        Symbol("fetchFundingInterval") => false,
        Symbol("fetchFundingIntervals") => false,
        Symbol("fetchFundingRate") => false,
        Symbol("fetchFundingRateHistory") => true,
        Symbol("fetchFundingRates") => false,
        Symbol("fetchIndexOHLCV") => false,
        Symbol("fetchLedger") => true,
        Symbol("fetchLeverage") => false,
        Symbol("fetchMarginAdjustmentHistory") => false,
        Symbol("fetchMarginMode") => false,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => false,
        Symbol("fetchMyTrades") => false,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterestHistory") => false,
        Symbol("fetchOpenOrder") => false,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrders") => true,
        Symbol("fetchOrderTrades") => false,
        Symbol("fetchPosition") => true,
        Symbol("fetchPositionHistory") => false,
        Symbol("fetchPositionMode") => false,
        Symbol("fetchPositions") => true,
        Symbol("fetchPositionsHistory") => false,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchStatus") => false,
        Symbol("fetchTicker") => false,
        Symbol("fetchTickers") => false,
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => false,
        Symbol("fetchTradingFees") => false,
        Symbol("fetchTransactions") => false,
        Symbol("fetchTransfers") => true,
        Symbol("fetchWithdrawals") => true,
        Symbol("reduceMargin") => false,
        Symbol("sandbox") => false,
        Symbol("setLeverage") => false,
        Symbol("setMargin") => false,
        Symbol("setPositionMode") => false,
        Symbol("transfer") => true,
        Symbol("withdraw") => true
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "1MIN",
        Symbol("5m") => "5MINS",
        Symbol("15m") => "15MINS",
        Symbol("30m") => "30MINS",
        Symbol("1h") => "1HOUR",
        Symbol("4h") => "4HOURS",
        Symbol("1d") => "1DAY"
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/def0a54a-020a-4286-ba95-0f84e50a944d",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("indexer") => "https://indexer.dydx.trade/v4",
            Symbol("nodeRpc") => "https://dydx-ops-rpc.kingnodes.com",
            Symbol("nodeRest") => "https://dydx-rest.publicnode.com"
        ),
        Symbol("test") => Dict{Symbol, Any}(
            Symbol("indexer") => "https://indexer.v4testnet.dydx.exchange/v4",
            Symbol("nodeRpc") => "https://test-dydx-rpc.kingnodes.com",
            Symbol("nodeRest") => "https://test-dydx-rest.kingnodes.com"
        ),
        Symbol("www") => "https://www.dydx.xyz",
        Symbol("doc") => ["https://docs.dydx.xyz"],
        Symbol("fees") => ["https://docs.dydx.exchange/introduction-trading_fees"],
        Symbol("referral") => "https://dydx.trade?ref=ccxt"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("indexer") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("addresses/{address}") => 1,
                Symbol("addresses/{address}/parentSubaccountNumber/{number}") => 1,
                Symbol("addresses/{address}/subaccountNumber/{subaccountNumber}") => 1,
                Symbol("assetPositions") => 1,
                Symbol("assetPositions/parentSubaccountNumber") => 1,
                Symbol("candles/perpetualMarkets/{market}") => 1,
                Symbol("compliance/screen/{address}") => 1,
                Symbol("fills") => 1,
                Symbol("fills/parentSubaccountNumber") => 1,
                Symbol("fundingPayments") => 1,
                Symbol("fundingPayments/parentSubaccount") => 1,
                Symbol("height") => 0.1,
                Symbol("historical-pnl") => 1,
                Symbol("historical-pnl/parentSubaccountNumber") => 1,
                Symbol("historicalBlockTradingRewards/{address}") => 1,
                Symbol("historicalFunding/{market}") => 1,
                Symbol("historicalTradingRewardAggregations/{address}") => 1,
                Symbol("orderbooks/perpetualMarket/{market}") => 1,
                Symbol("orders") => 1,
                Symbol("orders/parentSubaccountNumber") => 1,
                Symbol("orders/{orderId}") => 1,
                Symbol("perpetualMarkets") => 1,
                Symbol("perpetualPositions") => 1,
                Symbol("perpetualPositions/parentSubaccountNumber") => 1,
                Symbol("screen") => 1,
                Symbol("sparklines") => 1,
                Symbol("time") => 1,
                Symbol("trades/perpetualMarket/{market}") => 1,
                Symbol("transfers") => 1,
                Symbol("transfers/between") => 1,
                Symbol("transfers/parentSubaccountNumber") => 1,
                Symbol("vault/v1/megavault/historicalPnl") => 1,
                Symbol("vault/v1/megavault/positions") => 1,
                Symbol("vault/v1/vaults/historicalPnl") => 1,
                Symbol("perpetualMarketSparklines") => 1,
                Symbol("perpetualMarkets/{ticker}") => 1,
                Symbol("perpetualMarkets/{ticker}/orderbook") => 1,
                Symbol("trades/perpetualMarket/{ticker}") => 1,
                Symbol("historicalFunding/{ticker}") => 1,
                Symbol("candles/{ticker}/{resolution}") => 1,
                Symbol("addresses/{address}/subaccounts") => 1,
                Symbol("addresses/{address}/subaccountNumber/{subaccountNumber}/assetPositions") => 1,
                Symbol("addresses/{address}/subaccountNumber/{subaccountNumber}/perpetualPositions") => 1,
                Symbol("addresses/{address}/subaccountNumber/{subaccountNumber}/orders") => 1,
                Symbol("fills/parentSubaccount") => 1,
                Symbol("historical-pnl/parentSubaccount") => 1
            )
        ),
        Symbol("nodeRpc") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("abci_info") => 1,
                Symbol("block") => 1,
                Symbol("broadcast_tx_async") => 1,
                Symbol("broadcast_tx_sync") => 1,
                Symbol("tx") => 1
            )
        ),
        Symbol("nodeRest") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("cosmos/auth/v1beta1/account_info/{dydxAddress}") => 1
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("cosmos/tx/v1beta1/encode") => 1,
                Symbol("cosmos/tx/v1beta1/simulate") => 1
            )
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("tierBased") => true,
            Symbol("percentage") => true,
            Symbol("maker") => self.parseNumber("0.0001"),
            Symbol("taker") => self.parseNumber("0.0005")
        )
    ),
    Symbol("requiredCredentials") => Dict{Symbol, Any}(
        Symbol("apiKey") => false,
        Symbol("secret") => false,
        Symbol("privateKey") => false
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("privateKey") => nothing,
        Symbol("chainName") => "dydx-mainnet-1",
        Symbol("chainId") => 1,
        Symbol("sandboxMode") => false,
        Symbol("defaultFeeDenom") => "uusdc",
        Symbol("defaultFeeMultiplier") => "1.6",
        Symbol("feeDenom") => Dict{Symbol, Any}(
            Symbol("USDC_DENOM") => "ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5",
            Symbol("USDC_GAS_DENOM") => "uusdc",
            Symbol("USDC_DECIMALS") => 6,
            Symbol("USDC_GAS_PRICE") => "0.025",
            Symbol("CHAINTOKEN_DENOM") => "adydx",
            Symbol("CHAINTOKEN_DECIMALS") => 18,
            Symbol("CHAINTOKEN_GAS_PRICE") => "25000000000"
        )
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("default") => Dict{Symbol, Any}(
            Symbol("sandbox") => true,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("triggerPrice") => true,
                Symbol("triggerPriceType") => Dict{Symbol, Any}(
                    Symbol("last") => true,
                    Symbol("mark") => true,
                    Symbol("index") => false
                ),
                Symbol("triggerDirection") => false,
                Symbol("stopLossPrice") => false,
                Symbol("takeProfitPrice") => false,
                Symbol("attachedStopLossTakeProfit") => nothing,
                Symbol("timeInForce") => Dict{Symbol, Any}(
                    Symbol("IOC") => true,
                    Symbol("FOK") => true,
                    Symbol("PO") => true,
                    Symbol("GTD") => true
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
                Symbol("limit") => 500,
                Symbol("daysBack") => 90,
                Symbol("untilDays") => 10000,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("trigger") => true,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 500,
                Symbol("trigger") => true,
                Symbol("trailing") => true,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 500,
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => 100000,
                Symbol("trigger") => true,
                Symbol("trailing") => true,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 500,
                Symbol("daysBack") => nothing,
                Symbol("daysBackCanceled") => nothing,
                Symbol("untilDays") => 100000,
                Symbol("trigger") => true,
                Symbol("trailing") => true,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 1000
            )
        ),
        Symbol("forSwap") => Dict{Symbol, Any}(
            Symbol("extends") => "default",
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("hedged") => true
            )
        ),
        Symbol("swap") => Dict{Symbol, Any}(
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("extends") => "forSwap"
            ),
            Symbol("inverse") => nothing
        ),
        Symbol("future") => Dict{Symbol, Any}(
            Symbol("linear") => nothing,
            Symbol("inverse") => nothing
        )
    ),
    Symbol("commonCurrencies") => Dict{Symbol, Any}(),
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("9") => InvalidOrder,
            Symbol("10") => InvalidOrder,
            Symbol("11") => InvalidOrder,
            Symbol("12") => InvalidOrder,
            Symbol("13") => InvalidOrder,
            Symbol("14") => InvalidOrder,
            Symbol("15") => InvalidOrder,
            Symbol("16") => InvalidOrder,
            Symbol("17") => InvalidOrder,
            Symbol("18") => InvalidOrder,
            Symbol("19") => InvalidOrder,
            Symbol("20") => InvalidOrder,
            Symbol("21") => InvalidOrder,
            Symbol("22") => InvalidOrder,
            Symbol("23") => InvalidOrder,
            Symbol("24") => InvalidOrder,
            Symbol("25") => InvalidOrder,
            Symbol("26") => InvalidOrder,
            Symbol("27") => InvalidOrder,
            Symbol("28") => InvalidOrder,
            Symbol("29") => InvalidOrder,
            Symbol("30") => InvalidOrder,
            Symbol("31") => InvalidOrder,
            Symbol("32") => InvalidOrder,
            Symbol("33") => InvalidOrder,
            Symbol("34") => InvalidOrder,
            Symbol("35") => InvalidOrder,
            Symbol("36") => InvalidOrder,
            Symbol("37") => InvalidOrder,
            Symbol("39") => InvalidOrder,
            Symbol("40") => InvalidOrder,
            Symbol("41") => InvalidOrder,
            Symbol("42") => InvalidOrder,
            Symbol("43") => InvalidOrder,
            Symbol("44") => InvalidOrder,
            Symbol("45") => InvalidOrder,
            Symbol("46") => InvalidOrder,
            Symbol("47") => InvalidOrder,
            Symbol("48") => InvalidOrder,
            Symbol("49") => InvalidOrder,
            Symbol("50") => InvalidOrder,
            Symbol("1000") => BadRequest,
            Symbol("1001") => BadRequest,
            Symbol("1002") => BadRequest,
            Symbol("1003") => InvalidOrder,
            Symbol("1004") => InvalidOrder,
            Symbol("1005") => InvalidOrder,
            Symbol("1006") => InvalidOrder,
            Symbol("1007") => InvalidOrder,
            Symbol("1008") => InvalidOrder,
            Symbol("1009") => InvalidOrder,
            Symbol("1010") => InvalidOrder,
            Symbol("1011") => InvalidOrder,
            Symbol("1012") => InvalidOrder,
            Symbol("1013") => InvalidOrder,
            Symbol("1014") => InvalidOrder,
            Symbol("1015") => InvalidOrder,
            Symbol("1017") => InvalidOrder,
            Symbol("1018") => InvalidOrder,
            Symbol("1019") => InvalidOrder,
            Symbol("1020") => InvalidOrder,
            Symbol("1021") => InvalidOrder,
            Symbol("1022") => InvalidOrder,
            Symbol("2000") => InvalidOrder,
            Symbol("2001") => InvalidOrder,
            Symbol("2002") => InvalidOrder,
            Symbol("2003") => InvalidOrder,
            Symbol("2004") => InvalidOrder,
            Symbol("2005") => InvalidOrder,
            Symbol("3000") => InvalidOrder,
            Symbol("3001") => InvalidOrder,
            Symbol("3002") => InvalidOrder,
            Symbol("3003") => InvalidOrder,
            Symbol("3004") => InvalidOrder,
            Symbol("3005") => InvalidOrder,
            Symbol("3006") => InvalidOrder,
            Symbol("3007") => InvalidOrder,
            Symbol("3008") => InvalidOrder,
            Symbol("3009") => InvalidOrder,
            Symbol("3010") => InvalidOrder,
            Symbol("4000") => InvalidOrder,
            Symbol("4001") => InvalidOrder,
            Symbol("4002") => InvalidOrder,
            Symbol("4003") => InvalidOrder,
            Symbol("4004") => InvalidOrder,
            Symbol("4005") => InvalidOrder,
            Symbol("4006") => InvalidOrder,
            Symbol("4007") => InvalidOrder,
            Symbol("4008") => InvalidOrder,
            Symbol("5000") => InvalidOrder,
            Symbol("5001") => InvalidOrder,
            Symbol("6000") => InvalidOrder,
            Symbol("6001") => InvalidOrder,
            Symbol("6002") => InvalidOrder,
            Symbol("9000") => InvalidOrder,
            Symbol("9001") => InvalidOrder,
            Symbol("9002") => InvalidOrder,
            Symbol("9003") => InvalidOrder,
            Symbol("10000") => InvalidOrder,
            Symbol("10001") => InvalidOrder,
            Symbol("11000") => InvalidOrder
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("insufficient funds") => InsufficientFunds
        )
    ),
    Symbol("precisionMode") => TICK_SIZE
))

end
function fetchTime(self::Dydx, params=Dict())
    response = Base.fetch(self.indexerGetTime(params));
    return safeInteger(response, "epoch")

end
function parseMarket(self::Dydx, market)
    quoteId = "USDC";
    marketId = safeString(market, "ticker");
    parts = split(marketId, "-");
    baseName = safeString(parts, 0);
    baseId = safeString(market, "baseId", baseName);
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    settleId = "USDC";
    settle = self.safeCurrencyCode(settleId);
    symbol = string(base, "/", quote_var, ":", settle);
    contract = true;
    swap = true;
    amountPrecisionStr = safeString(market, "stepSize");
    pricePrecisionStr = safeString(market, "tickSize");
    status = safeString(market, "status");
    active = true;
    if functions.ccxtruthy(status != "ACTIVE")
        active = false;
    end
    return self.safeMarketStructure(Dict{Symbol, Any}(
    Symbol("id") => safeString(market, "ticker"),
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => settle,
    Symbol("baseId") => baseId,
    Symbol("baseName") => baseName,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => settleId,
    Symbol("type") => "swap",
    Symbol("spot") => false,
    Symbol("margin") => nothing,
    Symbol("swap") => swap,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => active,
    Symbol("contract") => contract,
    Symbol("contractSize") => self.parseNumber("1"),
    Symbol("linear") => true,
    Symbol("inverse") => false,
    Symbol("taker") => nothing,
    Symbol("maker") => nothing,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.parseNumber(amountPrecisionStr),
        Symbol("price") => self.parseNumber(pricePrecisionStr)
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
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
    Symbol("created") => nothing,
    Symbol("info") => market
))

end
function fetchMarkets(self::Dydx, params=Dict())
    request = Dict{Symbol, Any}();
    response = Base.fetch(self.indexerGetPerpetualMarkets(extend(request, params)));
    data = self.safeDict(response, "markets", Dict{Symbol, Any}());
    markets = objectValues(data);
    return self.parseMarkets(markets)

end
function parseTrade(self::Dydx, trade, market=nothing)
    timestamp = self.parse8601(safeString(trade, "createdAt"));
    symbol = safeString(market, "symbol");
    price = safeString(trade, "price");
    amount = safeString(trade, "size");
    side = safeStringLower(trade, "side");
    id = safeString(trade, "id");
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => symbol,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("amount") => amount,
    Symbol("cost") => nothing,
    Symbol("order") => nothing,
    Symbol("takerOrMaker") => nothing,
    Symbol("type") => nothing,
    Symbol("fee") => nothing,
    Symbol("info") => trade
), market)

end
function fetchTrades(self::Dydx, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 1000);
    end
    response = Base.fetch(self.indexerGetTradesPerpetualMarketMarket(extend(request, params)));
    rows = self.safeList(response, "trades", []);
    return self.parseTrades(rows, market, since, limit)

end
function parseOHLCV(self::Dydx, ohlcv, market=nothing)
    return [self.parse8601(safeString(ohlcv, "startedAt")), self.safeNumber(ohlcv, "open"), self.safeNumber(ohlcv, "high"), self.safeNumber(ohlcv, "low"), self.safeNumber(ohlcv, "close"), self.safeNumber(ohlcv, "baseTokenVolume")]

end
function fetchOHLCV(self::Dydx, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing),
        Symbol("resolution") => safeString(self.timeframes, timeframe, timeframe)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 1000);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("fromIso")] = self.iso8601(since);
    end
    until = safeInteger(params, "until");
    params = omit(params, "until");
    if functions.ccxtruthy(until != nothing)
        request[Symbol("toIso")] = self.iso8601(until);
    end
    response = Base.fetch(self.indexerGetCandlesPerpetualMarketsMarket(extend(request, params)));
    rows = self.safeList(response, "candles", []);
    return self.parseOHLCVs(rows, market, timeframe, since, limit)

end
function fetchFundingRateHistory(self::Dydx, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchFundingRateHistory() requires a symbol argument")));
    end
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
    until = safeInteger(params, "until");
    if functions.ccxtruthy(until != nothing)
        request[Symbol("effectiveBeforeOrAt")] = self.iso8601(until);
    end
    response = Base.fetch(self.indexerGetHistoricalFundingMarket(extend(request, params)));
    rates = [];
    rows = self.safeList(response, "historicalFunding", []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(rows)))
        entry = get(rows, i + 1, nothing);
        timestamp = self.parse8601(safeString(entry, "effectiveAt"));
        marketId = safeString(entry, "ticker");
        push!(rates, Dict{Symbol, Any}(
    Symbol("info") => entry,
    Symbol("symbol") => self.safeSymbol(marketId, market),
    Symbol("fundingRate") => self.safeNumber(entry, "rate"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
));
        i += 1
    end
    sorted = sortBy(rates, "timestamp");
    return self.filterBySymbolSinceLimit(sorted, symbol, since, limit)

end
function handlePublicAddress(self::Dydx, methodName, params)
    userAux = nothing;
    (userAux, params) = self.handleOptionAndParams(params, methodName, "user");
    user = userAux;
    (user, params) = self.handleOptionAndParams(params, methodName, "address", userAux);
    if functions.ccxtruthy(@functions.ccxt_and((user != nothing), (user != "")))
            return [user, params]
    end
    if functions.ccxtruthy(@functions.ccxt_and((self.walletAddress != nothing), (self.walletAddress != "")))
            return [self.walletAddress, params]
    end
    throw(ArgumentsRequired(string(self.id, " ", methodName, "() requires a user parameter inside \'params\' or the walletAddress set")));

end
function parseOrder(self::Dydx, order, market=nothing)
    status = self.parseOrderStatus(safeStringUpper(order, "status"));
    marketId = safeString(order, "ticker");
    symbol = self.safeSymbol(marketId, market);
    filled = safeString(order, "totalFilled");
    timestamp = self.parse8601(safeString(order, "updatedAt"));
    price = safeString(order, "price");
    amount = safeString(order, "size");
    type_var = self.parseOrderType(safeStringUpper(order, "type"));
    side = safeStringLower(order, "side");
    timeInForce = safeStringUpper(order, "timeInForce");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => safeString(order, "id"),
    Symbol("clientOrderId") => safeString(order, "clientId"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("lastUpdateTimestamp") => timestamp,
    Symbol("symbol") => symbol,
    Symbol("type") => type_var,
    Symbol("timeInForce") => timeInForce,
    Symbol("postOnly") => self.safeBool(order, "postOnly"),
    Symbol("reduceOnly") => self.safeBool(order, "reduceOnly"),
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("triggerPrice") => nothing,
    Symbol("amount") => amount,
    Symbol("cost") => nothing,
    Symbol("average") => nothing,
    Symbol("filled") => filled,
    Symbol("remaining") => nothing,
    Symbol("status") => status,
    Symbol("fee") => nothing,
    Symbol("trades") => nothing
), market)

end
function parseOrderStatus(self::Dydx, status)
    statuses = Dict{Symbol, Any}(
        Symbol("UNTRIGGERED") => "open",
        Symbol("OPEN") => "open",
        Symbol("FILLED") => "closed",
        Symbol("CANCELED") => "canceled",
        Symbol("BEST_EFFORT_CANCELED") => "canceling"
    );
    return safeString(statuses, status, status)

end
function parseOrderType(self::Dydx, type_var)
    types = Dict{Symbol, Any}(
        Symbol("LIMIT") => "LIMIT",
        Symbol("STOP_LIMIT") => "LIMIT",
        Symbol("TAKE_PROFIT_LIMIT") => "LIMIT",
        Symbol("MARKET") => "MARKET",
        Symbol("STOP_MARKET") => "MARKET",
        Symbol("TAKE_PROFIT_MARKET") => "MARKET",
        Symbol("TRAILING_STOP") => "MARKET"
    );
    return safeStringUpper(types, type_var, type_var)

end
function fetchOrder(self::Dydx, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("orderId") => id
    );
    order = Base.fetch(self.indexerGetOrdersOrderId(extend(request, params)));
    return self.parseOrder(order)

end
function fetchOrders(self::Dydx, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    userAddress = nothing;
    subAccountNumber = nothing;
    (userAddress, params) = self.handlePublicAddress("fetchOrders", params);
    (subAccountNumber, params) = self.handleOptionAndParams(params, "fetchOrders", "subAccountNumber", "0");
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("address") => userAddress,
        Symbol("subaccountNumber") => subAccountNumber
    );
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("ticker")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.indexerGetOrders(extend(request, params)));
    return self.parseOrders(response, market, since, limit)

end
function fetchOpenOrders(self::Dydx, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("status") => "OPEN"
    );
    return Base.fetch(self.fetchOrders(symbol, since, limit, extend(request, params)))

end
function fetchClosedOrders(self::Dydx, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("status") => "FILLED"
    );
    return Base.fetch(self.fetchOrders(symbol, since, limit, extend(request, params)))

end
function parsePosition(self::Dydx, position, market=nothing)
    marketId = safeString(position, "market");
    market = self.safeMarket(marketId, market);
    symbol = get(market, Symbol("symbol"), nothing);
    side = safeStringLower(position, "side");
    quantity = safeString(position, "size");
    if functions.ccxtruthy(side != "long")
        quantity = stringMul("-1", quantity);
    end
    timestamp = self.parse8601(safeString(position, "createdAt"));
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => nothing,
    Symbol("symbol") => symbol,
    Symbol("entryPrice") => self.safeNumber(position, "entryPrice"),
    Symbol("markPrice") => nothing,
    Symbol("notional") => nothing,
    Symbol("collateral") => nothing,
    Symbol("unrealizedPnl") => self.safeNumber(position, "unrealizedPnl"),
    Symbol("side") => side,
    Symbol("contracts") => self.parseNumber(quantity),
    Symbol("contractSize") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("hedged") => nothing,
    Symbol("maintenanceMargin") => nothing,
    Symbol("maintenanceMarginPercentage") => nothing,
    Symbol("initialMargin") => nothing,
    Symbol("initialMarginPercentage") => nothing,
    Symbol("leverage") => nothing,
    Symbol("liquidationPrice") => nothing,
    Symbol("marginRatio") => nothing,
    Symbol("marginMode") => nothing,
    Symbol("percentage") => nothing
))

end
function fetchPosition(self::Dydx, symbol, params=Dict())
    positions = Base.fetch(self.fetchPositions([symbol], params));
    return self.safeDict(positions, 0, Dict{Symbol, Any}())

end
function fetchPositions(self::Dydx, symbols=nothing, params=Dict())
    userAddress = nothing;
    subAccountNumber = nothing;
    (userAddress, params) = self.handlePublicAddress("fetchPositions", params);
    (subAccountNumber, params) = self.handleOptionAndParams(params, "fetchOrders", "subAccountNumber", "0");
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("address") => userAddress,
        Symbol("subaccountNumber") => subAccountNumber,
        Symbol("status") => "OPEN"
    );
    response = Base.fetch(self.indexerGetPerpetualPositions(extend(request, params)));
    rows = self.safeList(response, "positions", []);
    return self.parsePositions(rows, symbols)

end
function hashMessage(self::Dydx, message)
    return hash(message, keccak, "hex")

end
function signHash(self::Dydx, hash, privateKey)
    signature = ecdsa(hash[-64 + 1:end], privateKey[-64 + 1:end], secp256k1, nothing);
    r = get(signature, Symbol("r"), nothing);
    s = get(signature, Symbol("s"), nothing);
    return Dict{Symbol, Any}(
    Symbol("r") => lpad(r, 64, "0"),
    Symbol("s") => lpad(s, 64, "0"),
    Symbol("v") => self.sum(27, get(signature, Symbol("v"), nothing))
)

end
function signMessage(self::Dydx, message, privateKey)
    return self.signHash(self.hashMessage(message), privateKey[-64 + 1:end])

end
function signOnboardingAction(self::Dydx, )
    message = Dict{Symbol, Any}(
        Symbol("action") => "dYdX Chain Onboarding"
    );
    chainId = get(self.options, Symbol("chainId"), nothing);
    domain = Dict{Symbol, Any}(
        Symbol("chainId") => chainId,
        Symbol("name") => "dYdX Chain"
    );
    messageTypes = Dict{Symbol, Any}(
        Symbol("dYdX") => [Dict{Symbol, Any}(
        Symbol("name") => "action",
        Symbol("type") => "string"
    )]
    );
    msg = self.ethEncodeStructuredData(domain, messageTypes, message);
    if functions.ccxtruthy(@functions.ccxt_or(self.privateKey == nothing, self.privateKey == ""))
        throw(ArgumentsRequired(string(self.id, " signOnboardingAction() requires a privateKey to be set.")));
    end
    signature = self.signMessage(msg, self.privateKey);
    return signature

end
function signDydxTx(self::Dydx, privateKey, message, memo, chainId, account, authenticators, fee=nothing)
    (encodedTx, signDoc) = self.encodeDydxTxForSigning(message, memo, chainId, account, authenticators, fee);
    signature = self.signHash(encodedTx, privateKey);
    return self.encodeDydxTxRaw(signDoc, string(get(signature, Symbol("r"), nothing), get(signature, Symbol("s"), nothing)))

end
function retrieveCredentials(self::Dydx, )
    credentials = self.safeDict(self.options, "dydxCredentials");
    if functions.ccxtruthy(credentials != nothing)
            return credentials
    end
    privateKey = safeString(self.options, "privateKey");
    if functions.ccxtruthy(privateKey == nothing)
        signature = self.signOnboardingAction();
        privateKey = self.hashMessage(self.base16ToBinary(get(signature, Symbol("r"), nothing) + get(signature, Symbol("s"), nothing)));
    end
    credentials = self.retrieveDydxCredentials(privateKey);
    credentials[Symbol("privateKey")] = self.binaryToBase16(get(credentials, Symbol("privateKey"), nothing));
    credentials[Symbol("publicKey")] = self.binaryToBase16(get(credentials, Symbol("publicKey"), nothing));
    self.options[Symbol("dydxCredentials")] = credentials;
    return credentials

end
function fetchDydxAccount(self::Dydx, )
    Base.fetch(self.loadDydxProtos());
    dydxAccount = self.safeDict(self.options, "dydxAccount");
    if functions.ccxtruthy(dydxAccount != nothing)
            return dydxAccount
    end
    if functions.ccxtruthy(self.walletAddress == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchDydxAccount() requires the walletAddress to be set using the dydx chain address eg: dydx1cpb4tedmwq304c2kc9pwzjwq0sc6z2a4tasxrz")));
    end
    if functions.ccxtruthy(!functions.ccxtruthy(startswith(self.walletAddress, "dydx")))
        throw(ArgumentsRequired(string(self.id, " fetchDydxAccount() requires a valid dydx chain address, starting with dydx, not the l1 address.")));
    end
    request = Dict{Symbol, Any}(
        Symbol("dydxAddress") => self.walletAddress
    );
    response = Base.fetch(self.nodeRestGetCosmosAuthV1beta1AccountInfoDydxAddress(request));
    account = self.safeDict(response, "info", Dict{Symbol, Any}());
    account[Symbol("pub_key")] = Dict{Symbol, Any}(
        Symbol("key") => get(get(account, Symbol("pub_key"), nothing), Symbol("key"), nothing)
    );
    self.options[Symbol("dydxAccount")] = account;
    return account

end
function pow(self::Dydx, n, m)
    r = stringMul(n, "1");
    c = self.parseToInt(m);
    i = 1
    while functions.ccxtruthy(functions.ccxt_lt(i, c))
        r = stringMul(r, n);
        i += 1
    end
    return r

end
function createOrderRequest(self::Dydx, symbol, type_var, side, amount, price=nothing, params=Dict())
    reduceOnly = self.safeBool2(params, "reduceOnly", "reduce_only", false);
    orderType = uppercase(type_var);
    market = self.market(symbol);
    orderSide = uppercase(side);
    subaccountId = 0;
    (subaccountId, params) = self.handleOptionAndParams(params, "createOrder", "subAccountId", subaccountId);
    triggerPrice = safeString2(params, "triggerPrice", "stopPrice");
    stopLossPrice = safeValue(params, "stopLossPrice", triggerPrice);
    takeProfitPrice = safeValue(params, "takeProfitPrice");
    isConditional = @functions.ccxt_or(@functions.ccxt_or(triggerPrice != nothing, stopLossPrice != nothing), takeProfitPrice != nothing);
    isMarket = orderType == "MARKET";
    timeInForce = safeStringUpper(params, "timeInForce", "GTT");
    postOnly = self.isPostOnly(isMarket, nothing, params);
    amountStr = self.amountToPrecision(symbol, amount);
    priceStr = self.priceToPrecision(symbol, price);
    marketInfo = self.safeDict(market, "info", Dict{Symbol, Any}());
    atomicResolution = get(marketInfo, Symbol("atomicResolution"), nothing);
    quantumScale = self.pow("10", stringNeg(atomicResolution));
    quantums = stringMul(amountStr, quantumScale);
    quantumConversionExponent = get(marketInfo, Symbol("quantumConversionExponent"), nothing);
    priceScale = self.pow("10", stringSub(stringSub(atomicResolution, quantumConversionExponent), "-6"));
    subticks = stringMul(priceStr, priceScale);
    clientMetadata = 0;
    conditionalType = 0;
    conditionalOrderTriggerSubticks = "0";
    orderFlag = nothing;
    timeInForceNumber = nothing;
    if functions.ccxtruthy(timeInForce == "FOK")
        throw(InvalidOrder(string(self.id, " timeInForce fok has been deprecated")));
    end
    if functions.ccxtruthy(orderType == "MARKET")
        orderFlag = 0;
        clientMetadata = 1;
        if functions.ccxtruthy(timeInForce != nothing)
            timeInForceNumber = 1;
        end
    elseif functions.ccxtruthy(orderType == "LIMIT")
        if functions.ccxtruthy(timeInForce == "GTT")
            orderFlag = 64;
            if functions.ccxtruthy(postOnly)
                timeInForceNumber = 2;
            else
                timeInForceNumber = 0;
            end
        else
            orderFlag = 0;
            if functions.ccxtruthy(timeInForce == "IOC")
                timeInForceNumber = 1;
            else
                throw(InvalidOrder("unexpected code path: timeInForce"));
            end
        end
    end
    if functions.ccxtruthy(isConditional)
        orderFlag = 32;
        if functions.ccxtruthy(stopLossPrice != nothing)
            conditionalType = 1;
            conditionalOrderTriggerSubticks = self.priceToPrecision(symbol, stopLossPrice);
        elseif functions.ccxtruthy(takeProfitPrice != nothing)
            conditionalType = 2;
            conditionalOrderTriggerSubticks = self.priceToPrecision(symbol, takeProfitPrice);
        end
        conditionalOrderTriggerSubticks = stringMul(conditionalOrderTriggerSubticks, priceScale);
    end
    latestBlockHeight = safeInteger(params, "latestBlockHeight");
    goodTillBlock = safeInteger(params, "goodTillBlock");
    goodTillBlockTime = nothing;
    goodTillBlockTimeInSeconds = 2592000;
    (goodTillBlockTimeInSeconds, params) = self.handleOptionAndParams(params, "createOrder", "goodTillBlockTimeInSeconds", goodTillBlockTimeInSeconds);
    if functions.ccxtruthy(orderFlag == 0)
        if functions.ccxtruthy(goodTillBlock == nothing)
            goodTillBlock = latestBlockHeight + 20;
        end
    else
        if functions.ccxtruthy(goodTillBlockTimeInSeconds == nothing)
            throw(ArgumentsRequired("goodTillBlockTimeInSeconds is required."));
        end
        goodTillBlockTime = seconds() + goodTillBlockTimeInSeconds;
    end
    sideNumber = functions.ccxtruthy((orderSide == "BUY")) ? 1 : 2;
    defaultClientOrderId = self.randNumber(9);
    clientOrderId = safeInteger(params, "clientOrderId", defaultClientOrderId);
    orderPayload = Dict{Symbol, Any}(
        Symbol("order") => Dict{Symbol, Any}(
            Symbol("orderId") => Dict{Symbol, Any}(
                Symbol("subaccountId") => Dict{Symbol, Any}(
                    Symbol("owner") => self.getWalletAddress(),
                    Symbol("number") => subaccountId
                ),
                Symbol("clientId") => clientOrderId,
                Symbol("orderFlags") => orderFlag,
                Symbol("clobPairId") => get(marketInfo, Symbol("clobPairId"), nothing)
            ),
            Symbol("side") => sideNumber,
            Symbol("quantums") => self.toDydxLong(quantums),
            Symbol("subticks") => self.toDydxLong(subticks),
            Symbol("goodTilBlock") => goodTillBlock,
            Symbol("goodTilBlockTime") => goodTillBlockTime,
            Symbol("timeInForce") => timeInForceNumber,
            Symbol("reduceOnly") => reduceOnly,
            Symbol("clientMetadata") => clientMetadata,
            Symbol("conditionType") => conditionalType,
            Symbol("conditionalOrderTriggerSubticks") => self.toDydxLong(conditionalOrderTriggerSubticks),
            Symbol("orderRouterAddress") => safeString(self.options, "routerAddress", "dydx165sfn2k3vucvq7gklauy2r3agyjw4c3m60ascn")
        )
    );
    signingPayload = Dict{Symbol, Any}(
        Symbol("typeUrl") => "/dydxprotocol.clob.MsgPlaceOrder",
        Symbol("value") => orderPayload
    );
    params = omit(params, ["reduceOnly", "reduce_only", "clientOrderId", "postOnly", "timeInForce", "stopPrice", "triggerPrice", "stopLoss", "takeProfit", "latestBlockHeight", "goodTillBlock", "goodTillBlockTimeInSeconds", "subaccountId"]);
    orderId = self.createOrderIdFromParts(self.getWalletAddress(), subaccountId, clientOrderId, orderFlag, get(marketInfo, Symbol("clobPairId"), nothing));
    return [orderId, extend(signingPayload, params)]

end
function createOrderIdFromParts(self::Dydx, address, subAccountNumber, clientOrderId, orderFlags, clobPairId)
    nameSp = safeString(self.options, "namespace", "0f9da948-a6fb-4c45-9edc-4685c3f3317d");
    prefixAddress = string(address, "-", subAccountNumber);
    prefix = self.uuid5(nameSp, prefixAddress);
    orderInfo = string(prefix, "-", numberToString(clientOrderId), "-", numberToString(clobPairId), "-", numberToString(orderFlags));
    return self.uuid5(nameSp, orderInfo)

end
function fetchLatestBlockHeight(self::Dydx, params=Dict())
    response = Base.fetch(self.nodeRpcGetAbciInfo(params));
    result = self.safeDict(response, "result");
    info = self.safeDict(result, "response");
    return safeInteger(info, "last_block_height")

end
function createOrder(self::Dydx, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    credentials = self.retrieveCredentials();
    account = Base.fetch(self.fetchDydxAccount());
    lastBlockHeight = Base.fetch(self.fetchLatestBlockHeight());
    newParams = extend(params, Dict{Symbol, Any}(
        Symbol("latestBlockHeight") => lastBlockHeight
    ));
    orderRequestRes = self.createOrderRequest(symbol, type_var, side, amount, price, newParams);
    orderId = get(orderRequestRes, 1, nothing);
    orderRequest = get(orderRequestRes, 2, nothing);
    chainName = get(self.options, Symbol("chainName"), nothing);
    signedTx = self.signDydxTx(get(credentials, Symbol("privateKey"), nothing), orderRequest, "", chainName, account, nothing);
    request = Dict{Symbol, Any}(
        Symbol("tx") => signedTx
    );
    response = Base.fetch(self.nodeRpcGetBroadcastTxSync(request));
    result = self.safeDict(response, "result");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => result,
    Symbol("id") => orderId,
    Symbol("clientOrderId") => get(get(get(get(orderRequest, Symbol("value"), nothing), Symbol("order"), nothing), Symbol("orderId"), nothing), Symbol("clientId"), nothing)
))

end
function cancelOrder(self::Dydx, id, symbol=nothing, params=Dict())
    isTrigger = self.safeBool2(params, "trigger", "stop", false);
    params = omit(params, ["trigger", "stop"]);
    if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy(isTrigger), (symbol == nothing)))
        throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    clientOrderId = safeString2(params, "clientOrderId", "clientId", id);
    if functions.ccxtruthy(clientOrderId == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a clientOrderId parameter, cancelling using id is not currently supported.")));
    end
    idString = string(id);
    if functions.ccxtruthy(@functions.ccxt_and(id != nothing, findfirst("-", idString) !== nothing))
        throw(NotSupported(string(self.id, " cancelOrder() cancelling using id is not currently supported, please use provide the clientOrderId parameter.")));
    end
    goodTillBlock = safeInteger(params, "goodTillBlock");
    goodTillBlockTimeInSeconds = 2592000;
    (goodTillBlockTimeInSeconds, params) = self.handleOptionAndParams(params, "cancelOrder", "goodTillBlockTimeInSeconds", goodTillBlockTimeInSeconds);
    goodTillBlockTime = nothing;
    defaultOrderFlags = functions.ccxtruthy((isTrigger)) ? 32 : 64;
    orderFlags = safeInteger(params, "orderFlags", defaultOrderFlags);
    subAccountId = 0;
    (subAccountId, params) = self.handleOptionAndParams(params, "cancelOrder", "subAccountId", subAccountId);
    params = omit(params, ["clientOrderId", "orderFlags", "goodTillBlock", "goodTillBlockTime", "goodTillBlockTimeInSeconds", "subaccountId", "clientId"]);
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(orderFlags != 0, orderFlags != 64), orderFlags != 32))
        throw(InvalidOrder(string(self.id, " invalid orderFlags, allowed values are (0, 64, 32).")));
    end
    if functions.ccxtruthy(functions.ccxt_gt(orderFlags, 0))
        if functions.ccxtruthy(goodTillBlockTimeInSeconds == nothing)
            throw(ArgumentsRequired(string(self.id, " goodTillBlockTimeInSeconds is required in params for long term or conditional order.")));
        end
        if functions.ccxtruthy(@functions.ccxt_and(goodTillBlock != nothing, functions.ccxt_gt(goodTillBlock, 0)))
            throw(InvalidOrder(string(self.id, " goodTillBlock should be 0 for long term or conditional order.")));
        end
        goodTillBlockTime = seconds() + goodTillBlockTimeInSeconds;
    else
        if functions.ccxtruthy(goodTillBlock == nothing)
            latestBlockHeight = Base.fetch(self.fetchLatestBlockHeight());
            goodTillBlock = latestBlockHeight + 20;
        end
    end
    credentials = self.retrieveCredentials();
    account = Base.fetch(self.fetchDydxAccount());
    cancelPayload = Dict{Symbol, Any}(
        Symbol("orderId") => Dict{Symbol, Any}(
            Symbol("subaccountId") => Dict{Symbol, Any}(
                Symbol("owner") => self.getWalletAddress(),
                Symbol("number") => subAccountId
            ),
            Symbol("clientId") => clientOrderId,
            Symbol("orderFlags") => orderFlags,
            Symbol("clobPairId") => get(get(market, Symbol("info"), nothing), Symbol("clobPairId"), nothing)
        ),
        Symbol("goodTilBlock") => goodTillBlock,
        Symbol("goodTilBlockTime") => goodTillBlockTime
    );
    signingPayload = Dict{Symbol, Any}(
        Symbol("typeUrl") => "/dydxprotocol.clob.MsgCancelOrder",
        Symbol("value") => cancelPayload
    );
    chainName = get(self.options, Symbol("chainName"), nothing);
    signedTx = self.signDydxTx(get(credentials, Symbol("privateKey"), nothing), signingPayload, "", chainName, account, nothing);
    request = Dict{Symbol, Any}(
        Symbol("tx") => signedTx
    );
    response = Base.fetch(self.nodeRpcGetBroadcastTxSync(request));
    result = self.safeDict(response, "result");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => result
))

end
function cancelOrders(self::Dydx, ids, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    clientOrderIds = self.safeList(params, "clientOrderIds");
    if functions.ccxtruthy(!functions.ccxtruthy(clientOrderIds))
        throw(NotSupported(string(self.id, " cancelOrders only support clientOrderIds.")));
    end
    subAccountId = 0;
    (subAccountId, params) = self.handleOptionAndParams(params, "cancelOrders", "subAccountId", subAccountId);
    goodTillBlock = safeInteger(params, "goodTillBlock");
    if functions.ccxtruthy(goodTillBlock == nothing)
        latestBlockHeight = Base.fetch(self.fetchLatestBlockHeight());
        goodTillBlock = latestBlockHeight + 20;
    end
    params = omit(params, ["clientOrderIds", "goodTillBlock", "subaccountId"]);
    credentials = self.retrieveCredentials();
    account = Base.fetch(self.fetchDydxAccount());
    cancelOrders = Dict{Symbol, Any}(
        Symbol("clientIds") => clientOrderIds,
        Symbol("clobPairId") => get(get(market, Symbol("info"), nothing), Symbol("clobPairId"), nothing)
    );
    cancelPayload = Dict{Symbol, Any}(
        Symbol("subaccountId") => Dict{Symbol, Any}(
            Symbol("owner") => self.getWalletAddress(),
            Symbol("number") => subAccountId
        ),
        Symbol("shortTermCancels") => [cancelOrders],
        Symbol("goodTilBlock") => goodTillBlock
    );
    signingPayload = Dict{Symbol, Any}(
        Symbol("typeUrl") => "/dydxprotocol.clob.MsgBatchCancel",
        Symbol("value") => cancelPayload
    );
    chainName = get(self.options, Symbol("chainName"), nothing);
    signedTx = self.signDydxTx(get(credentials, Symbol("privateKey"), nothing), signingPayload, "", chainName, account, nothing);
    request = Dict{Symbol, Any}(
        Symbol("tx") => signedTx
    );
    response = Base.fetch(self.nodeRpcGetBroadcastTxSync(request));
    result = self.safeDict(response, "result");
    return [self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => result
))]

end
function fetchOrderBook(self::Dydx, symbol, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.indexerGetOrderbooksPerpetualMarketMarket(extend(request, params)));
    return self.parseOrderBook(response, get(market, Symbol("symbol"), nothing), nothing, "bids", "asks", "price", "size")

end
function parseLedgerEntry(self::Dydx, item, currency=nothing)
    currencyId = safeString(item, "symbol");
    code = self.safeCurrencyCode(currencyId, currency);
    currency = self.safeCurrency(currencyId, currency);
    type_var = safeStringUpper(item, "type");
    direction = nothing;
    if functions.ccxtruthy(type_var != nothing)
        if functions.ccxtruthy(@functions.ccxt_or(type_var == "TRANSFER_IN", type_var == "DEPOSIT"))
            direction = "in";
        elseif functions.ccxtruthy(@functions.ccxt_or(type_var == "TRANSFER_OUT", type_var == "WITHDRAWAL"))
            direction = "out";
        end
    end
    amount = safeString(item, "size");
    timestamp = self.parse8601(safeString(item, "createdAt"));
    sender = self.safeDict(item, "sender");
    recipient = self.safeDict(item, "recipient");
    return self.safeLedgerEntry(Dict{Symbol, Any}(
    Symbol("info") => item,
    Symbol("id") => safeString(item, "id"),
    Symbol("direction") => direction,
    Symbol("account") => safeString(sender, "address"),
    Symbol("referenceAccount") => safeString(recipient, "address"),
    Symbol("referenceId") => safeString(item, "transactionHash"),
    Symbol("type") => self.parseLedgerEntryType(type_var),
    Symbol("currency") => code,
    Symbol("amount") => self.parseNumber(amount),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("before") => nothing,
    Symbol("after") => nothing,
    Symbol("status") => nothing,
    Symbol("fee") => nothing
), currency)

end
function parseLedgerEntryType(self::Dydx, type_var)
    ledgerType = Dict{Symbol, Any}(
        Symbol("TRANSFER_IN") => "transfer",
        Symbol("TRANSFER_OUT") => "transfer",
        Symbol("DEPOSIT") => "deposit",
        Symbol("WITHDRAWAL") => "withdrawal"
    );
    return safeString(ledgerType, type_var, type_var)

end
function fetchLedger(self::Dydx, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    response = Base.fetch(self.fetchTransactionsHelper(code, since, limit, extend(params, Dict{Symbol, Any}(
        Symbol("methodName") => "fetchLedger"
    ))));
    return self.parseLedger(response, currency, since, limit)

end
function estimateTxFee(self::Dydx, message, memo, account)
    txBytes = self.encodeDydxTxForSimulation(message, memo, get(account, Symbol("sequence"), nothing), get(account, Symbol("pub_key"), nothing));
    request = Dict{Symbol, Any}(
        Symbol("txBytes") => txBytes
    );
    response = Base.fetch(self.nodeRestPostCosmosTxV1beta1Simulate(request));
    gasInfo = self.safeDict(response, "gas_info");
    if functions.ccxtruthy(gasInfo == nothing)
        throw(ExchangeError(string(self.id, " failed to simulate transaction.")));
    end
    gasUsed = safeString(gasInfo, "gas_used");
    if functions.ccxtruthy(gasUsed == nothing)
        throw(ExchangeError(string(self.id, " failed to simulate transaction.")));
    end
    defaultFeeDenom = safeString(self.options, "defaultFeeDenom");
    defaultFeeMultiplier = safeString(self.options, "defaultFeeMultiplier");
    feeDenom = self.safeDict(self.options, "feeDenom", Dict{Symbol, Any}());
    gasPrice = nothing;
    denom = nothing;
    if functions.ccxtruthy(defaultFeeDenom == "uusdc")
        gasPrice = get(feeDenom, Symbol("USDC_GAS_PRICE"), nothing);
        denom = get(feeDenom, Symbol("USDC_DENOM"), nothing);
    else
        gasPrice = get(feeDenom, Symbol("CHAINTOKEN_GAS_PRICE"), nothing);
        denom = get(feeDenom, Symbol("CHAINTOKEN_DENOM"), nothing);
    end
    gasLimit = ceil(self.parseToNumeric(stringMul(gasUsed, defaultFeeMultiplier)));
    feeAmount = stringMul(numberToString(gasLimit), gasPrice);
    if functions.ccxtruthy(findfirst(".", feeAmount) !== nothing)
        feeAmount = numberToString(ceil(self.parseToNumeric(feeAmount)));
    end
    feeObj = Dict{Symbol, Any}(
        Symbol("amount") => feeAmount,
        Symbol("denom") => denom
    );
    return Dict{Symbol, Any}(
    Symbol("amount") => [feeObj],
    Symbol("gasLimit") => gasLimit
)

end
function transfer(self::Dydx, code, amount, fromAccount, toAccount, params=Dict())
    if functions.ccxtruthy(code != "USDC")
        throw(NotSupported(string(self.id, " transfer() only support USDC")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    fromSubaccountId = safeInteger(params, "fromSubaccountId");
    toSubaccountId = safeInteger(params, "toSubaccountId");
    if functions.ccxtruthy(fromAccount != "main")
        if functions.ccxtruthy(fromAccount == nothing)
            throw(NotSupported(string(self.id, " transfer only support main > subaccount and subaccount <> subaccount.")));
        end
        if functions.ccxtruthy(@functions.ccxt_or(fromSubaccountId == nothing, toSubaccountId == nothing))
            throw(ArgumentsRequired(string(self.id, " transfer requires fromSubaccountId and toSubaccountId.")));
        end
    end
    params = omit(params, ["fromSubaccountId", "toSubaccountId"]);
    credentials = self.retrieveCredentials();
    account = Base.fetch(self.fetchDydxAccount());
    usd = self.parseToInt(stringMul(numberToString(amount), "1000000"));
    payload = nothing;
    signingPayload = nothing;
    if functions.ccxtruthy(fromAccount == "main")
        if functions.ccxtruthy(toSubaccountId == nothing)
            throw(ArgumentsRequired(string(self.id, " transfer() requeire toSubaccoutnId.")));
        end
        payload = Dict{Symbol, Any}(
            Symbol("sender") => self.getWalletAddress(),
            Symbol("recipient") => Dict{Symbol, Any}(
                Symbol("owner") => self.getWalletAddress(),
                Symbol("number") => toSubaccountId
            ),
            Symbol("assetId") => 0,
            Symbol("quantums") => usd
        );
        signingPayload = Dict{Symbol, Any}(
            Symbol("typeUrl") => "/dydxprotocol.sending.MsgDepositToSubaccount",
            Symbol("value") => payload
        );
    else
        payload = Dict{Symbol, Any}(
            Symbol("transfer") => Dict{Symbol, Any}(
                Symbol("sender") => Dict{Symbol, Any}(
                    Symbol("owner") => fromAccount,
                    Symbol("number") => fromSubaccountId
                ),
                Symbol("recipient") => Dict{Symbol, Any}(
                    Symbol("owner") => toAccount,
                    Symbol("number") => toSubaccountId
                ),
                Symbol("assetId") => 0,
                Symbol("amount") => usd
            )
        );
        signingPayload = Dict{Symbol, Any}(
            Symbol("typeUrl") => "/dydxprotocol.sending.MsgCreateTransfer",
            Symbol("value") => payload
        );
    end
    txFee = Base.fetch(self.estimateTxFee(signingPayload, "", account));
    chainName = get(self.options, Symbol("chainName"), nothing);
    signedTx = self.signDydxTx(get(credentials, Symbol("privateKey"), nothing), signingPayload, "", chainName, account, nothing, txFee);
    request = Dict{Symbol, Any}(
        Symbol("tx") => signedTx
    );
    response = Base.fetch(self.nodeRpcGetBroadcastTxSync(request));
    return self.parseTransfer(response)

end
function parseTransfer(self::Dydx, transfer, currency=nothing)
    id = safeString(transfer, "id");
    currencyId = safeString(transfer, "symbol");
    code = self.safeCurrencyCode(currencyId, currency);
    amount = self.safeNumber(transfer, "size");
    sender = self.safeDict(transfer, "sender");
    recipient = self.safeDict(transfer, "recipient");
    fromAccount = safeString(sender, "address");
    toAccount = safeString(recipient, "address");
    timestamp = self.parse8601(safeString(transfer, "createdAt"));
    return Dict{Symbol, Any}(
    Symbol("info") => transfer,
    Symbol("id") => id,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("currency") => code,
    Symbol("amount") => amount,
    Symbol("fromAccount") => fromAccount,
    Symbol("toAccount") => toAccount,
    Symbol("status") => nothing
)

end
function fetchTransfers(self::Dydx, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    response = Base.fetch(self.fetchTransactionsHelper(code, since, limit, extend(params, Dict{Symbol, Any}(
        Symbol("methodName") => "fetchTransfers"
    ))));
    transferIn = filterBy(response, "type", "TRANSFER_IN");
    transferOut = filterBy(response, "type", "TRANSFER_OUT");
    rows = arrayConcat(transferIn, transferOut);
    return self.parseTransfers(rows, currency, since, limit)

end
function parseTransaction(self::Dydx, transaction, currency=nothing)
    id = safeString(transaction, "id");
    sender = self.safeDict(transaction, "sender");
    recipient = self.safeDict(transaction, "recipient");
    addressTo = safeString(recipient, "address");
    addressFrom = safeString(sender, "address");
    txid = safeString(transaction, "transactionHash");
    currencyId = safeString(transaction, "symbol");
    code = self.safeCurrencyCode(currencyId, currency);
    timestamp = self.parse8601(safeString(transaction, "createdAt"));
    amount = self.safeNumber(transaction, "size");
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => id,
    Symbol("txid") => txid,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("network") => nothing,
    Symbol("address") => addressTo,
    Symbol("addressTo") => addressTo,
    Symbol("addressFrom") => addressFrom,
    Symbol("tag") => nothing,
    Symbol("tagTo") => nothing,
    Symbol("tagFrom") => nothing,
    Symbol("type") => safeStringLower(transaction, "type"),
    Symbol("amount") => amount,
    Symbol("currency") => code,
    Symbol("status") => nothing,
    Symbol("updated") => nothing,
    Symbol("internal") => nothing,
    Symbol("comment") => nothing,
    Symbol("fee") => nothing
)

end
function withdraw(self::Dydx, code, amount, address, tag=nothing, params=Dict())
    if functions.ccxtruthy(code != "USDC")
        throw(NotSupported(string(self.id, " withdraw() only support USDC")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    self.checkAddress(address);
    subaccountId = safeInteger(params, "subaccountId");
    if functions.ccxtruthy(subaccountId == nothing)
        throw(ArgumentsRequired(string(self.id, " withdraw requires subaccountId.")));
    end
    params = omit(params, ["subaccountId"]);
    currency = self.currency(code);
    credentials = self.retrieveCredentials();
    account = Base.fetch(self.fetchDydxAccount());
    usd = self.parseToInt(stringMul(numberToString(amount), "1000000"));
    payload = Dict{Symbol, Any}(
        Symbol("sender") => Dict{Symbol, Any}(
            Symbol("owner") => self.getWalletAddress(),
            Symbol("number") => subaccountId
        ),
        Symbol("recipient") => address,
        Symbol("assetId") => 0,
        Symbol("quantums") => usd
    );
    signingPayload = Dict{Symbol, Any}(
        Symbol("typeUrl") => "/dydxprotocol.sending.MsgWithdrawFromSubaccount",
        Symbol("value") => payload
    );
    txFee = Base.fetch(self.estimateTxFee(signingPayload, tag, account));
    chainName = get(self.options, Symbol("chainName"), nothing);
    signedTx = self.signDydxTx(get(credentials, Symbol("privateKey"), nothing), signingPayload, tag, chainName, account, nothing, txFee);
    request = Dict{Symbol, Any}(
        Symbol("tx") => signedTx
    );
    response = Base.fetch(self.nodeRpcGetBroadcastTxSync(request));
    data = self.safeDict(response, "result", Dict{Symbol, Any}());
    return self.parseTransaction(data, currency)

end
function fetchWithdrawals(self::Dydx, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    response = Base.fetch(self.fetchTransactionsHelper(code, since, limit, extend(params, Dict{Symbol, Any}(
        Symbol("methodName") => "fetchWithdrawals"
    ))));
    rows = filterBy(response, "type", "WITHDRAWAL");
    return self.parseTransactions(rows, currency, since, limit)

end
function fetchDeposits(self::Dydx, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    response = Base.fetch(self.fetchTransactionsHelper(code, since, limit, extend(params, Dict{Symbol, Any}(
        Symbol("methodName") => "fetchDeposits"
    ))));
    rows = filterBy(response, "type", "DEPOSIT");
    return self.parseTransactions(rows, currency, since, limit)

end
function fetchDepositsWithdrawals(self::Dydx, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    response = Base.fetch(self.fetchTransactionsHelper(code, since, limit, extend(params, Dict{Symbol, Any}(
        Symbol("methodName") => "fetchDepositsWithdrawals"
    ))));
    withdrawals = filterBy(response, "type", "WITHDRAWAL");
    deposits = filterBy(response, "type", "DEPOSIT");
    rows = arrayConcat(withdrawals, deposits);
    return self.parseTransactions(rows, currency, since, limit)

end
function fetchTransactionsHelper(self::Dydx, code=nothing, since=nothing, limit=nothing, params=Dict())
    methodName = safeString(params, "methodName");
    params = omit(params, "methodName");
    userAddress = nothing;
    subAccountNumber = nothing;
    (userAddress, params) = self.handlePublicAddress(methodName, params);
    (subAccountNumber, params) = self.handleOptionAndParams(params, methodName, "subAccountNumber", "0");
    request = Dict{Symbol, Any}(
        Symbol("address") => userAddress,
        Symbol("subaccountNumber") => subAccountNumber
    );
    response = Base.fetch(self.indexerGetTransfers(extend(request, params)));
    return self.safeList(response, "transfers", [])

end
function fetchAccounts(self::Dydx, params=Dict())
    userAddress = nothing;
    (userAddress, params) = self.handlePublicAddress("fetchAccounts", params);
    request = Dict{Symbol, Any}(
        Symbol("address") => userAddress
    );
    response = Base.fetch(self.indexerGetAddressesAddress(extend(request, params)));
    rows = self.safeList(response, "subaccounts", []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(rows)))
        account = get(rows, i + 1, nothing);
        accountId = safeString(account, "subaccountNumber");
        push!(result, Dict{Symbol, Any}(
    Symbol("id") => accountId,
    Symbol("type") => nothing,
    Symbol("currency") => nothing,
    Symbol("info") => account,
    Symbol("code") => nothing
));
        i += 1
    end
    return result

end
function fetchBalance(self::Dydx, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    userAddress = nothing;
    (userAddress, params) = self.handlePublicAddress("fetchAccounts", params);
    subaccountNumber = nothing;
    (subaccountNumber, params) = self.handleOptionAndParams(params, "fetchAccounts", "subaccountNumber", 0);
    request = Dict{Symbol, Any}(
        Symbol("address") => userAddress,
        Symbol("subaccountNumber") => subaccountNumber
    );
    response = Base.fetch(self.indexerGetAddressesAddressSubaccountNumberSubaccountNumber(extend(request, params)));
    data = self.safeDict(response, "subaccount");
    return self.parseBalance(data)

end
function parseBalance(self::Dydx, response)
    account = self.account();
    account[Symbol("free")] = safeString(response, "freeCollateral");
    result = Dict{Symbol, Any}(
        Symbol("info") => response,
        Symbol("USDC") => account
    );
    return self.safeBalance(result)

end
function nonce(self::Dydx, )
    return milliseconds() - get(self.options, Symbol("timeDifference"), nothing)

end
function getWalletAddress(self::Dydx, )
    if functions.ccxtruthy(@functions.ccxt_and(self.walletAddress != nothing, self.walletAddress != ""))
            return self.walletAddress
    end
    dydxAccount = self.safeDict(self.options, "dydxAccount");
    if functions.ccxtruthy(dydxAccount != nothing)
        wallet = safeString(dydxAccount, "address");
        if functions.ccxtruthy(wallet != nothing)
                return wallet
        end
    end
    throw(ArgumentsRequired(string(self.id, " getWalletAddress() requires a wallet address. Set `walletAddress` or `dydxAccount` in exchange options.")));

end
function sign(self::Dydx, path, section="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    pathWithParams = self.implodeParams(path, params);
    url = self.implodeHostname(get(get(self.urls, Symbol("api"), nothing), Symbol(section), nothing));
    params = omit(params, self.extractParams(path));
    params = keysort(params);
    url += string("/", pathWithParams);
    if functions.ccxtruthy(method == "GET")
        if functions.ccxtruthy(length(objectKeys(params)))
            url += string("?", self.urlencode(params));
        end
    else
        body = json(params);
        headers = Dict{Symbol, Any}(
            Symbol("Content-type") => "application/json"
        );
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Dydx, httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(!functions.ccxtruthy(response))
            return nothing
    end
    result = self.safeDict(response, "result");
    errorCode = safeString(result, "code");
    if functions.ccxtruthy(!functions.ccxtruthy(errorCode))
        errorCode = safeString(response, "code");
    end
    if functions.ccxtruthy(errorCode)
        errorCodeNum = self.parseToNumeric(errorCode);
        if functions.ccxtruthy(functions.ccxt_gt(errorCodeNum, 0))
            feedback = string(self.id, " ", json(response));
            self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), errorCode, feedback);
            self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), body, feedback);
            throw(ExchangeError(feedback));
        end
    end
    return nothing

end
function setSandboxMode(self::Dydx, enable)
    setSandboxMode(self.parent, enable);
    self.options[Symbol("chainName")] = "dydx-testnet-4";
    self.options[Symbol("chainId")] = 11155111;
    self.options[Symbol("feeDenom")][Symbol("CHAINTOKEN_DENOM")] = "adv4tnt";

end

# Property resolution is shared by every generated exchange; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Dydx, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function indexerGetAddressesAddress(self::Dydx, params=Dict(), context=Dict())
    return request(self, "addresses/{address}", "indexer", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function indexerGetAddressesAddressParentSubaccountNumberNumber(self::Dydx, params=Dict(), context=Dict())
    return request(self, "addresses/{address}/parentSubaccountNumber/{number}", "indexer", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function indexerGetAddressesAddressSubaccountNumberSubaccountNumber(self::Dydx, params=Dict(), context=Dict())
    return request(self, "addresses/{address}/subaccountNumber/{subaccountNumber}", "indexer", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function indexerGetAssetPositions(self::Dydx, params=Dict(), context=Dict())
    return request(self, "assetPositions", "indexer", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function indexerGetAssetPositionsParentSubaccountNumber(self::Dydx, params=Dict(), context=Dict())
    return request(self, "assetPositions/parentSubaccountNumber", "indexer", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function indexerGetCandlesPerpetualMarketsMarket(self::Dydx, params=Dict(), context=Dict())
    return request(self, "candles/perpetualMarkets/{market}", "indexer", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function indexerGetComplianceScreenAddress(self::Dydx, params=Dict(), context=Dict())
    return request(self, "compliance/screen/{address}", "indexer", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function indexerGetFills(self::Dydx, params=Dict(), context=Dict())
    return request(self, "fills", "indexer", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function indexerGetFillsParentSubaccountNumber(self::Dydx, params=Dict(), context=Dict())
    return request(self, "fills/parentSubaccountNumber", "indexer", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function indexerGetFundingPayments(self::Dydx, params=Dict(), context=Dict())
    return request(self, "fundingPayments", "indexer", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function indexerGetFundingPaymentsParentSubaccount(self::Dydx, params=Dict(), context=Dict())
    return request(self, "fundingPayments/parentSubaccount", "indexer", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function indexerGetHeight(self::Dydx, params=Dict(), context=Dict())
    return request(self, "height", "indexer", "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.1))
end

function indexerGetHistoricalPnl(self::Dydx, params=Dict(), context=Dict())
    return request(self, "historical-pnl", "indexer", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function indexerGetHistoricalPnlParentSubaccountNumber(self::Dydx, params=Dict(), context=Dict())
    return request(self, "historical-pnl/parentSubaccountNumber", "indexer", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function indexerGetHistoricalBlockTradingRewardsAddress(self::Dydx, params=Dict(), context=Dict())
    return request(self, "historicalBlockTradingRewards/{address}", "indexer", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function indexerGetHistoricalFundingMarket(self::Dydx, params=Dict(), context=Dict())
    return request(self, "historicalFunding/{market}", "indexer", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function indexerGetHistoricalTradingRewardAggregationsAddress(self::Dydx, params=Dict(), context=Dict())
    return request(self, "historicalTradingRewardAggregations/{address}", "indexer", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function indexerGetOrderbooksPerpetualMarketMarket(self::Dydx, params=Dict(), context=Dict())
    return request(self, "orderbooks/perpetualMarket/{market}", "indexer", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function indexerGetOrders(self::Dydx, params=Dict(), context=Dict())
    return request(self, "orders", "indexer", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function indexerGetOrdersParentSubaccountNumber(self::Dydx, params=Dict(), context=Dict())
    return request(self, "orders/parentSubaccountNumber", "indexer", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function indexerGetOrdersOrderId(self::Dydx, params=Dict(), context=Dict())
    return request(self, "orders/{orderId}", "indexer", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function indexerGetPerpetualMarkets(self::Dydx, params=Dict(), context=Dict())
    return request(self, "perpetualMarkets", "indexer", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function indexerGetPerpetualPositions(self::Dydx, params=Dict(), context=Dict())
    return request(self, "perpetualPositions", "indexer", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function indexerGetPerpetualPositionsParentSubaccountNumber(self::Dydx, params=Dict(), context=Dict())
    return request(self, "perpetualPositions/parentSubaccountNumber", "indexer", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function indexerGetScreen(self::Dydx, params=Dict(), context=Dict())
    return request(self, "screen", "indexer", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function indexerGetSparklines(self::Dydx, params=Dict(), context=Dict())
    return request(self, "sparklines", "indexer", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function indexerGetTime(self::Dydx, params=Dict(), context=Dict())
    return request(self, "time", "indexer", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function indexerGetTradesPerpetualMarketMarket(self::Dydx, params=Dict(), context=Dict())
    return request(self, "trades/perpetualMarket/{market}", "indexer", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function indexerGetTransfers(self::Dydx, params=Dict(), context=Dict())
    return request(self, "transfers", "indexer", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function indexerGetTransfersBetween(self::Dydx, params=Dict(), context=Dict())
    return request(self, "transfers/between", "indexer", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function indexerGetTransfersParentSubaccountNumber(self::Dydx, params=Dict(), context=Dict())
    return request(self, "transfers/parentSubaccountNumber", "indexer", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function indexerGetVaultV1MegavaultHistoricalPnl(self::Dydx, params=Dict(), context=Dict())
    return request(self, "vault/v1/megavault/historicalPnl", "indexer", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function indexerGetVaultV1MegavaultPositions(self::Dydx, params=Dict(), context=Dict())
    return request(self, "vault/v1/megavault/positions", "indexer", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function indexerGetVaultV1VaultsHistoricalPnl(self::Dydx, params=Dict(), context=Dict())
    return request(self, "vault/v1/vaults/historicalPnl", "indexer", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function indexerGetPerpetualMarketSparklines(self::Dydx, params=Dict(), context=Dict())
    return request(self, "perpetualMarketSparklines", "indexer", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function indexerGetPerpetualMarketsTicker(self::Dydx, params=Dict(), context=Dict())
    return request(self, "perpetualMarkets/{ticker}", "indexer", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function indexerGetPerpetualMarketsTickerOrderbook(self::Dydx, params=Dict(), context=Dict())
    return request(self, "perpetualMarkets/{ticker}/orderbook", "indexer", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function indexerGetTradesPerpetualMarketTicker(self::Dydx, params=Dict(), context=Dict())
    return request(self, "trades/perpetualMarket/{ticker}", "indexer", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function indexerGetHistoricalFundingTicker(self::Dydx, params=Dict(), context=Dict())
    return request(self, "historicalFunding/{ticker}", "indexer", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function indexerGetCandlesTickerResolution(self::Dydx, params=Dict(), context=Dict())
    return request(self, "candles/{ticker}/{resolution}", "indexer", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function indexerGetAddressesAddressSubaccounts(self::Dydx, params=Dict(), context=Dict())
    return request(self, "addresses/{address}/subaccounts", "indexer", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function indexerGetAddressesAddressSubaccountNumberSubaccountNumberAssetPositions(self::Dydx, params=Dict(), context=Dict())
    return request(self, "addresses/{address}/subaccountNumber/{subaccountNumber}/assetPositions", "indexer", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function indexerGetAddressesAddressSubaccountNumberSubaccountNumberPerpetualPositions(self::Dydx, params=Dict(), context=Dict())
    return request(self, "addresses/{address}/subaccountNumber/{subaccountNumber}/perpetualPositions", "indexer", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function indexerGetAddressesAddressSubaccountNumberSubaccountNumberOrders(self::Dydx, params=Dict(), context=Dict())
    return request(self, "addresses/{address}/subaccountNumber/{subaccountNumber}/orders", "indexer", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function indexerGetFillsParentSubaccount(self::Dydx, params=Dict(), context=Dict())
    return request(self, "fills/parentSubaccount", "indexer", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function indexerGetHistoricalPnlParentSubaccount(self::Dydx, params=Dict(), context=Dict())
    return request(self, "historical-pnl/parentSubaccount", "indexer", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function nodeRpcGetAbciInfo(self::Dydx, params=Dict(), context=Dict())
    return request(self, "abci_info", "nodeRpc", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function nodeRpcGetBlock(self::Dydx, params=Dict(), context=Dict())
    return request(self, "block", "nodeRpc", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function nodeRpcGetBroadcastTxAsync(self::Dydx, params=Dict(), context=Dict())
    return request(self, "broadcast_tx_async", "nodeRpc", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function nodeRpcGetBroadcastTxSync(self::Dydx, params=Dict(), context=Dict())
    return request(self, "broadcast_tx_sync", "nodeRpc", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function nodeRpcGetTx(self::Dydx, params=Dict(), context=Dict())
    return request(self, "tx", "nodeRpc", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function nodeRestGetCosmosAuthV1beta1AccountInfoDydxAddress(self::Dydx, params=Dict(), context=Dict())
    return request(self, "cosmos/auth/v1beta1/account_info/{dydxAddress}", "nodeRest", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function nodeRestPostCosmosTxV1beta1Encode(self::Dydx, params=Dict(), context=Dict())
    return request(self, "cosmos/tx/v1beta1/encode", "nodeRest", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function nodeRestPostCosmosTxV1beta1Simulate(self::Dydx, params=Dict(), context=Dict())
    return request(self, "cosmos/tx/v1beta1/simulate", "nodeRest", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function Dydx(; kwargs...)
    inst = Dydx(Exchange(), describe, fetchTime, parseMarket, fetchMarkets, parseTrade, fetchTrades, parseOHLCV, fetchOHLCV, fetchFundingRateHistory, handlePublicAddress, parseOrder, parseOrderStatus, parseOrderType, fetchOrder, fetchOrders, fetchOpenOrders, fetchClosedOrders, parsePosition, fetchPosition, fetchPositions, hashMessage, signHash, signMessage, signOnboardingAction, signDydxTx, retrieveCredentials, fetchDydxAccount, pow, createOrderRequest, createOrderIdFromParts, fetchLatestBlockHeight, createOrder, cancelOrder, cancelOrders, fetchOrderBook, parseLedgerEntry, parseLedgerEntryType, fetchLedger, estimateTxFee, transfer, parseTransfer, fetchTransfers, parseTransaction, withdraw, fetchWithdrawals, fetchDeposits, fetchDepositsWithdrawals, fetchTransactionsHelper, fetchAccounts, fetchBalance, parseBalance, nonce, getWalletAddress, sign, handleErrors, setSandboxMode, indexerGetAddressesAddress, indexerGetAddressesAddressParentSubaccountNumberNumber, indexerGetAddressesAddressSubaccountNumberSubaccountNumber, indexerGetAssetPositions, indexerGetAssetPositionsParentSubaccountNumber, indexerGetCandlesPerpetualMarketsMarket, indexerGetComplianceScreenAddress, indexerGetFills, indexerGetFillsParentSubaccountNumber, indexerGetFundingPayments, indexerGetFundingPaymentsParentSubaccount, indexerGetHeight, indexerGetHistoricalPnl, indexerGetHistoricalPnlParentSubaccountNumber, indexerGetHistoricalBlockTradingRewardsAddress, indexerGetHistoricalFundingMarket, indexerGetHistoricalTradingRewardAggregationsAddress, indexerGetOrderbooksPerpetualMarketMarket, indexerGetOrders, indexerGetOrdersParentSubaccountNumber, indexerGetOrdersOrderId, indexerGetPerpetualMarkets, indexerGetPerpetualPositions, indexerGetPerpetualPositionsParentSubaccountNumber, indexerGetScreen, indexerGetSparklines, indexerGetTime, indexerGetTradesPerpetualMarketMarket, indexerGetTransfers, indexerGetTransfersBetween, indexerGetTransfersParentSubaccountNumber, indexerGetVaultV1MegavaultHistoricalPnl, indexerGetVaultV1MegavaultPositions, indexerGetVaultV1VaultsHistoricalPnl, indexerGetPerpetualMarketSparklines, indexerGetPerpetualMarketsTicker, indexerGetPerpetualMarketsTickerOrderbook, indexerGetTradesPerpetualMarketTicker, indexerGetHistoricalFundingTicker, indexerGetCandlesTickerResolution, indexerGetAddressesAddressSubaccounts, indexerGetAddressesAddressSubaccountNumberSubaccountNumberAssetPositions, indexerGetAddressesAddressSubaccountNumberSubaccountNumberPerpetualPositions, indexerGetAddressesAddressSubaccountNumberSubaccountNumberOrders, indexerGetFillsParentSubaccount, indexerGetHistoricalPnlParentSubaccount, nodeRpcGetAbciInfo, nodeRpcGetBlock, nodeRpcGetBroadcastTxAsync, nodeRpcGetBroadcastTxSync, nodeRpcGetTx, nodeRestGetCosmosAuthV1beta1AccountInfoDydxAddress, nodeRestPostCosmosTxV1beta1Encode, nodeRestPostCosmosTxV1beta1Simulate)
    desc = inst.describe()
    for (k, v) in desc
        inst[Symbol(k)] = v
    end
    return inst
end
