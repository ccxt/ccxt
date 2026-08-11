@kwdef mutable struct Lbank <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchTime::Function = fetchTime
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    fetchMarkets::Function = fetchMarkets
    fetchSpotMarkets::Function = fetchSpotMarkets
    fetchSwapMarkets::Function = fetchSwapMarkets
    parseTicker::Function = parseTicker
    fetchTicker::Function = fetchTicker
    fetchTickers::Function = fetchTickers
    fetchOrderBook::Function = fetchOrderBook
    parseTrade::Function = parseTrade
    fetchTrades::Function = fetchTrades
    parseOHLCV::Function = parseOHLCV
    fetchOHLCV::Function = fetchOHLCV
    parseBalance::Function = parseBalance
    parseFundingRate::Function = parseFundingRate
    fetchFundingRate::Function = fetchFundingRate
    fetchFundingRates::Function = fetchFundingRates
    fetchBalance::Function = fetchBalance
    parseTradingFee::Function = parseTradingFee
    fetchTradingFee::Function = fetchTradingFee
    fetchTradingFees::Function = fetchTradingFees
    createMarketBuyOrderWithCost::Function = createMarketBuyOrderWithCost
    createOrder::Function = createOrder
    parseOrderStatus::Function = parseOrderStatus
    parseOrder::Function = parseOrder
    fetchOrder::Function = fetchOrder
    fetchOrderSupplement::Function = fetchOrderSupplement
    fetchOrderDefault::Function = fetchOrderDefault
    fetchMyTrades::Function = fetchMyTrades
    fetchOrders::Function = fetchOrders
    fetchOpenOrders::Function = fetchOpenOrders
    cancelOrder::Function = cancelOrder
    cancelAllOrders::Function = cancelAllOrders
    getNetworkCodeForCurrency::Function = getNetworkCodeForCurrency
    fetchDepositAddress::Function = fetchDepositAddress
    fetchDepositAddressDefault::Function = fetchDepositAddressDefault
    fetchDepositAddressSupplement::Function = fetchDepositAddressSupplement
    withdraw::Function = withdraw
    parseTransactionStatus::Function = parseTransactionStatus
    parseTransaction::Function = parseTransaction
    fetchDeposits::Function = fetchDeposits
    fetchWithdrawals::Function = fetchWithdrawals
    fetchTransactionFees::Function = fetchTransactionFees
    fetchPrivateTransactionFees::Function = fetchPrivateTransactionFees
    fetchPublicTransactionFees::Function = fetchPublicTransactionFees
    fetchDepositWithdrawFees::Function = fetchDepositWithdrawFees
    fetchPrivateDepositWithdrawFees::Function = fetchPrivateDepositWithdrawFees
    fetchPublicDepositWithdrawFees::Function = fetchPublicDepositWithdrawFees
    parsePublicDepositWithdrawFees::Function = parsePublicDepositWithdrawFees
    parseDepositWithdrawFee::Function = parseDepositWithdrawFee
    sign::Function = sign
    convertSecretToPem::Function = convertSecretToPem
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    spotPublicGetCurrencyPairs::Function = spotPublicGetCurrencyPairs
    spotPublicGetAccuracy::Function = spotPublicGetAccuracy
    spotPublicGetUsdToCny::Function = spotPublicGetUsdToCny
    spotPublicGetAssetConfigs::Function = spotPublicGetAssetConfigs
    spotPublicGetWithdrawConfigs::Function = spotPublicGetWithdrawConfigs
    spotPublicGetTimestamp::Function = spotPublicGetTimestamp
    spotPublicGetTicker24hr::Function = spotPublicGetTicker24hr
    spotPublicGetTicker::Function = spotPublicGetTicker
    spotPublicGetDepth::Function = spotPublicGetDepth
    spotPublicGetIncrDepth::Function = spotPublicGetIncrDepth
    spotPublicGetTrades::Function = spotPublicGetTrades
    spotPublicGetKline::Function = spotPublicGetKline
    spotPublicGetSupplementSystemPing::Function = spotPublicGetSupplementSystemPing
    spotPublicGetSupplementIncrDepth::Function = spotPublicGetSupplementIncrDepth
    spotPublicGetSupplementTrades::Function = spotPublicGetSupplementTrades
    spotPublicGetSupplementTickerPrice::Function = spotPublicGetSupplementTickerPrice
    spotPublicGetSupplementTickerBookTicker::Function = spotPublicGetSupplementTickerBookTicker
    spotPublicPostSupplementSystemStatus::Function = spotPublicPostSupplementSystemStatus
    spotPrivatePostUserInfo::Function = spotPrivatePostUserInfo
    spotPrivatePostSubscribeGetKey::Function = spotPrivatePostSubscribeGetKey
    spotPrivatePostSubscribeRefreshKey::Function = spotPrivatePostSubscribeRefreshKey
    spotPrivatePostSubscribeDestroyKey::Function = spotPrivatePostSubscribeDestroyKey
    spotPrivatePostGetDepositAddress::Function = spotPrivatePostGetDepositAddress
    spotPrivatePostDepositHistory::Function = spotPrivatePostDepositHistory
    spotPrivatePostCreateOrder::Function = spotPrivatePostCreateOrder
    spotPrivatePostBatchCreateOrder::Function = spotPrivatePostBatchCreateOrder
    spotPrivatePostCancelOrder::Function = spotPrivatePostCancelOrder
    spotPrivatePostCancelClientOrders::Function = spotPrivatePostCancelClientOrders
    spotPrivatePostOrdersInfo::Function = spotPrivatePostOrdersInfo
    spotPrivatePostOrdersInfoHistory::Function = spotPrivatePostOrdersInfoHistory
    spotPrivatePostOrderTransactionDetail::Function = spotPrivatePostOrderTransactionDetail
    spotPrivatePostTransactionHistory::Function = spotPrivatePostTransactionHistory
    spotPrivatePostOrdersInfoNoDeal::Function = spotPrivatePostOrdersInfoNoDeal
    spotPrivatePostWithdraw::Function = spotPrivatePostWithdraw
    spotPrivatePostWithdrawCancel::Function = spotPrivatePostWithdrawCancel
    spotPrivatePostWithdraws::Function = spotPrivatePostWithdraws
    spotPrivatePostSupplementUserInfo::Function = spotPrivatePostSupplementUserInfo
    spotPrivatePostSupplementWithdraw::Function = spotPrivatePostSupplementWithdraw
    spotPrivatePostSupplementDepositHistory::Function = spotPrivatePostSupplementDepositHistory
    spotPrivatePostSupplementWithdraws::Function = spotPrivatePostSupplementWithdraws
    spotPrivatePostSupplementGetDepositAddress::Function = spotPrivatePostSupplementGetDepositAddress
    spotPrivatePostSupplementAssetDetail::Function = spotPrivatePostSupplementAssetDetail
    spotPrivatePostSupplementCustomerTradeFee::Function = spotPrivatePostSupplementCustomerTradeFee
    spotPrivatePostSupplementApiRestrictions::Function = spotPrivatePostSupplementApiRestrictions
    spotPrivatePostSupplementSystemPing::Function = spotPrivatePostSupplementSystemPing
    spotPrivatePostSupplementCreateOrderTest::Function = spotPrivatePostSupplementCreateOrderTest
    spotPrivatePostSupplementCreateOrder::Function = spotPrivatePostSupplementCreateOrder
    spotPrivatePostSupplementCancelOrder::Function = spotPrivatePostSupplementCancelOrder
    spotPrivatePostSupplementCancelOrderBySymbol::Function = spotPrivatePostSupplementCancelOrderBySymbol
    spotPrivatePostSupplementOrdersInfo::Function = spotPrivatePostSupplementOrdersInfo
    spotPrivatePostSupplementOrdersInfoNoDeal::Function = spotPrivatePostSupplementOrdersInfoNoDeal
    spotPrivatePostSupplementOrdersInfoHistory::Function = spotPrivatePostSupplementOrdersInfoHistory
    spotPrivatePostSupplementUserInfoAccount::Function = spotPrivatePostSupplementUserInfoAccount
    spotPrivatePostSupplementTransactionHistory::Function = spotPrivatePostSupplementTransactionHistory
    contractPublicGetCfdOpenApiV1PubGetTime::Function = contractPublicGetCfdOpenApiV1PubGetTime
    contractPublicGetCfdOpenApiV1PubInstrument::Function = contractPublicGetCfdOpenApiV1PubInstrument
    contractPublicGetCfdOpenApiV1PubMarketData::Function = contractPublicGetCfdOpenApiV1PubMarketData
    contractPublicGetCfdOpenApiV1PubMarketOrder::Function = contractPublicGetCfdOpenApiV1PubMarketOrder

end
function describe(self::Lbank, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "lbank",
    Symbol("name") => "LBank",
    Symbol("countries") => ["CN"],
    Symbol("version") => "v2",
    Symbol("rateLimit") => 20,
    Symbol("pro") => true,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => false,
        Symbol("spot") => true,
        Symbol("margin") => false,
        Symbol("swap") => nothing,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("addMargin") => false,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelOrder") => true,
        Symbol("createMarketBuyOrderWithCost") => true,
        Symbol("createMarketOrderWithCost") => false,
        Symbol("createMarketSellOrderWithCost") => false,
        Symbol("createOrder") => true,
        Symbol("createReduceOnlyOrder") => false,
        Symbol("createStopLimitOrder") => false,
        Symbol("createStopMarketOrder") => false,
        Symbol("createStopOrder") => false,
        Symbol("fetchBalance") => true,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchClosedOrders") => false,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDepositAddress") => true,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => false,
        Symbol("fetchDeposits") => true,
        Symbol("fetchDepositWithdrawFee") => "emulated",
        Symbol("fetchDepositWithdrawFees") => true,
        Symbol("fetchFundingHistory") => false,
        Symbol("fetchFundingRate") => true,
        Symbol("fetchFundingRateHistory") => false,
        Symbol("fetchFundingRates") => true,
        Symbol("fetchIndexOHLCV") => false,
        Symbol("fetchIsolatedBorrowRate") => false,
        Symbol("fetchIsolatedBorrowRates") => false,
        Symbol("fetchIsolatedPositions") => false,
        Symbol("fetchLeverage") => false,
        Symbol("fetchLeverageTiers") => false,
        Symbol("fetchMarginMode") => false,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => false,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrders") => true,
        Symbol("fetchPosition") => false,
        Symbol("fetchPositionMode") => false,
        Symbol("fetchPositions") => false,
        Symbol("fetchPositionsRisk") => false,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => true,
        Symbol("fetchTradingFees") => true,
        Symbol("fetchTransactionFees") => true,
        Symbol("fetchWithdrawals") => true,
        Symbol("reduceMargin") => false,
        Symbol("setLeverage") => false,
        Symbol("setMarginMode") => false,
        Symbol("setPositionMode") => false,
        Symbol("withdraw") => true
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "minute1",
        Symbol("5m") => "minute5",
        Symbol("15m") => "minute15",
        Symbol("30m") => "minute30",
        Symbol("1h") => "hour1",
        Symbol("2h") => "hour2",
        Symbol("4h") => "hour4",
        Symbol("6h") => "hour6",
        Symbol("8h") => "hour8",
        Symbol("12h") => "hour12",
        Symbol("1d") => "day1",
        Symbol("1w") => "week1"
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://user-images.githubusercontent.com/1294454/38063602-9605e28a-3302-11e8-81be-64b1e53c4cfb.jpg",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("rest") => "https://api.lbank.info",
            Symbol("contract") => "https://lbkperp.lbank.com"
        ),
        Symbol("api2") => "https://api.lbkex.com",
        Symbol("www") => "https://www.lbank.com",
        Symbol("doc") => "https://www.lbank.com/en-US/docs/index.html",
        Symbol("fees") => "https://support.lbank.site/hc/en-gb/articles/900000535703-Trading-Fees-From-14-00-on-April-7-2020-UTC-8-",
        Symbol("referral") => "https://www.lbank.com/login/?icode=7QCY"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("public") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("currencyPairs") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                    Symbol("accuracy") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                    Symbol("usdToCny") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                    Symbol("assetConfigs") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                    Symbol("withdrawConfigs") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5 * 1.5
),
                    Symbol("timestamp") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                    Symbol("ticker/24hr") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                    Symbol("ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                    Symbol("depth") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                    Symbol("incrDepth") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                    Symbol("trades") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                    Symbol("kline") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                    Symbol("supplement/system_ping") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                    Symbol("supplement/incrDepth") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                    Symbol("supplement/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                    Symbol("supplement/ticker/price") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                    Symbol("supplement/ticker/bookTicker") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
)
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("supplement/system_status") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
)
                )
            ),
            Symbol("private") => Dict{Symbol, Any}(
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("user_info") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                    Symbol("subscribe/get_key") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                    Symbol("subscribe/refresh_key") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                    Symbol("subscribe/destroy_key") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                    Symbol("get_deposit_address") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                    Symbol("deposit_history") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                    Symbol("create_order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("batch_create_order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("cancel_order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("cancel_clientOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("orders_info") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                    Symbol("orders_info_history") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                    Symbol("order_transaction_detail") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                    Symbol("transaction_history") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                    Symbol("orders_info_no_deal") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                    Symbol("withdraw") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                    Symbol("withdrawCancel") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                    Symbol("withdraws") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                    Symbol("supplement/user_info") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                    Symbol("supplement/withdraw") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                    Symbol("supplement/deposit_history") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                    Symbol("supplement/withdraws") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                    Symbol("supplement/get_deposit_address") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                    Symbol("supplement/asset_detail") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                    Symbol("supplement/customer_trade_fee") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                    Symbol("supplement/api_Restrictions") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                    Symbol("supplement/system_ping") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                    Symbol("supplement/create_order_test") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("supplement/create_order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("supplement/cancel_order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("supplement/cancel_order_by_symbol") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("supplement/orders_info") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                    Symbol("supplement/orders_info_no_deal") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                    Symbol("supplement/orders_info_history") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                    Symbol("supplement/user_info_account") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                    Symbol("supplement/transaction_history") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
)
                )
            )
        ),
        Symbol("contract") => Dict{Symbol, Any}(
            Symbol("public") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("cfd/openApi/v1/pub/getTime") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                    Symbol("cfd/openApi/v1/pub/instrument") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                    Symbol("cfd/openApi/v1/pub/marketData") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                    Symbol("cfd/openApi/v1/pub/marketOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
)
                )
            )
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("maker") => self.parseNumber("0.001"),
            Symbol("taker") => self.parseNumber("0.001")
        ),
        Symbol("funding") => Dict{Symbol, Any}(
            Symbol("withdraw") => Dict{Symbol, Any}()
        )
    ),
    Symbol("commonCurrencies") => Dict{Symbol, Any}(
        Symbol("XBT") => "XBT",
        Symbol("HIT") => "Hiver",
        Symbol("VET_ERC20") => "VEN",
        Symbol("PNT") => "Penta"
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("cacheSecretAsPem") => true,
        Symbol("createMarketBuyOrderRequiresPrice") => true,
        Symbol("fetchTrades") => Dict{Symbol, Any}(
            Symbol("method") => "spotPublicGetTrades"
        ),
        Symbol("fetchTransactionFees") => Dict{Symbol, Any}(
            Symbol("method") => "fetchPrivateTransactionFees"
        ),
        Symbol("fetchDepositWithdrawFees") => Dict{Symbol, Any}(
            Symbol("method") => "fetchPrivateDepositWithdrawFees"
        ),
        Symbol("fetchDepositAddress") => Dict{Symbol, Any}(
            Symbol("method") => "fetchDepositAddressDefault"
        ),
        Symbol("createOrder") => Dict{Symbol, Any}(
            Symbol("method") => "spotPrivatePostSupplementCreateOrder"
        ),
        Symbol("fetchOrder") => Dict{Symbol, Any}(
            Symbol("method") => "fetchOrderSupplement"
        ),
        Symbol("fetchBalance") => Dict{Symbol, Any}(
            Symbol("method") => "spotPrivatePostSupplementUserInfo"
        ),
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("ERC20") => "erc20",
            Symbol("ETH") => "erc20",
            Symbol("TRC20") => "trc20",
            Symbol("TRX") => "trc20",
            Symbol("OMNI") => "omni",
            Symbol("ASA") => "asa",
            Symbol("BEP20") => "bep20(bsc)",
            Symbol("BSC") => "bep20(bsc)",
            Symbol("HT") => "heco",
            Symbol("BNB") => "bep2",
            Symbol("BTC") => "btc",
            Symbol("DOGE") => "dogecoin",
            Symbol("MATIC") => "matic",
            Symbol("POLYGON") => "matic",
            Symbol("OEC") => "oec",
            Symbol("BTCTRON") => "btctron",
            Symbol("XRP") => "xrp"
        ),
        Symbol("networksById") => Dict{Symbol, Any}(
            Symbol("erc20") => "ERC20",
            Symbol("trc20") => "TRC20",
            Symbol("TRX") => "TRC20",
            Symbol("bep20(bsc)") => "BEP20",
            Symbol("bep20") => "BEP20"
        ),
        Symbol("defaultNetworks") => Dict{Symbol, Any}(
            Symbol("USDT") => "TRC20"
        )
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("default") => Dict{Symbol, Any}(
            Symbol("sandbox") => false,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("triggerPrice") => false,
                Symbol("triggerPriceType") => nothing,
                Symbol("triggerDirection") => false,
                Symbol("stopLossPrice") => false,
                Symbol("takeProfitPrice") => false,
                Symbol("attachedStopLossTakeProfit") => nothing,
                Symbol("timeInForce") => Dict{Symbol, Any}(
                    Symbol("IOC") => true,
                    Symbol("FOK") => true,
                    Symbol("PO") => false,
                    Symbol("GTD") => false
                ),
                Symbol("hedged") => false,
                Symbol("selfTradePrevention") => false,
                Symbol("trailing") => false,
                Symbol("leverage") => false,
                Symbol("marketBuyByCost") => true,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("iceberg") => false
            ),
            Symbol("createOrders") => nothing,
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => 100000,
                Symbol("untilDays") => 2,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 200,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 200,
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => nothing,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchClosedOrders") => nothing,
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 2000
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
            Symbol("linear") => nothing,
            Symbol("inverse") => nothing
        )
    )
))

end
function fetchTime(self::Lbank, params=Dict())
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchTime", nothing, params);
    if functions.ccxtruthy(type_var == "swap")
        response = Base.fetch(self.contractPublicGetCfdOpenApiV1PubGetTime(params));
    else
        response = Base.fetch(self.spotPublicGetTimestamp(params));
    end
    return safeInteger(response, "data")

end
function fetchCurrencies(self::Lbank, params=Dict())
    response = Base.fetch(self.spotPublicGetWithdrawConfigs(params));
    currenciesData = self.safeList(response, "data", []);
    grouped = groupBy(currenciesData, "assetCode");
    values_var = objectValues(grouped);
    return self.parseCurrencies(values_var)

end
function parseCurrency(self::Lbank, rawCurrency)
    id = safeString(get(rawCurrency, 1, nothing), "assetCode");
    code = self.safeCurrencyCode(id);
    networksRaw = rawCurrency;
    networks = Dict{Symbol, Any}();
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(networksRaw)))
        networkEntry = get(networksRaw, j + 1, nothing);
        networkId = safeString(networkEntry, "chain");
        if functions.ccxtruthy(networkId == nothing)
            networkId = safeString(networkEntry, "assetCode");
        end
        networkCode = self.networkIdToCode(networkId, code);
        if functions.ccxtruthy(networkCode != nothing)
            networks[Symbol(networkCode)] = Dict{Symbol, Any}(
                Symbol("id") => networkId,
                Symbol("network") => networkCode,
                Symbol("limits") => Dict{Symbol, Any}(
                    Symbol("withdraw") => Dict{Symbol, Any}(
                        Symbol("min") => self.safeNumber(networkEntry, "min"),
                        Symbol("max") => nothing
                    ),
                    Symbol("deposit") => Dict{Symbol, Any}(
                        Symbol("min") => self.safeNumber(networkEntry, "minTransfer"),
                        Symbol("max") => nothing
                    )
                ),
                Symbol("active") => nothing,
                Symbol("deposit") => nothing,
                Symbol("withdraw") => self.safeBool(networkEntry, "canWithDraw"),
                Symbol("fee") => self.safeNumber(networkEntry, "fee"),
                Symbol("precision") => self.parseNumber(self.parsePrecision(safeString(networkEntry, "transferAmtScale"))),
                Symbol("info") => networkEntry
            );
        end
        j += 1
    end
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("code") => code,
    Symbol("precision") => nothing,
    Symbol("type") => nothing,
    Symbol("name") => nothing,
    Symbol("active") => nothing,
    Symbol("deposit") => nothing,
    Symbol("withdraw") => nothing,
    Symbol("fee") => nothing,
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("deposit") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    ),
    Symbol("networks") => networks,
    Symbol("info") => networksRaw
))

end
function fetchMarkets(self::Lbank, params=Dict())
    marketsPromises = [self.fetchSpotMarkets(params), self.fetchSwapMarkets(params)];
    resolvedMarkets = Base.fetch(asyncmap(Base.fetch, marketsPromises));
    return arrayConcat(get(resolvedMarkets, 1, nothing), get(resolvedMarkets, 2, nothing))

end
function fetchSpotMarkets(self::Lbank, params=Dict())
    response = Base.fetch(self.spotPublicGetAccuracy(params));
    data = safeValue(response, "data", []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        market = get(data, i + 1, nothing);
        marketId = safeString(market, "symbol");
        parts = split(marketId, "_");
        baseId = get(parts, 1, nothing);
        quoteId = get(parts, 2, nothing);
        base = self.safeCurrencyCode(baseId);
        quote_var = self.safeCurrencyCode(quoteId);
        symbol = string(base, "/", quote_var);
        push!(result, Dict{Symbol, Any}(
    Symbol("id") => marketId,
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settle") => nothing,
    Symbol("settleId") => nothing,
    Symbol("type") => "spot",
    Symbol("spot") => true,
    Symbol("margin") => false,
    Symbol("swap") => false,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => true,
    Symbol("contract") => false,
    Symbol("linear") => nothing,
    Symbol("inverse") => nothing,
    Symbol("contractSize") => nothing,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.parseNumber(self.parsePrecision(safeString(market, "quantityAccuracy"))),
        Symbol("price") => self.parseNumber(self.parsePrecision(safeString(market, "priceAccuracy")))
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "minTranQua"),
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
));
        i += 1
    end
    return result

end
function fetchSwapMarkets(self::Lbank, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("productGroup") => "SwapU"
    );
    response = Base.fetch(self.contractPublicGetCfdOpenApiV1PubInstrument(extend(request, params)));
    data = safeValue(response, "data", []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        market = get(data, i + 1, nothing);
        marketId = safeString(market, "symbol");
        baseId = safeString(market, "baseCurrency");
        settleId = safeString(market, "clearCurrency");
        quoteId = settleId;
        base = self.safeCurrencyCode(baseId);
        quote_var = self.safeCurrencyCode(quoteId);
        settle = self.safeCurrencyCode(settleId);
        symbol = string(base, "/", quote_var, ":", settle);
        push!(result, Dict{Symbol, Any}(
    Symbol("id") => marketId,
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => settle,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => settleId,
    Symbol("type") => "swap",
    Symbol("spot") => false,
    Symbol("margin") => false,
    Symbol("swap") => true,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => true,
    Symbol("contract") => true,
    Symbol("linear") => true,
    Symbol("inverse") => false,
    Symbol("contractSize") => self.safeNumber(market, "volumeMultiple"),
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.safeNumber(market, "volumeTick"),
        Symbol("price") => self.safeNumber(market, "priceTick")
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "minOrderVolume"),
            Symbol("max") => self.safeNumber(market, "maxOrderVolume")
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "priceLimitLowerValue"),
            Symbol("max") => self.safeNumber(market, "priceLimitUpperValue")
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "minOrderCost"),
            Symbol("max") => nothing
        )
    ),
    Symbol("created") => nothing,
    Symbol("info") => market
));
        i += 1
    end
    return result

end
function parseTicker(self::Lbank, ticker, market=nothing)
    timestamp = safeInteger(ticker, "timestamp");
    if functions.ccxtruthy(timestamp == nothing)
        timestamp = safeTimestamp(ticker, "lastTime");
    end
    marketId = safeString(ticker, "symbol");
    symbol = self.safeSymbol(marketId, market);
    tickerData = safeValue(ticker, "ticker", Dict{Symbol, Any}());
    market = self.safeMarket(marketId, market);
    data = functions.ccxtruthy((get(market, Symbol("contract"), nothing))) ? ticker : tickerData;
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => safeString2(data, "high", "highestPrice"),
    Symbol("low") => safeString2(data, "low", "lowestPrice"),
    Symbol("bid") => nothing,
    Symbol("bidVolume") => nothing,
    Symbol("ask") => nothing,
    Symbol("askVolume") => nothing,
    Symbol("vwap") => nothing,
    Symbol("open") => safeString(data, "openPrice"),
    Symbol("close") => nothing,
    Symbol("last") => safeString2(data, "latest", "lastPrice"),
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => safeString(data, "change"),
    Symbol("average") => nothing,
    Symbol("baseVolume") => safeString2(data, "vol", "volume"),
    Symbol("quoteVolume") => safeString(data, "turnover"),
    Symbol("info") => ticker
), market)

end
function fetchTicker(self::Lbank, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        responseForSwap = Base.fetch(self.fetchTickers([get(market, Symbol("symbol"), nothing)], params));
            return safeValue(responseForSwap, get(market, Symbol("symbol"), nothing))
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.spotPublicGetTicker24hr(extend(request, params)));
    data = safeValue(response, "data", []);
    first_var = self.safeDict(data, 0, Dict{Symbol, Any}());
    return self.parseTicker(first_var, market)

end
function fetchTickers(self::Lbank, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbols != nothing)
        symbols = self.marketSymbols(symbols);
        symbolsLength = length(symbols);
        if functions.ccxtruthy(functions.ccxt_gt(symbolsLength, 0))
            market = self.market(get(symbols, 1, nothing));
        end
    end
    request = Dict{Symbol, Any}();
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchTickers", market, params);
    if functions.ccxtruthy(type_var == "swap")
        request[Symbol("productGroup")] = "SwapU";
        response = Base.fetch(self.contractPublicGetCfdOpenApiV1PubMarketData(extend(request, params)));
    else
        request[Symbol("symbol")] = "all";
        response = Base.fetch(self.spotPublicGetTicker24hr(extend(request, params)));
    end
    data = self.safeList(response, "data", []);
    return self.parseTickers(data, symbols)

end
function fetchOrderBook(self::Lbank, symbol, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(limit == nothing)
        limit = 60;
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchOrderBook", market, params);
    if functions.ccxtruthy(type_var == "swap")
        request[Symbol("depth")] = limit;
        response = Base.fetch(self.contractPublicGetCfdOpenApiV1PubMarketOrder(extend(request, params)));
    else
        request[Symbol("size")] = limit;
        response = Base.fetch(self.spotPublicGetDepth(extend(request, params)));
    end
    orderbook = safeValue(response, "data", Dict{Symbol, Any}());
    timestamp = milliseconds();
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
            return self.parseOrderBook(orderbook, get(market, Symbol("symbol"), nothing), timestamp, "bids", "asks", "price", "volume")
    end
    return self.parseOrderBook(orderbook, get(market, Symbol("symbol"), nothing), timestamp, "bids", "asks")

end
function parseTrade(self::Lbank, trade, market=nothing)
    timestamp = safeInteger2(trade, "date_ms", "time");
    if functions.ccxtruthy(timestamp == nothing)
        timestamp = safeInteger(trade, "dealTime");
    end
    amountString = safeString2(trade, "amount", "qty");
    if functions.ccxtruthy(amountString == nothing)
        amountString = safeString(trade, "dealQuantity");
    end
    priceString = safeString(trade, "price");
    if functions.ccxtruthy(priceString == nothing)
        priceString = safeString(trade, "dealPrice");
    end
    costString = safeString(trade, "quoteQty");
    if functions.ccxtruthy(costString == nothing)
        costString = safeString(trade, "dealVolumePrice");
    end
    side = safeString2(trade, "tradeType", "type");
    type_var = nothing;
    takerOrMaker = nothing;
    if functions.ccxtruthy(side != nothing)
        parts = split(side, "_");
        side = safeString(parts, 0);
        typePart = safeString(parts, 1);
        type_var = "limit";
        takerOrMaker = "taker";
        if functions.ccxtruthy(typePart != nothing)
            if functions.ccxtruthy(typePart == "market")
                type_var = "market";
            elseif functions.ccxtruthy(typePart == "maker")
                takerOrMaker = "maker";
            end
        end
    end
    id = safeString2(trade, "tid", "id");
    if functions.ccxtruthy(id == nothing)
        id = safeString(trade, "txUuid");
    end
    order = safeString(trade, "orderUuid");
    symbol = self.safeSymbol(nothing, market);
    fee = nothing;
    feeCost = safeString(trade, "tradeFee");
    if functions.ccxtruthy(feeCost != nothing)
        feeCurr = functions.ccxtruthy((side == "buy")) ? safeString(market, "base") : safeString(market, "quote");
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCost,
            Symbol("currency") => feeCurr,
            Symbol("rate") => safeString(trade, "tradeFeeRate")
        );
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => symbol,
    Symbol("id") => id,
    Symbol("order") => order,
    Symbol("type") => type_var,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("side") => side,
    Symbol("price") => priceString,
    Symbol("amount") => amountString,
    Symbol("cost") => costString,
    Symbol("fee") => fee,
    Symbol("info") => trade
), market)

end
function fetchTrades(self::Lbank, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("time")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("size")] = min(limit, 600);
    else
        request[Symbol("size")] = 600;
    end
    options = safeValue(self.options, "fetchTrades", Dict{Symbol, Any}());
    defaultMethod = safeString(options, "method", "spotPublicGetTrades");
    method = safeString(params, "method", defaultMethod);
    params = omit(params, "method");
    if functions.ccxtruthy(method == "spotPublicGetSupplementTrades")
        response = Base.fetch(self.spotPublicGetSupplementTrades(extend(request, params)));
    else
        response = Base.fetch(self.spotPublicGetTrades(extend(request, params)));
    end
    trades = self.safeList(response, "data", []);
    return self.parseTrades(trades, market, since, limit)

end
function parseOHLCV(self::Lbank, ohlcv, market=nothing)
    return [safeTimestamp(ohlcv, 0), self.safeNumber(ohlcv, 1), self.safeNumber(ohlcv, 2), self.safeNumber(ohlcv, 3), self.safeNumber(ohlcv, 4), self.safeNumber(ohlcv, 5)]

end
function fetchOHLCV(self::Lbank, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(limit == nothing)
        limit = 100;
    else
        limit = min(limit, 2000);
    end
    if functions.ccxtruthy(since == nothing)
        duration = self.parseTimeframe(timeframe);
        since = milliseconds() - (duration * 1000 * limit);
    end
    parsedSince = self.parseToInt(since / 1000);
    parsedLimit = min(limit + 1, 2000);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("type") => safeString(self.timeframes, timeframe, timeframe),
        Symbol("time") => parsedSince,
        Symbol("size") => parsedLimit
    );
    response = Base.fetch(self.spotPublicGetKline(extend(request, params)));
    ohlcvs = self.safeList(response, "data", []);
    return self.parseOHLCVs(ohlcvs, market, timeframe, since, limit)

end
function parseBalance(self::Lbank, response)
    timestamp = safeInteger(response, "ts");
    result = Dict{Symbol, Any}(
        Symbol("info") => response,
        Symbol("timestamp") => timestamp,
        Symbol("datetime") => self.iso8601(timestamp)
    );
    data = safeValue(response, "data");
    toBtc = safeValue(data, "toBtc");
    if functions.ccxtruthy(toBtc != nothing)
        used = safeValue(data, "freeze", Dict{Symbol, Any}());
        free = safeValue(data, "free", Dict{Symbol, Any}());
        currencies = objectKeys(free);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(currencies)))
            currencyId = get(currencies, i + 1, nothing);
            code = self.safeCurrencyCode(currencyId);
            account = self.account();
            account[Symbol("used")] = safeString(used, currencyId);
            account[Symbol("free")] = safeString(free, currencyId);
            if functions.ccxtruthy(code != nothing)
                result[Symbol(code)] = account;
            end
            i += 1
        end

            return self.safeBalance(result)
    end
    balances = safeValue(data, "balances");
    if functions.ccxtruthy(balances != nothing)
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(balances)))
            item = get(balances, i + 1, nothing);
            currencyId = safeString(item, "asset");
            codeInner = self.safeCurrencyCode(currencyId);
            account = self.account();
            account[Symbol("free")] = safeString(item, "free");
            account[Symbol("used")] = safeString(item, "locked");
            if functions.ccxtruthy(codeInner != nothing)
                result[Symbol(codeInner)] = account;
            end
            i += 1
        end

            return self.safeBalance(result)
    end
    isArray = functions.ccxt_isArray(data);
    if functions.ccxtruthy(isArray)
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
            item = get(data, i + 1, nothing);
            currencyId = safeString(item, "coin");
            codeInner = self.safeCurrencyCode(currencyId);
            account = self.account();
            account[Symbol("free")] = safeString(item, "usableAmt");
            account[Symbol("used")] = safeString(item, "freezeAmt");
            if functions.ccxtruthy(codeInner != nothing)
                result[Symbol(codeInner)] = account;
            end
            i += 1
        end

            return self.safeBalance(result)
    end
    return self.safeBalance(result)

end
function parseFundingRate(self::Lbank, ticker, market=nothing)
    marketId = safeString(ticker, "symbol");
    symbol = self.safeSymbol(marketId, market);
    markPrice = self.safeNumber(ticker, "markedPrice");
    indexPrice = self.safeNumber(ticker, "underlyingPrice");
    fundingRate = self.safeNumber(ticker, "fundingRate");
    fundingTime = safeInteger(ticker, "nextFeeTime");
    positionFeeTime = safeInteger(ticker, "positionFeeTime");
    intervalString = nothing;
    if functions.ccxtruthy(positionFeeTime != nothing)
        interval = self.parseToInt(positionFeeTime / 60 / 60);
        intervalString = string(interval, "h");
    end
    return Dict{Symbol, Any}(
    Symbol("info") => ticker,
    Symbol("symbol") => symbol,
    Symbol("markPrice") => markPrice,
    Symbol("indexPrice") => indexPrice,
    Symbol("fundingRate") => fundingRate,
    Symbol("fundingTimestamp") => fundingTime,
    Symbol("fundingDatetime") => self.iso8601(fundingTime),
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("nextFundingRate") => nothing,
    Symbol("nextFundingTimestamp") => nothing,
    Symbol("nextFundingDatetime") => nothing,
    Symbol("previousFundingRate") => nothing,
    Symbol("previousFundingTimestamp") => nothing,
    Symbol("previousFundingDatetime") => nothing,
    Symbol("interval") => intervalString
)

end
function fetchFundingRate(self::Lbank, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    responseForSwap = Base.fetch(self.fetchFundingRates([get(market, Symbol("symbol"), nothing)], params));
    return safeValue(responseForSwap, get(market, Symbol("symbol"), nothing))

end
function fetchFundingRates(self::Lbank, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols);
    request = Dict{Symbol, Any}(
        Symbol("productGroup") => "SwapU"
    );
    response = Base.fetch(self.contractPublicGetCfdOpenApiV1PubMarketData(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseFundingRates(data, symbols)

end
function fetchBalance(self::Lbank, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    options = safeValue(self.options, "fetchBalance", Dict{Symbol, Any}());
    defaultMethod = safeString(options, "method", "spotPrivatePostSupplementUserInfo");
    method = safeString(params, "method", defaultMethod);
    if functions.ccxtruthy(method == "spotPrivatePostSupplementUserInfoAccount")
        response = Base.fetch(self.spotPrivatePostSupplementUserInfoAccount());
    elseif functions.ccxtruthy(method == "spotPrivatePostUserInfo")
        response = Base.fetch(self.spotPrivatePostUserInfo());
    else
        response = Base.fetch(self.spotPrivatePostSupplementUserInfo());
    end
    balanceResponse = functions.ccxtruthy((response == nothing)) ? Dict{Symbol, Any}() : response;
    balanceResult = self.parseBalance(balanceResponse);
    if functions.ccxtruthy(balanceResult == nothing)
        throw(NullResponse(string(self.id, " fetchBalance() returned empty response")));
    end
    return balanceResult

end
function parseTradingFee(self::Lbank, fee, market=nothing)
    marketId = safeString(fee, "symbol");
    symbol = self.safeSymbol(marketId);
    return Dict{Symbol, Any}(
    Symbol("info") => fee,
    Symbol("symbol") => symbol,
    Symbol("maker") => self.safeNumber(fee, "makerCommission"),
    Symbol("taker") => self.safeNumber(fee, "takerCommission"),
    Symbol("percentage") => nothing,
    Symbol("tierBased") => nothing
)

end
function fetchTradingFee(self::Lbank, symbol, params=Dict())
    market = self.market(symbol);
    result = Base.fetch(self.fetchTradingFees(extend(params, Dict{Symbol, Any}(
        Symbol("category") => get(market, Symbol("id"), nothing)
    ))));
    return self.safeDict(result, symbol)

end
function fetchTradingFees(self::Lbank, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    response = Base.fetch(self.spotPrivatePostSupplementCustomerTradeFee(extend(request, params)));
    fees = safeValue(response, "data", []);
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(fees)))
        fee = self.parseTradingFee(get(fees, i + 1, nothing));
        symbol = get(fee, Symbol("symbol"), nothing);
        result[Symbol(symbol)] = fee;
        i += 1
    end
    return result

end
function createMarketBuyOrderWithCost(self::Lbank, symbol, cost, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("spot"), nothing)))
        throw(NotSupported(string(self.id, " createMarketBuyOrderWithCost() supports spot orders only")));
    end
    params[Symbol("createMarketBuyOrderRequiresPrice")] = false;
    return Base.fetch(self.createOrder(symbol, "market", "buy", cost, nothing, params))

end
function createOrder(self::Lbank, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    clientOrderId = safeString2(params, "custom_id", "clientOrderId");
    postOnly = self.safeBool(params, "postOnly", false);
    timeInForce = safeStringUpper(params, "timeInForce");
    params = omit(params, ["custom_id", "clientOrderId", "timeInForce", "postOnly"]);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    ioc = (timeInForce == "IOC");
    fok = (timeInForce == "FOK");
    maker = (@functions.ccxt_or(postOnly, (timeInForce == "PO")));
    if functions.ccxtruthy(@functions.ccxt_and((type_var == "market"), (@functions.ccxt_or(@functions.ccxt_or(ioc, fok), maker))))
        throw(InvalidOrder(string(self.id, " createOrder () does not allow market FOK, IOC, or postOnly orders. Only limit IOC, FOK, and postOnly orders are allowed")));
    end
    if functions.ccxtruthy(type_var == "limit")
        request[Symbol("type")] = side;
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
        request[Symbol("amount")] = self.amountToPrecision(symbol, amount);
        if functions.ccxtruthy(ioc)
            request[Symbol("type")] = string(side, "_", "ioc");
        elseif functions.ccxtruthy(fok)
            request[Symbol("type")] = string(side, "_", "fok");
        else
            if functions.ccxtruthy(maker)
                request[Symbol("type")] = string(side, "_", "maker");
            end

        end
    elseif functions.ccxtruthy(type_var == "market")
        if functions.ccxtruthy(side == "sell")
            request[Symbol("type")] = string(side, "_", "market");
            request[Symbol("amount")] = self.amountToPrecision(symbol, amount);
        elseif functions.ccxtruthy(side == "buy")
            request[Symbol("type")] = string(side, "_", "market");
            quoteAmount = nothing;
            createMarketBuyOrderRequiresPrice = true;
            (createMarketBuyOrderRequiresPrice, params) = self.handleOptionAndParams(params, "createOrder", "createMarketBuyOrderRequiresPrice", true);
            cost = self.safeNumber(params, "cost");
            params = omit(params, "cost");
            if functions.ccxtruthy(cost != nothing)
                quoteAmount = self.costToPrecision(symbol, cost);
            elseif functions.ccxtruthy(createMarketBuyOrderRequiresPrice)
                if functions.ccxtruthy(price == nothing)
                    throw(InvalidOrder(string(self.id, " createOrder() requires the price argument for market buy orders to calculate the total cost to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option or param to false and pass the cost to spend in the amount argument")));
                else
                    amountString = numberToString(amount);
                    priceString = numberToString(price);
                    costRequest = stringMul(amountString, priceString);
                    quoteAmount = self.costToPrecision(symbol, costRequest);
                end
            else
                quoteAmount = self.costToPrecision(symbol, amount);
            end
            request[Symbol("price")] = quoteAmount;
        end
    end
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("custom_id")] = clientOrderId;
    end
    options = safeValue(self.options, "createOrder", Dict{Symbol, Any}());
    defaultMethod = safeString(options, "method", "spotPrivatePostSupplementCreateOrder");
    method = safeString(params, "method", defaultMethod);
    params = omit(params, "method");
    if functions.ccxtruthy(method == "spotPrivatePostCreateOrder")
        response = Base.fetch(self.spotPrivatePostCreateOrder(extend(request, params)));
    else
        response = Base.fetch(self.spotPrivatePostSupplementCreateOrder(extend(request, params)));
    end
    result = safeValue(response, "data", Dict{Symbol, Any}());
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => safeString(result, "order_id"),
    Symbol("info") => result
), market)

end
function parseOrderStatus(self::Lbank, status)
    statuses = Dict{Symbol, Any}(
        Symbol("-1") => "canceled",
        Symbol("0") => "open",
        Symbol("1") => "open",
        Symbol("2") => "closed",
        Symbol("3") => "canceled",
        Symbol("4") => "closed"
    );
    return safeString(statuses, status, status)

end
function parseOrder(self::Lbank, order, market=nothing)
    id = safeString2(order, "orderId", "order_id");
    clientOrderId = safeString2(order, "clientOrderId", "custom_id");
    timestamp = safeInteger2(order, "time", "create_time");
    rawStatus = safeString(order, "status");
    marketId = safeString(order, "symbol");
    market = self.safeMarket(marketId, market);
    timeInForce = nothing;
    postOnly = false;
    type_var = "limit";
    rawType = safeString2(order, "type", "tradeType");
    parts = split(rawType, "_");
    side = safeString(parts, 0);
    typePart = safeString(parts, 1);
    if functions.ccxtruthy(typePart == "market")
        type_var = "market";
    end
    if functions.ccxtruthy(typePart == "maker")
        postOnly = true;
        timeInForce = "PO";
    end
    if functions.ccxtruthy(typePart == "ioc")
        timeInForce = "IOC";
    end
    if functions.ccxtruthy(typePart == "fok")
        timeInForce = "FOK";
    end
    price = safeString(order, "price");
    costString = safeString(order, "cummulativeQuoteQty");
    amountString = nothing;
    if functions.ccxtruthy(rawType != "buy_market")
        amountString = safeString2(order, "origQty", "amount");
    end
    filledString = safeString2(order, "executedQty", "deal_amount");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("clientOrderId") => clientOrderId,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("timestamp") => timestamp,
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("status") => self.parseOrderStatus(rawStatus),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("type") => type_var,
    Symbol("timeInForce") => timeInForce,
    Symbol("postOnly") => postOnly,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("triggerPrice") => nothing,
    Symbol("cost") => costString,
    Symbol("amount") => amountString,
    Symbol("filled") => filledString,
    Symbol("remaining") => nothing,
    Symbol("trades") => nothing,
    Symbol("fee") => nothing,
    Symbol("info") => order,
    Symbol("average") => nothing
), market)

end
function fetchOrder(self::Lbank, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    method = safeString(params, "method");
    if functions.ccxtruthy(method == nothing)
        options = safeValue(self.options, "fetchOrder", Dict{Symbol, Any}());
        method = safeString(options, "method", "fetchOrderSupplement");
    end
    if functions.ccxtruthy(method == "fetchOrderSupplement")
            return Base.fetch(self.fetchOrderSupplement(id, symbol, params))
    end
    return Base.fetch(self.fetchOrderDefault(id, symbol, params))

end
function fetchOrderSupplement(self::Lbank, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOrder() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("orderId") => id
    );
    response = Base.fetch(self.spotPrivatePostSupplementOrdersInfo(extend(request, params)));
    result = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseOrder(result)

end
function fetchOrderDefault(self::Lbank, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOrder() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("order_id") => id
    );
    response = Base.fetch(self.spotPrivatePostOrdersInfo(extend(request, params)));
    result = safeValue(response, "data", []);
    numOrders = length(result);
    if functions.ccxtruthy(numOrders == 1)
            return self.parseOrder(get(result, 1, nothing))
    else
        throw(BadRequest(string(self.id, " fetchOrder() can only fetch one order at a time")));
    end

end
function fetchMyTrades(self::Lbank, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchMyTrades() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    since = safeValue(params, "start_date", since);
    params = omit(params, "start_date");
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("size")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_date")] = self.ymd(since, "-");
        request[Symbol("end_date")] = self.ymd(since + 86400000, "-");
    end
    response = Base.fetch(self.spotPrivatePostTransactionHistory(extend(request, params)));
    trades = self.safeList(response, "data", []);
    return self.parseTrades(trades, market, since, limit)

end
function fetchOrders(self::Lbank, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(limit == nothing)
        limit = 100;
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("current_page") => 1,
        Symbol("page_length") => limit
    );
    response = Base.fetch(self.spotPrivatePostSupplementOrdersInfoHistory(extend(request, params)));
    result = safeValue(response, "data", Dict{Symbol, Any}());
    orders = self.safeList(result, "orders", []);
    return self.parseOrders(orders, market, since, limit)

end
function fetchOpenOrders(self::Lbank, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOpenOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(limit == nothing)
        limit = 100;
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("current_page") => 1,
        Symbol("page_length") => limit
    );
    response = Base.fetch(self.spotPrivatePostSupplementOrdersInfoNoDeal(extend(request, params)));
    result = safeValue(response, "data", Dict{Symbol, Any}());
    orders = self.safeList(result, "orders", []);
    return self.parseOrders(orders, market, since, limit)

end
function cancelOrder(self::Lbank, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    clientOrderId = safeString2(params, "origClientOrderId", "clientOrderId");
    params = omit(params, ["origClientOrderId", "clientOrderId"]);
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("orderId") => id
    );
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("origClientOrderId")] = clientOrderId;
    end
    response = Base.fetch(self.spotPrivatePostSupplementCancelOrder(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseOrder(data)

end
function cancelAllOrders(self::Lbank, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelAllOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.spotPrivatePostSupplementCancelOrderBySymbol(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseOrders(data)

end
function getNetworkCodeForCurrency(self::Lbank, currencyCode, params)
    defaultNetworks = safeValue(self.options, "defaultNetworks");
    defaultNetwork = safeStringUpper(defaultNetworks, currencyCode);
    networks = safeValue(self.options, "networks", Dict{Symbol, Any}());
    network = safeStringUpper(params, "network", defaultNetwork);
    network = safeString(networks, network, network);
    return network

end
function fetchDepositAddress(self::Lbank, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    options = safeValue(self.options, "fetchDepositAddress", Dict{Symbol, Any}());
    defaultMethod = safeString(options, "method", "fetchDepositAddressDefault");
    method = safeString(params, "method", defaultMethod);
    params = omit(params, "method");
    if functions.ccxtruthy(method == "fetchDepositAddressSupplement")
        response = Base.fetch(self.fetchDepositAddressSupplement(code, params));
    else
        response = Base.fetch(self.fetchDepositAddressDefault(code, params));
    end
    return response

end
function fetchDepositAddressDefault(self::Lbank, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("assetCode") => get(currency, Symbol("id"), nothing)
    );
    network = self.getNetworkCodeForCurrency(code, params);
    if functions.ccxtruthy(network != nothing)
        request[Symbol("netWork")] = network;
        params = omit(params, "network");
    end
    response = Base.fetch(self.spotPrivatePostGetDepositAddress(extend(request, params)));
    result = safeValue(response, "data");
    address = safeString(result, "address");
    tag = safeString(result, "memo");
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("currency") => code,
    Symbol("network") => self.networkIdToCode(safeString(result, "netWork"), code),
    Symbol("address") => address,
    Symbol("tag") => tag
)

end
function fetchDepositAddressSupplement(self::Lbank, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("coin") => get(currency, Symbol("id"), nothing)
    );
    networks = safeValue(self.options, "networks");
    network = safeStringUpper(params, "network");
    network = safeString(networks, network, network);
    if functions.ccxtruthy(network != nothing)
        request[Symbol("networkName")] = network;
        params = omit(params, "network");
    end
    response = Base.fetch(self.spotPrivatePostSupplementGetDepositAddress(extend(request, params)));
    result = safeValue(response, "data");
    address = safeString(result, "address");
    tag = safeString(result, "memo");
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("currency") => code,
    Symbol("network") => nothing,
    Symbol("address") => address,
    Symbol("tag") => tag
)

end
function withdraw(self::Lbank, code, amount, address, tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    self.checkAddress(address);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    fee = safeString(params, "fee");
    params = omit(params, "fee");
    self.checkRequiredArgument("withdraw", fee, "fee");
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("address") => address,
        Symbol("coin") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => amount,
        Symbol("fee") => fee
    );
    if functions.ccxtruthy(tag != nothing)
        request[Symbol("memo")] = tag;
    end
    network = safeStringUpper2(params, "network", "networkName");
    params = omit(params, ["network", "networkName"]);
    networks = safeValue(self.options, "networks");
    networkId = safeString(networks, network, network);
    if functions.ccxtruthy(networkId != nothing)
        request[Symbol("networkName")] = networkId;
    end
    response = Base.fetch(self.spotPrivatePostSupplementWithdraw(extend(request, params)));
    result = safeValue(response, "data", Dict{Symbol, Any}());
    return Dict{Symbol, Any}(
    Symbol("info") => result,
    Symbol("id") => safeString(result, "withdrawId")
)

end
function parseTransactionStatus(self::Lbank, status, type_var)
    statuses = Dict{Symbol, Any}(
        Symbol("deposit") => Dict{Symbol, Any}(
            Symbol("1") => "pending",
            Symbol("2") => "ok",
            Symbol("3") => "failed",
            Symbol("4") => "canceled",
            Symbol("5") => "transfer"
        ),
        Symbol("withdrawal") => Dict{Symbol, Any}(
            Symbol("1") => "pending",
            Symbol("2") => "canceled",
            Symbol("3") => "failed",
            Symbol("4") => "ok"
        )
    );
    return safeString(safeValue(statuses, type_var, Dict{Symbol, Any}()), status, status)

end
function parseTransaction(self::Lbank, transaction, currency=nothing)
    id = safeString(transaction, "id");
    type_var = nothing;
    if functions.ccxtruthy(id == nothing)
        type_var = "deposit";
    else
        type_var = "withdrawal";
    end
    txid = safeString(transaction, "txId");
    timestamp = safeInteger2(transaction, "insertTime", "applyTime");
    address = safeString(transaction, "address");
    addressFrom = nothing;
    addressTo = nothing;
    if functions.ccxtruthy(type_var == "deposit")
        addressFrom = address;
    else
        addressTo = address;
    end
    amount = self.safeNumber(transaction, "amount");
    currencyId = safeString2(transaction, "coin", "coid");
    code = self.safeCurrencyCode(currencyId, currency);
    status = self.parseTransactionStatus(safeString(transaction, "status"), type_var);
    fee = nothing;
    feeCost = self.safeNumber(transaction, "fee");
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
    Symbol("network") => self.networkIdToCode(safeString(transaction, "networkName"), code),
    Symbol("address") => address,
    Symbol("addressTo") => addressTo,
    Symbol("addressFrom") => addressFrom,
    Symbol("tag") => nothing,
    Symbol("tagTo") => nothing,
    Symbol("tagFrom") => nothing,
    Symbol("type") => type_var,
    Symbol("amount") => amount,
    Symbol("currency") => code,
    Symbol("status") => status,
    Symbol("updated") => nothing,
    Symbol("comment") => nothing,
    Symbol("internal") => (status == "transfer"),
    Symbol("fee") => fee
)

end
function fetchDeposits(self::Lbank, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
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
    response = Base.fetch(self.spotPrivatePostSupplementDepositHistory(extend(request, params)));
    data = safeValue(response, "data", Dict{Symbol, Any}());
    deposits = self.safeList(data, "depositOrders", []);
    return self.parseTransactions(deposits, currency, since, limit)

end
function fetchWithdrawals(self::Lbank, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
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
    response = Base.fetch(self.spotPrivatePostSupplementWithdraws(extend(request, params)));
    data = safeValue(response, "data", Dict{Symbol, Any}());
    withdraws = self.safeList(data, "withdraws", []);
    return self.parseTransactions(withdraws, currency, since, limit)

end
function fetchTransactionFees(self::Lbank, codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    isAuthorized = self.checkRequiredCredentials(false);
    if functions.ccxtruthy(isAuthorized)
        options = safeValue(self.options, "fetchTransactionFees", Dict{Symbol, Any}());
        defaultMethod = safeString(options, "method", "fetchPrivateTransactionFees");
        method = safeString(params, "method", defaultMethod);
        params = omit(params, "method");
        if functions.ccxtruthy(method == "fetchPublicTransactionFees")
            result = Base.fetch(self.fetchPublicTransactionFees(params));
        else
            result = Base.fetch(self.fetchPrivateTransactionFees(params));
        end
    else
        result = Base.fetch(self.fetchPublicTransactionFees(params));
    end
    return result

end
function fetchPrivateTransactionFees(self::Lbank, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.spotPrivatePostSupplementUserInfo());
    result = safeValue(response, "data", []);
    withdrawFees = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(result)))
        entry = get(result, i + 1, nothing);
        currencyId = safeString(entry, "coin");
        code = self.safeCurrencyCode(currencyId);
        networkList = safeValue(entry, "networkList", []);
        if functions.ccxtruthy(code != nothing)
            withdrawFees[Symbol(code)] = Dict{Symbol, Any}();
        end
        j = 0
        while functions.ccxtruthy(functions.ccxt_lt(j, length(networkList)))
            networkEntry = get(networkList, j + 1, nothing);
            fee = self.safeNumber(networkEntry, "withdrawFee");
            if functions.ccxtruthy(fee != nothing)
                networkCode = self.networkIdToCode(safeString(networkEntry, "name"), code);
                if functions.ccxtruthy(networkCode != nothing)
                    if functions.ccxtruthy(@functions.ccxt_and((code != nothing), (networkCode != nothing)))
                        withdrawFees[Symbol(code)][Symbol(networkCode)] = fee;
                    end
                end
            end
            j += 1
        end
        i += 1
    end
    return Dict{Symbol, Any}(
    Symbol("withdraw") => withdrawFees,
    Symbol("deposit") => Dict{Symbol, Any}(),
    Symbol("info") => response
)

end
function fetchPublicTransactionFees(self::Lbank, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    code = safeString2(params, "coin", "assetCode");
    params = omit(params, ["coin", "assetCode"]);
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("assetCode")] = get(currency, Symbol("id"), nothing);
    end
    response = Base.fetch(self.spotPublicGetWithdrawConfigs(extend(request, params)));
    result = safeValue(response, "data", []);
    withdrawFees = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(result)))
        item = get(result, i + 1, nothing);
        canWithdraw = safeValue(item, "canWithDraw");
        if functions.ccxtruthy(canWithdraw == "true")
            currencyId = safeString(item, "assetCode");
            codeInner = self.safeCurrencyCode(currencyId);
            network = self.networkIdToCode(safeString(item, "chain"), codeInner);
            if functions.ccxtruthy(network == nothing)
                network = codeInner;
            end
            fee = safeString(item, "fee");
            if functions.ccxtruthy(safeValue(withdrawFees, codeInner) == nothing)
                if functions.ccxtruthy(codeInner != nothing)
                    withdrawFees[Symbol(codeInner)] = Dict{Symbol, Any}();
                end
            end
            if functions.ccxtruthy(@functions.ccxt_and((codeInner != nothing), (network != nothing)))
                withdrawFees[Symbol(codeInner)][Symbol(network)] = self.parseNumber(fee);
            end
        end
        i += 1
    end
    return Dict{Symbol, Any}(
    Symbol("withdraw") => withdrawFees,
    Symbol("deposit") => Dict{Symbol, Any}(),
    Symbol("info") => response
)

end
function fetchDepositWithdrawFees(self::Lbank, codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    isAuthorized = self.checkRequiredCredentials(false);
    if functions.ccxtruthy(isAuthorized)
        options = safeValue(self.options, "fetchDepositWithdrawFees", Dict{Symbol, Any}());
        defaultMethod = safeString(options, "method", "fetchPrivateDepositWithdrawFees");
        method = safeString(params, "method", defaultMethod);
        params = omit(params, "method");
        if functions.ccxtruthy(method == "fetchPublicDepositWithdrawFees")
            response = Base.fetch(self.fetchPublicDepositWithdrawFees(codes, params));
        else
            response = Base.fetch(self.fetchPrivateDepositWithdrawFees(codes, params));
        end
    else
        response = Base.fetch(self.fetchPublicDepositWithdrawFees(codes, params));
    end
    return response

end
function fetchPrivateDepositWithdrawFees(self::Lbank, codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.spotPrivatePostSupplementUserInfo(params));
    data = self.safeList(response, "data", []);
    return self.parseDepositWithdrawFees(data, codes, "coin")

end
function fetchPublicDepositWithdrawFees(self::Lbank, codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    response = Base.fetch(self.spotPublicGetWithdrawConfigs(extend(request, params)));
    data = safeValue(response, "data", []);
    return self.parsePublicDepositWithdrawFees(data, codes)

end
function parsePublicDepositWithdrawFees(self::Lbank, response, codes=nothing)
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        fee = get(response, i + 1, nothing);
        canWithdraw = safeValue(fee, "canWithDraw");
        if functions.ccxtruthy(canWithdraw)
            currencyId = safeString(fee, "assetCode");
            code = self.safeCurrencyCode(currencyId);
            if functions.ccxtruthy(@functions.ccxt_and((code != nothing), (@functions.ccxt_or(codes == nothing, inArray(code, codes)))))
                withdrawFee = self.safeNumber(fee, "fee");
                if functions.ccxtruthy(withdrawFee != nothing)
                    resultValue = safeValue(result, code);
                    if functions.ccxtruthy(resultValue == nothing)
                        result[Symbol(code)] = self.depositWithdrawFee([fee]);
                    else
                        resultCodeInfo = get(get(result, Symbol(code), nothing), Symbol("info"), nothing);
                        push!(resultCodeInfo, fee);
                    end
                    networkCode = self.networkIdToCode(safeString(fee, "chain"), code);
                    if functions.ccxtruthy(networkCode != nothing)
                        result[Symbol(code)][Symbol("networks")][Symbol(networkCode)] = Dict{Symbol, Any}(
                            Symbol("withdraw") => Dict{Symbol, Any}(
                                Symbol("fee") => withdrawFee,
                                Symbol("percentage") => nothing
                            ),
                            Symbol("deposit") => Dict{Symbol, Any}(
                                Symbol("fee") => nothing,
                                Symbol("percentage") => nothing
                            )
                        );
                    else
                        result[Symbol(code)][Symbol("withdraw")] = Dict{Symbol, Any}(
                            Symbol("fee") => withdrawFee,
                            Symbol("percentage") => nothing
                        );
                    end
                end
            end
        end
        i += 1
    end
    return result

end
function parseDepositWithdrawFee(self::Lbank, fee, currency=nothing)
    result = self.depositWithdrawFee(fee);
    code = safeString(currency, "code");
    networkList = safeValue(fee, "networkList", []);
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(networkList)))
        networkEntry = get(networkList, j + 1, nothing);
        networkCode = self.networkIdToCode(safeString(networkEntry, "name"), code);
        withdrawFee = self.safeNumber(networkEntry, "withdrawFee");
        isDefault = safeValue(networkEntry, "isDefault");
        if functions.ccxtruthy(withdrawFee != nothing)
            if functions.ccxtruthy(isDefault)
                result[Symbol("withdraw")] = Dict{Symbol, Any}(
                    Symbol("fee") => withdrawFee,
                    Symbol("percentage") => nothing
                );
            end
            if functions.ccxtruthy(networkCode != nothing)
                result[Symbol("networks")][Symbol(networkCode)] = Dict{Symbol, Any}(
                    Symbol("withdraw") => Dict{Symbol, Any}(
                        Symbol("fee") => withdrawFee,
                        Symbol("percentage") => nothing
                    ),
                    Symbol("deposit") => Dict{Symbol, Any}(
                        Symbol("fee") => nothing,
                        Symbol("percentage") => nothing
                    )
                );
            end
        end
        j += 1
    end
    return result

end
function sign(self::Lbank, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    query = omit(params, self.extractParams(path));
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol("rest"), nothing), "/", self.version, "/", self.implodeParams(path, params));
    if functions.ccxtruthy(get(api, 1, nothing) == "spot")
        url += ".do";
    else
        url = string(get(get(self.urls, Symbol("api"), nothing), Symbol("contract"), nothing), "/", self.implodeParams(path, params));
    end
    if functions.ccxtruthy(get(api, 2, nothing) == "public")
        if functions.ccxtruthy(length(objectKeys(query)))
            url += string("?", self.urlencode(keysort(query)));
        end
    else
        self.checkRequiredCredentials();
        timestamp = string(milliseconds());
        echostr = string(uuid22(), uuid16());
        query = extend(Dict{Symbol, Any}(
    Symbol("api_key") => self.apiKey
), query);
        signatureMethod = nothing;
        if functions.ccxtruthy(functions.ccxt_gt(length(self.secret), 32))
            signatureMethod = "RSA";
        else
            signatureMethod = "HmacSHA256";
        end
        finalSig = signatureMethod;
        auth = self.rawencode(keysort(extend(Dict{Symbol, Any}(
            Symbol("echostr") => echostr,
            Symbol("signature_method") => finalSig,
            Symbol("timestamp") => timestamp
        ), query)));
        encoded = self.encode(auth);
        hash = Ccxt.hash(encoded, md5);
        uppercaseHash = uppercase(hash);
        sign_var = nothing;
        if functions.ccxtruthy(signatureMethod == "RSA")
            cacheSecretAsPem = self.safeBool(self.options, "cacheSecretAsPem", true);
            pem = nothing;
            if functions.ccxtruthy(cacheSecretAsPem)
                pem = safeValue(self.options, "pem");
                if functions.ccxtruthy(pem == nothing)
                    pem = self.convertSecretToPem(self.encode(self.secret));
                    self.options[Symbol("pem")] = pem;
                end
            else
                pem = self.convertSecretToPem(self.encode(self.secret));
            end
            sign_var = rsa(uppercaseHash, pem, sha256);
        elseif functions.ccxtruthy(signatureMethod == "HmacSHA256")
            sign_var = self.hmac(self.encode(uppercaseHash), self.encode(self.secret), sha256);
        end
        query[Symbol("sign")] = sign_var;
        body = self.urlencode(keysort(query));
        headers = Dict{Symbol, Any}(
            Symbol("Content-Type") => "application/x-www-form-urlencoded",
            Symbol("timestamp") => timestamp,
            Symbol("signature_method") => signatureMethod,
            Symbol("echostr") => echostr
        );
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function convertSecretToPem(self::Lbank, secret)
    lineLength = 64;
    secretLength = length(secret) - 0;
    numLines = self.parseToInt(secretLength / lineLength);
    numLines = self.sum(numLines, 1);
    pem = "-----BEGIN PRIVATE KEY-----\n";
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, numLines))
        start = i * lineLength;
        end_var = self.sum(start, lineLength);
        pem += string(functions.ccxt_slice(self.secret, start, end_var), "\n");
        i += 1
    end
    return string(pem, "-----END PRIVATE KEY-----")

end
function handleErrors(self::Lbank, httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
        throw(NullResponse(string(self.id, " parseBalance() returned empty response")));
    end
    success = safeValue(response, "result");
    if functions.ccxtruthy(@functions.ccxt_or(success == "false", !functions.ccxtruthy(success)))
        errorCode = safeString(response, "error_code");
        message = safeString(Dict{Symbol, Any}(
            Symbol("10000") => "Internal error",
            Symbol("10001") => "The required parameters can not be empty",
            Symbol("10002") => "Validation failed",
            Symbol("10003") => "Invalid parameter",
            Symbol("10004") => "Request too frequent",
            Symbol("10005") => "Secret key does not exist",
            Symbol("10006") => "User does not exist",
            Symbol("10007") => "Invalid signature",
            Symbol("10008") => "Invalid Trading Pair",
            Symbol("10009") => "Price and/or Amount are required for limit order",
            Symbol("10010") => "Price and/or Amount must be less than minimum requirement",
            Symbol("10013") => "The amount is too small",
            Symbol("10014") => "Insufficient amount of money in the account",
            Symbol("10015") => "Invalid order type",
            Symbol("10016") => "Insufficient account balance",
            Symbol("10017") => "Server Error",
            Symbol("10018") => "Page size should be between 1 and 50",
            Symbol("10019") => "Cancel NO more than 3 orders in one request",
            Symbol("10020") => "Volume < 0.001",
            Symbol("10021") => "Price < 0.01",
            Symbol("10022") => "Invalid authorization",
            Symbol("10023") => "Market Order is not supported yet",
            Symbol("10024") => "User cannot trade on this pair",
            Symbol("10025") => "Order has been filled",
            Symbol("10026") => "Order has been cancelld",
            Symbol("10027") => "Order is cancelling",
            Symbol("10028") => "Wrong query time",
            Symbol("10029") => "from is not in the query time",
            Symbol("10030") => "from do not match the transaction type of inqury",
            Symbol("10031") => "echostr length must be valid and length must be from 30 to 40",
            Symbol("10033") => "Failed to create order",
            Symbol("10036") => "customID duplicated",
            Symbol("10100") => "Has no privilege to withdraw",
            Symbol("10101") => "Invalid fee rate to withdraw",
            Symbol("10102") => "Too little to withdraw",
            Symbol("10103") => "Exceed daily limitation of withdraw",
            Symbol("10104") => "Cancel was rejected",
            Symbol("10105") => "Request has been cancelled",
            Symbol("10106") => "None trade time",
            Symbol("10107") => "Start price exception",
            Symbol("10108") => "can not create order",
            Symbol("10109") => "wallet address is not mapping",
            Symbol("10110") => "transfer fee is not mapping",
            Symbol("10111") => "mount > 0",
            Symbol("10112") => "fee is too lower",
            Symbol("10113") => "transfer fee is 0",
            Symbol("10600") => "intercepted by replay attacks filter, check timestamp",
            Symbol("10601") => "Interface closed unavailable",
            Symbol("10701") => "invalid asset code",
            Symbol("10702") => "not allowed deposit"
        ), errorCode, json(response));
        ErrorClass = safeValue(Dict{Symbol, Any}(
            Symbol("10001") => BadRequest,
            Symbol("10002") => AuthenticationError,
            Symbol("10003") => BadRequest,
            Symbol("10004") => RateLimitExceeded,
            Symbol("10005") => AuthenticationError,
            Symbol("10006") => AuthenticationError,
            Symbol("10007") => AuthenticationError,
            Symbol("10008") => BadSymbol,
            Symbol("10009") => InvalidOrder,
            Symbol("10010") => InvalidOrder,
            Symbol("10013") => InvalidOrder,
            Symbol("10014") => InsufficientFunds,
            Symbol("10015") => InvalidOrder,
            Symbol("10016") => InsufficientFunds,
            Symbol("10017") => ExchangeError,
            Symbol("10018") => BadRequest,
            Symbol("10019") => BadRequest,
            Symbol("10020") => BadRequest,
            Symbol("10021") => InvalidOrder,
            Symbol("10022") => PermissionDenied,
            Symbol("10023") => InvalidOrder,
            Symbol("10024") => PermissionDenied,
            Symbol("10025") => InvalidOrder,
            Symbol("10026") => InvalidOrder,
            Symbol("10027") => InvalidOrder,
            Symbol("10028") => BadRequest,
            Symbol("10029") => BadRequest,
            Symbol("10030") => BadRequest,
            Symbol("10031") => InvalidNonce,
            Symbol("10033") => ExchangeError,
            Symbol("10036") => DuplicateOrderId,
            Symbol("10100") => PermissionDenied,
            Symbol("10101") => BadRequest,
            Symbol("10102") => InsufficientFunds,
            Symbol("10103") => ExchangeError,
            Symbol("10104") => ExchangeError,
            Symbol("10105") => ExchangeError,
            Symbol("10106") => BadRequest,
            Symbol("10107") => BadRequest,
            Symbol("10108") => ExchangeError,
            Symbol("10109") => InvalidAddress,
            Symbol("10110") => ExchangeError,
            Symbol("10111") => BadRequest,
            Symbol("10112") => BadRequest,
            Symbol("10113") => BadRequest,
            Symbol("10600") => BadRequest,
            Symbol("10601") => ExchangeError,
            Symbol("10701") => BadSymbol,
            Symbol("10702") => PermissionDenied
        ), errorCode, ExchangeError);
        throw(ErrorClass(message));
    end
    return nothing

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Lbank, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function spotPublicGetCurrencyPairs(self::Lbank, params=Dict(), context=Dict())
    return request(self, "currencyPairs", ["spot", "public"], "GET", params, nothing, nothing, Dict())
end

function spotPublicGetAccuracy(self::Lbank, params=Dict(), context=Dict())
    return request(self, "accuracy", ["spot", "public"], "GET", params, nothing, nothing, Dict())
end

function spotPublicGetUsdToCny(self::Lbank, params=Dict(), context=Dict())
    return request(self, "usdToCny", ["spot", "public"], "GET", params, nothing, nothing, Dict())
end

function spotPublicGetAssetConfigs(self::Lbank, params=Dict(), context=Dict())
    return request(self, "assetConfigs", ["spot", "public"], "GET", params, nothing, nothing, Dict())
end

function spotPublicGetWithdrawConfigs(self::Lbank, params=Dict(), context=Dict())
    return request(self, "withdrawConfigs", ["spot", "public"], "GET", params, nothing, nothing, Dict())
end

function spotPublicGetTimestamp(self::Lbank, params=Dict(), context=Dict())
    return request(self, "timestamp", ["spot", "public"], "GET", params, nothing, nothing, Dict())
end

function spotPublicGetTicker24hr(self::Lbank, params=Dict(), context=Dict())
    return request(self, "ticker/24hr", ["spot", "public"], "GET", params, nothing, nothing, Dict())
end

function spotPublicGetTicker(self::Lbank, params=Dict(), context=Dict())
    return request(self, "ticker", ["spot", "public"], "GET", params, nothing, nothing, Dict())
end

function spotPublicGetDepth(self::Lbank, params=Dict(), context=Dict())
    return request(self, "depth", ["spot", "public"], "GET", params, nothing, nothing, Dict())
end

function spotPublicGetIncrDepth(self::Lbank, params=Dict(), context=Dict())
    return request(self, "incrDepth", ["spot", "public"], "GET", params, nothing, nothing, Dict())
end

function spotPublicGetTrades(self::Lbank, params=Dict(), context=Dict())
    return request(self, "trades", ["spot", "public"], "GET", params, nothing, nothing, Dict())
end

function spotPublicGetKline(self::Lbank, params=Dict(), context=Dict())
    return request(self, "kline", ["spot", "public"], "GET", params, nothing, nothing, Dict())
end

function spotPublicGetSupplementSystemPing(self::Lbank, params=Dict(), context=Dict())
    return request(self, "supplement/system_ping", ["spot", "public"], "GET", params, nothing, nothing, Dict())
end

function spotPublicGetSupplementIncrDepth(self::Lbank, params=Dict(), context=Dict())
    return request(self, "supplement/incrDepth", ["spot", "public"], "GET", params, nothing, nothing, Dict())
end

function spotPublicGetSupplementTrades(self::Lbank, params=Dict(), context=Dict())
    return request(self, "supplement/trades", ["spot", "public"], "GET", params, nothing, nothing, Dict())
end

function spotPublicGetSupplementTickerPrice(self::Lbank, params=Dict(), context=Dict())
    return request(self, "supplement/ticker/price", ["spot", "public"], "GET", params, nothing, nothing, Dict())
end

function spotPublicGetSupplementTickerBookTicker(self::Lbank, params=Dict(), context=Dict())
    return request(self, "supplement/ticker/bookTicker", ["spot", "public"], "GET", params, nothing, nothing, Dict())
end

function spotPublicPostSupplementSystemStatus(self::Lbank, params=Dict(), context=Dict())
    return request(self, "supplement/system_status", ["spot", "public"], "POST", params, nothing, nothing, Dict())
end

function spotPrivatePostUserInfo(self::Lbank, params=Dict(), context=Dict())
    return request(self, "user_info", ["spot", "private"], "POST", params, nothing, nothing, Dict())
end

function spotPrivatePostSubscribeGetKey(self::Lbank, params=Dict(), context=Dict())
    return request(self, "subscribe/get_key", ["spot", "private"], "POST", params, nothing, nothing, Dict())
end

function spotPrivatePostSubscribeRefreshKey(self::Lbank, params=Dict(), context=Dict())
    return request(self, "subscribe/refresh_key", ["spot", "private"], "POST", params, nothing, nothing, Dict())
end

function spotPrivatePostSubscribeDestroyKey(self::Lbank, params=Dict(), context=Dict())
    return request(self, "subscribe/destroy_key", ["spot", "private"], "POST", params, nothing, nothing, Dict())
end

function spotPrivatePostGetDepositAddress(self::Lbank, params=Dict(), context=Dict())
    return request(self, "get_deposit_address", ["spot", "private"], "POST", params, nothing, nothing, Dict())
end

function spotPrivatePostDepositHistory(self::Lbank, params=Dict(), context=Dict())
    return request(self, "deposit_history", ["spot", "private"], "POST", params, nothing, nothing, Dict())
end

function spotPrivatePostCreateOrder(self::Lbank, params=Dict(), context=Dict())
    return request(self, "create_order", ["spot", "private"], "POST", params, nothing, nothing, Dict())
end

function spotPrivatePostBatchCreateOrder(self::Lbank, params=Dict(), context=Dict())
    return request(self, "batch_create_order", ["spot", "private"], "POST", params, nothing, nothing, Dict())
end

function spotPrivatePostCancelOrder(self::Lbank, params=Dict(), context=Dict())
    return request(self, "cancel_order", ["spot", "private"], "POST", params, nothing, nothing, Dict())
end

function spotPrivatePostCancelClientOrders(self::Lbank, params=Dict(), context=Dict())
    return request(self, "cancel_clientOrders", ["spot", "private"], "POST", params, nothing, nothing, Dict())
end

function spotPrivatePostOrdersInfo(self::Lbank, params=Dict(), context=Dict())
    return request(self, "orders_info", ["spot", "private"], "POST", params, nothing, nothing, Dict())
end

function spotPrivatePostOrdersInfoHistory(self::Lbank, params=Dict(), context=Dict())
    return request(self, "orders_info_history", ["spot", "private"], "POST", params, nothing, nothing, Dict())
end

function spotPrivatePostOrderTransactionDetail(self::Lbank, params=Dict(), context=Dict())
    return request(self, "order_transaction_detail", ["spot", "private"], "POST", params, nothing, nothing, Dict())
end

function spotPrivatePostTransactionHistory(self::Lbank, params=Dict(), context=Dict())
    return request(self, "transaction_history", ["spot", "private"], "POST", params, nothing, nothing, Dict())
end

function spotPrivatePostOrdersInfoNoDeal(self::Lbank, params=Dict(), context=Dict())
    return request(self, "orders_info_no_deal", ["spot", "private"], "POST", params, nothing, nothing, Dict())
end

function spotPrivatePostWithdraw(self::Lbank, params=Dict(), context=Dict())
    return request(self, "withdraw", ["spot", "private"], "POST", params, nothing, nothing, Dict())
end

function spotPrivatePostWithdrawCancel(self::Lbank, params=Dict(), context=Dict())
    return request(self, "withdrawCancel", ["spot", "private"], "POST", params, nothing, nothing, Dict())
end

function spotPrivatePostWithdraws(self::Lbank, params=Dict(), context=Dict())
    return request(self, "withdraws", ["spot", "private"], "POST", params, nothing, nothing, Dict())
end

function spotPrivatePostSupplementUserInfo(self::Lbank, params=Dict(), context=Dict())
    return request(self, "supplement/user_info", ["spot", "private"], "POST", params, nothing, nothing, Dict())
end

function spotPrivatePostSupplementWithdraw(self::Lbank, params=Dict(), context=Dict())
    return request(self, "supplement/withdraw", ["spot", "private"], "POST", params, nothing, nothing, Dict())
end

function spotPrivatePostSupplementDepositHistory(self::Lbank, params=Dict(), context=Dict())
    return request(self, "supplement/deposit_history", ["spot", "private"], "POST", params, nothing, nothing, Dict())
end

function spotPrivatePostSupplementWithdraws(self::Lbank, params=Dict(), context=Dict())
    return request(self, "supplement/withdraws", ["spot", "private"], "POST", params, nothing, nothing, Dict())
end

function spotPrivatePostSupplementGetDepositAddress(self::Lbank, params=Dict(), context=Dict())
    return request(self, "supplement/get_deposit_address", ["spot", "private"], "POST", params, nothing, nothing, Dict())
end

function spotPrivatePostSupplementAssetDetail(self::Lbank, params=Dict(), context=Dict())
    return request(self, "supplement/asset_detail", ["spot", "private"], "POST", params, nothing, nothing, Dict())
end

function spotPrivatePostSupplementCustomerTradeFee(self::Lbank, params=Dict(), context=Dict())
    return request(self, "supplement/customer_trade_fee", ["spot", "private"], "POST", params, nothing, nothing, Dict())
end

function spotPrivatePostSupplementApiRestrictions(self::Lbank, params=Dict(), context=Dict())
    return request(self, "supplement/api_Restrictions", ["spot", "private"], "POST", params, nothing, nothing, Dict())
end

function spotPrivatePostSupplementSystemPing(self::Lbank, params=Dict(), context=Dict())
    return request(self, "supplement/system_ping", ["spot", "private"], "POST", params, nothing, nothing, Dict())
end

function spotPrivatePostSupplementCreateOrderTest(self::Lbank, params=Dict(), context=Dict())
    return request(self, "supplement/create_order_test", ["spot", "private"], "POST", params, nothing, nothing, Dict())
end

function spotPrivatePostSupplementCreateOrder(self::Lbank, params=Dict(), context=Dict())
    return request(self, "supplement/create_order", ["spot", "private"], "POST", params, nothing, nothing, Dict())
end

function spotPrivatePostSupplementCancelOrder(self::Lbank, params=Dict(), context=Dict())
    return request(self, "supplement/cancel_order", ["spot", "private"], "POST", params, nothing, nothing, Dict())
end

function spotPrivatePostSupplementCancelOrderBySymbol(self::Lbank, params=Dict(), context=Dict())
    return request(self, "supplement/cancel_order_by_symbol", ["spot", "private"], "POST", params, nothing, nothing, Dict())
end

function spotPrivatePostSupplementOrdersInfo(self::Lbank, params=Dict(), context=Dict())
    return request(self, "supplement/orders_info", ["spot", "private"], "POST", params, nothing, nothing, Dict())
end

function spotPrivatePostSupplementOrdersInfoNoDeal(self::Lbank, params=Dict(), context=Dict())
    return request(self, "supplement/orders_info_no_deal", ["spot", "private"], "POST", params, nothing, nothing, Dict())
end

function spotPrivatePostSupplementOrdersInfoHistory(self::Lbank, params=Dict(), context=Dict())
    return request(self, "supplement/orders_info_history", ["spot", "private"], "POST", params, nothing, nothing, Dict())
end

function spotPrivatePostSupplementUserInfoAccount(self::Lbank, params=Dict(), context=Dict())
    return request(self, "supplement/user_info_account", ["spot", "private"], "POST", params, nothing, nothing, Dict())
end

function spotPrivatePostSupplementTransactionHistory(self::Lbank, params=Dict(), context=Dict())
    return request(self, "supplement/transaction_history", ["spot", "private"], "POST", params, nothing, nothing, Dict())
end

function contractPublicGetCfdOpenApiV1PubGetTime(self::Lbank, params=Dict(), context=Dict())
    return request(self, "cfd/openApi/v1/pub/getTime", ["contract", "public"], "GET", params, nothing, nothing, Dict())
end

function contractPublicGetCfdOpenApiV1PubInstrument(self::Lbank, params=Dict(), context=Dict())
    return request(self, "cfd/openApi/v1/pub/instrument", ["contract", "public"], "GET", params, nothing, nothing, Dict())
end

function contractPublicGetCfdOpenApiV1PubMarketData(self::Lbank, params=Dict(), context=Dict())
    return request(self, "cfd/openApi/v1/pub/marketData", ["contract", "public"], "GET", params, nothing, nothing, Dict())
end

function contractPublicGetCfdOpenApiV1PubMarketOrder(self::Lbank, params=Dict(), context=Dict())
    return request(self, "cfd/openApi/v1/pub/marketOrder", ["contract", "public"], "GET", params, nothing, nothing, Dict())
end

function Lbank(; kwargs...)
    inst = Lbank(Exchange(), describe, fetchTime, fetchCurrencies, parseCurrency, fetchMarkets, fetchSpotMarkets, fetchSwapMarkets, parseTicker, fetchTicker, fetchTickers, fetchOrderBook, parseTrade, fetchTrades, parseOHLCV, fetchOHLCV, parseBalance, parseFundingRate, fetchFundingRate, fetchFundingRates, fetchBalance, parseTradingFee, fetchTradingFee, fetchTradingFees, createMarketBuyOrderWithCost, createOrder, parseOrderStatus, parseOrder, fetchOrder, fetchOrderSupplement, fetchOrderDefault, fetchMyTrades, fetchOrders, fetchOpenOrders, cancelOrder, cancelAllOrders, getNetworkCodeForCurrency, fetchDepositAddress, fetchDepositAddressDefault, fetchDepositAddressSupplement, withdraw, parseTransactionStatus, parseTransaction, fetchDeposits, fetchWithdrawals, fetchTransactionFees, fetchPrivateTransactionFees, fetchPublicTransactionFees, fetchDepositWithdrawFees, fetchPrivateDepositWithdrawFees, fetchPublicDepositWithdrawFees, parsePublicDepositWithdrawFees, parseDepositWithdrawFee, sign, convertSecretToPem, handleErrors, spotPublicGetCurrencyPairs, spotPublicGetAccuracy, spotPublicGetUsdToCny, spotPublicGetAssetConfigs, spotPublicGetWithdrawConfigs, spotPublicGetTimestamp, spotPublicGetTicker24hr, spotPublicGetTicker, spotPublicGetDepth, spotPublicGetIncrDepth, spotPublicGetTrades, spotPublicGetKline, spotPublicGetSupplementSystemPing, spotPublicGetSupplementIncrDepth, spotPublicGetSupplementTrades, spotPublicGetSupplementTickerPrice, spotPublicGetSupplementTickerBookTicker, spotPublicPostSupplementSystemStatus, spotPrivatePostUserInfo, spotPrivatePostSubscribeGetKey, spotPrivatePostSubscribeRefreshKey, spotPrivatePostSubscribeDestroyKey, spotPrivatePostGetDepositAddress, spotPrivatePostDepositHistory, spotPrivatePostCreateOrder, spotPrivatePostBatchCreateOrder, spotPrivatePostCancelOrder, spotPrivatePostCancelClientOrders, spotPrivatePostOrdersInfo, spotPrivatePostOrdersInfoHistory, spotPrivatePostOrderTransactionDetail, spotPrivatePostTransactionHistory, spotPrivatePostOrdersInfoNoDeal, spotPrivatePostWithdraw, spotPrivatePostWithdrawCancel, spotPrivatePostWithdraws, spotPrivatePostSupplementUserInfo, spotPrivatePostSupplementWithdraw, spotPrivatePostSupplementDepositHistory, spotPrivatePostSupplementWithdraws, spotPrivatePostSupplementGetDepositAddress, spotPrivatePostSupplementAssetDetail, spotPrivatePostSupplementCustomerTradeFee, spotPrivatePostSupplementApiRestrictions, spotPrivatePostSupplementSystemPing, spotPrivatePostSupplementCreateOrderTest, spotPrivatePostSupplementCreateOrder, spotPrivatePostSupplementCancelOrder, spotPrivatePostSupplementCancelOrderBySymbol, spotPrivatePostSupplementOrdersInfo, spotPrivatePostSupplementOrdersInfoNoDeal, spotPrivatePostSupplementOrdersInfoHistory, spotPrivatePostSupplementUserInfoAccount, spotPrivatePostSupplementTransactionHistory, contractPublicGetCfdOpenApiV1PubGetTime, contractPublicGetCfdOpenApiV1PubInstrument, contractPublicGetCfdOpenApiV1PubMarketData, contractPublicGetCfdOpenApiV1PubMarketOrder)
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
