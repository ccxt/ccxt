@kwdef mutable struct Bitvavo <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchTime::Function = fetchTime
    fetchMarkets::Function = fetchMarkets
    parseMarkets::Function = parseMarkets
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    fetchTicker::Function = fetchTicker
    parseTicker::Function = parseTicker
    fetchTickers::Function = fetchTickers
    fetchTrades::Function = fetchTrades
    parseTrade::Function = parseTrade
    fetchTradingFees::Function = fetchTradingFees
    parseTradingFees::Function = parseTradingFees
    fetchTradingFee::Function = fetchTradingFee
    parseTradingFee::Function = parseTradingFee
    fetchOrderBook::Function = fetchOrderBook
    parseOHLCV::Function = parseOHLCV
    fetchOHLCVRequest::Function = fetchOHLCVRequest
    fetchOHLCV::Function = fetchOHLCV
    parseBalance::Function = parseBalance
    fetchBalance::Function = fetchBalance
    fetchAccounts::Function = fetchAccounts
    parseAccount::Function = parseAccount
    transfer::Function = transfer
    fetchTransfers::Function = fetchTransfers
    fetchTransfer::Function = fetchTransfer
    parseTransferStatus::Function = parseTransferStatus
    parseTransfer::Function = parseTransfer
    fetchDepositAddress::Function = fetchDepositAddress
    createOrderRequest::Function = createOrderRequest
    createOrder::Function = createOrder
    editOrderRequest::Function = editOrderRequest
    editOrder::Function = editOrder
    cancelOrderRequest::Function = cancelOrderRequest
    cancelOrder::Function = cancelOrder
    cancelAllOrders::Function = cancelAllOrders
    cancelAllOrdersAfter::Function = cancelAllOrdersAfter
    fetchOrder::Function = fetchOrder
    fetchOrdersRequest::Function = fetchOrdersRequest
    fetchOrders::Function = fetchOrders
    fetchOpenOrders::Function = fetchOpenOrders
    parseOrderStatus::Function = parseOrderStatus
    parseOrder::Function = parseOrder
    fetchMyTradesRequest::Function = fetchMyTradesRequest
    fetchMyTrades::Function = fetchMyTrades
    fetchLedger::Function = fetchLedger
    parseLedgerEntryType::Function = parseLedgerEntryType
    parseLedgerEntry::Function = parseLedgerEntry
    withdrawRequest::Function = withdrawRequest
    withdraw::Function = withdraw
    fetchWithdrawalsRequest::Function = fetchWithdrawalsRequest
    fetchWithdrawals::Function = fetchWithdrawals
    fetchDepositsRequest::Function = fetchDepositsRequest
    fetchDeposits::Function = fetchDeposits
    parseTransactionStatus::Function = parseTransactionStatus
    parseTransaction::Function = parseTransaction
    parseDepositWithdrawFee::Function = parseDepositWithdrawFee
    fetchDepositWithdrawFees::Function = fetchDepositWithdrawFees
    sign::Function = sign
    handleErrors::Function = handleErrors
    calculateRateLimiterCost::Function = calculateRateLimiterCost

# Generated REST endpoint fields
    publicGetMarketBook::Function = publicGetMarketBook
    publicGetReportMarketBook::Function = publicGetReportMarketBook
    publicGetMarketTrades::Function = publicGetMarketTrades
    publicGetReportMarketTrades::Function = publicGetReportMarketTrades
    publicGetTickerPrice::Function = publicGetTickerPrice
    publicGetTickerBook::Function = publicGetTickerBook
    publicGetMarketCandles::Function = publicGetMarketCandles
    publicGetTicker24h::Function = publicGetTicker24h
    publicGetTime::Function = publicGetTime
    publicGetMarkets::Function = publicGetMarkets
    publicGetAssets::Function = publicGetAssets
    privateGetOrder::Function = privateGetOrder
    privateGetOrdersOpen::Function = privateGetOrdersOpen
    privateGetTrades::Function = privateGetTrades
    privateGetOrders::Function = privateGetOrders
    privateGetDeposit::Function = privateGetDeposit
    privateGetDepositHistory::Function = privateGetDepositHistory
    privateGetWithdrawalHistory::Function = privateGetWithdrawalHistory
    privateGetAccount::Function = privateGetAccount
    privateGetBalance::Function = privateGetBalance
    privateGetStakingBalance::Function = privateGetStakingBalance
    privateGetAccountFees::Function = privateGetAccountFees
    privateGetAccountHistory::Function = privateGetAccountHistory
    privateGetSubaccounts::Function = privateGetSubaccounts
    privateGetSubaccountsTransfers::Function = privateGetSubaccountsTransfers
    privateGetSubaccountsTransfersTransferId::Function = privateGetSubaccountsTransfersTransferId
    privateGetInstitutionalSubaccountsBalance::Function = privateGetInstitutionalSubaccountsBalance
    privateGetInstitutionalSubaccountsHistory::Function = privateGetInstitutionalSubaccountsHistory
    privateGetInstitutionalSubaccountsOrdersOpen::Function = privateGetInstitutionalSubaccountsOrdersOpen
    privatePostOrder::Function = privatePostOrder
    privatePostCancelOrdersAfter::Function = privatePostCancelOrdersAfter
    privatePostWithdrawal::Function = privatePostWithdrawal
    privatePostCryptoWithdrawal::Function = privatePostCryptoWithdrawal
    privatePostSubaccounts::Function = privatePostSubaccounts
    privatePostSubaccountsTransfers::Function = privatePostSubaccountsTransfers
    privatePutOrder::Function = privatePutOrder
    privateDeleteOrder::Function = privateDeleteOrder
    privateDeleteOrders::Function = privateDeleteOrders
    privateDeleteAtomicOrders::Function = privateDeleteAtomicOrders
    privateDeleteInstitutionalSubaccountsOrder::Function = privateDeleteInstitutionalSubaccountsOrder
    privateDeleteInstitutionalSubaccountsOrders::Function = privateDeleteInstitutionalSubaccountsOrders

end
function describe(self::Bitvavo, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "bitvavo",
    Symbol("name") => "Bitvavo",
    Symbol("countries") => ["NL"],
    Symbol("rateLimit") => 60,
    Symbol("version") => "v2",
    Symbol("certified") => false,
    Symbol("pro") => true,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => true,
        Symbol("margin") => false,
        Symbol("swap") => false,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("addMargin") => false,
        Symbol("borrowCrossMargin") => false,
        Symbol("borrowIsolatedMargin") => false,
        Symbol("borrowMargin") => false,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelAllOrdersAfter") => true,
        Symbol("cancelOrder") => true,
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => false,
        Symbol("createLimitOrder") => true,
        Symbol("createMarketOrder") => true,
        Symbol("createMarketOrderWithCost") => true,
        Symbol("createOrder") => true,
        Symbol("createOrderWithTakeProfitAndStopLoss") => false,
        Symbol("createOrderWithTakeProfitAndStopLossWs") => false,
        Symbol("createPostOnlyOrder") => true,
        Symbol("createReduceOnlyOrder") => false,
        Symbol("createStopLimitOrder") => true,
        Symbol("createStopMarketOrder") => true,
        Symbol("createStopOrder") => true,
        Symbol("editOrder") => true,
        Symbol("fetchAccounts") => true,
        Symbol("fetchBalance") => true,
        Symbol("fetchBorrowInterest") => false,
        Symbol("fetchBorrowRate") => false,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchBorrowRates") => false,
        Symbol("fetchBorrowRatesPerSymbol") => false,
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
        Symbol("fetchFundingInterval") => false,
        Symbol("fetchFundingIntervals") => false,
        Symbol("fetchFundingRate") => false,
        Symbol("fetchFundingRateHistory") => false,
        Symbol("fetchFundingRates") => false,
        Symbol("fetchGreeks") => false,
        Symbol("fetchIndexOHLCV") => false,
        Symbol("fetchIsolatedBorrowRate") => false,
        Symbol("fetchIsolatedBorrowRates") => false,
        Symbol("fetchIsolatedPositions") => false,
        Symbol("fetchLedger") => true,
        Symbol("fetchLedgerEntry") => false,
        Symbol("fetchLeverage") => false,
        Symbol("fetchLeverages") => false,
        Symbol("fetchLeverageTiers") => false,
        Symbol("fetchLiquidations") => false,
        Symbol("fetchLongShortRatio") => false,
        Symbol("fetchLongShortRatioHistory") => false,
        Symbol("fetchMarginAdjustmentHistory") => false,
        Symbol("fetchMarginMode") => false,
        Symbol("fetchMarginModes") => false,
        Symbol("fetchMarketLeverageTiers") => false,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => false,
        Symbol("fetchMarkPrices") => false,
        Symbol("fetchMyLiquidations") => false,
        Symbol("fetchMySettlementHistory") => false,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterest") => false,
        Symbol("fetchOpenInterestHistory") => false,
        Symbol("fetchOpenInterests") => false,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOption") => false,
        Symbol("fetchOptionChain") => false,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrders") => true,
        Symbol("fetchPosition") => false,
        Symbol("fetchPositionHistory") => false,
        Symbol("fetchPositionMode") => false,
        Symbol("fetchPositions") => false,
        Symbol("fetchPositionsForSymbol") => false,
        Symbol("fetchPositionsHistory") => false,
        Symbol("fetchPositionsRisk") => false,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchSettlementHistory") => false,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => true,
        Symbol("fetchTradingFees") => true,
        Symbol("fetchTransactions") => false,
        Symbol("fetchTransfer") => true,
        Symbol("fetchTransfers") => true,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("fetchWithdrawals") => true,
        Symbol("reduceMargin") => false,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("repayMargin") => false,
        Symbol("setLeverage") => false,
        Symbol("setMargin") => false,
        Symbol("setMarginMode") => false,
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
        Symbol("2h") => "2h",
        Symbol("4h") => "4h",
        Symbol("6h") => "6h",
        Symbol("8h") => "8h",
        Symbol("12h") => "12h",
        Symbol("1d") => "1d"
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/35d690b1-5710-47f6-86e9-d638ce38685a",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => "https://api.bitvavo.com",
            Symbol("private") => "https://api.bitvavo.com"
        ),
        Symbol("www") => "https://bitvavo.com/",
        Symbol("doc") => "https://docs.bitvavo.com/",
        Symbol("fees") => "https://bitvavo.com/en/fees",
        Symbol("referral") => "https://bitvavo.com/?a=24F34952F7"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("{market}/book") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("report/{market}/book") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("{market}/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("report/{market}/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("ticker/price") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ticker/book") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("{market}/candles") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ticker/24h") => Dict{Symbol, Any}(
    Symbol("cost") => 1,
    Symbol("noMarket") => 25
),
                Symbol("time") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("markets") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("assets") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ordersOpen") => Dict{Symbol, Any}(
    Symbol("cost") => 5,
    Symbol("noMarket") => 100
),
                Symbol("trades") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("deposit") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("depositHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("withdrawalHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("account") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("balance") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("stakingBalance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/fees") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("subaccounts") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("subaccounts/transfers") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("subaccounts/transfers/{transferId}") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("institutional/subaccounts/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("institutional/subaccounts/history") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("institutional/subaccounts/orders/open") => Dict{Symbol, Any}(
    Symbol("cost") => 5,
    Symbol("noMarket") => 100
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("cancelOrdersAfter") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("withdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("crypto/withdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 25
),
                Symbol("subaccounts") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("subaccounts/transfers") => Dict{Symbol, Any}(
    Symbol("cost") => 5
)
            ),
            Symbol("put") => Dict{Symbol, Any}(
                Symbol("order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 25,
    Symbol("noMarket") => 100
),
                Symbol("atomic/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 100
),
                Symbol("institutional/subaccounts/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("institutional/subaccounts/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 25,
    Symbol("noMarket") => 100
)
            )
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("tierBased") => true,
            Symbol("percentage") => true,
            Symbol("taker") => self.parseNumber("0.0025"),
            Symbol("maker") => self.parseNumber("0.002"),
            Symbol("tiers") => Dict{Symbol, Any}(
                Symbol("taker") => [[self.parseNumber("0"), self.parseNumber("0.0025")], [self.parseNumber("100000"), self.parseNumber("0.0020")], [self.parseNumber("250000"), self.parseNumber("0.0016")], [self.parseNumber("500000"), self.parseNumber("0.0012")], [self.parseNumber("1000000"), self.parseNumber("0.0010")], [self.parseNumber("2500000"), self.parseNumber("0.0008")], [self.parseNumber("5000000"), self.parseNumber("0.0006")], [self.parseNumber("10000000"), self.parseNumber("0.0005")], [self.parseNumber("25000000"), self.parseNumber("0.0004")]],
                Symbol("maker") => [[self.parseNumber("0"), self.parseNumber("0.0015")], [self.parseNumber("100000"), self.parseNumber("0.0010")], [self.parseNumber("250000"), self.parseNumber("0.0008")], [self.parseNumber("500000"), self.parseNumber("0.0006")], [self.parseNumber("1000000"), self.parseNumber("0.0005")], [self.parseNumber("2500000"), self.parseNumber("0.0004")], [self.parseNumber("5000000"), self.parseNumber("0.0004")], [self.parseNumber("10000000"), self.parseNumber("0.0003")], [self.parseNumber("25000000"), self.parseNumber("0.0003")]]
            )
        )
    ),
    Symbol("requiredCredentials") => Dict{Symbol, Any}(
        Symbol("apiKey") => true,
        Symbol("secret") => true
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("sandbox") => false,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("triggerPrice") => true,
                Symbol("triggerPriceType") => nothing,
                Symbol("triggerDirection") => nothing,
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
                Symbol("trailing") => false,
                Symbol("leverage") => false,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("marketBuyByCost") => true,
                Symbol("selfTradePrevention") => Dict{Symbol, Any}(
                    Symbol("EXPIRE_MAKER") => false,
                    Symbol("EXPIRE_TAKER") => false,
                    Symbol("EXPIRE_BOTH") => true,
                    Symbol("NONE") => false
                ),
                Symbol("iceberg") => false
            ),
            Symbol("createOrders") => nothing,
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 1000,
                Symbol("daysBack") => 100000,
                Symbol("untilDays") => 100000,
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
                Symbol("limit") => nothing,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("limit") => 1000,
                Symbol("daysBack") => 100000,
                Symbol("untilDays") => 100000,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchClosedOrders") => nothing,
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 1440
            )
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
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("101") => ExchangeError,
            Symbol("102") => BadRequest,
            Symbol("103") => RateLimitExceeded,
            Symbol("104") => RateLimitExceeded,
            Symbol("105") => RateLimitExceeded,
            Symbol("107") => ExchangeNotAvailable,
            Symbol("108") => ExchangeNotAvailable,
            Symbol("109") => ExchangeNotAvailable,
            Symbol("110") => BadRequest,
            Symbol("200") => BadRequest,
            Symbol("201") => BadRequest,
            Symbol("202") => BadRequest,
            Symbol("203") => BadSymbol,
            Symbol("204") => BadRequest,
            Symbol("205") => BadRequest,
            Symbol("206") => BadRequest,
            Symbol("210") => InvalidOrder,
            Symbol("211") => InvalidOrder,
            Symbol("212") => InvalidOrder,
            Symbol("213") => InvalidOrder,
            Symbol("214") => InvalidOrder,
            Symbol("215") => InvalidOrder,
            Symbol("216") => InsufficientFunds,
            Symbol("217") => InvalidOrder,
            Symbol("230") => ExchangeError,
            Symbol("231") => ExchangeError,
            Symbol("232") => BadRequest,
            Symbol("233") => OrderNotFound,
            Symbol("234") => InvalidOrder,
            Symbol("235") => ExchangeError,
            Symbol("236") => BadRequest,
            Symbol("240") => OrderNotFound,
            Symbol("300") => AuthenticationError,
            Symbol("301") => AuthenticationError,
            Symbol("302") => AuthenticationError,
            Symbol("303") => AuthenticationError,
            Symbol("304") => AuthenticationError,
            Symbol("305") => AuthenticationError,
            Symbol("306") => AuthenticationError,
            Symbol("307") => PermissionDenied,
            Symbol("308") => AuthenticationError,
            Symbol("309") => AuthenticationError,
            Symbol("310") => PermissionDenied,
            Symbol("311") => PermissionDenied,
            Symbol("312") => PermissionDenied,
            Symbol("315") => BadRequest,
            Symbol("317") => AccountSuspended,
            Symbol("400") => ExchangeError,
            Symbol("401") => ExchangeError,
            Symbol("402") => PermissionDenied,
            Symbol("403") => PermissionDenied,
            Symbol("404") => OnMaintenance,
            Symbol("405") => ExchangeError,
            Symbol("406") => BadRequest,
            Symbol("407") => ExchangeError,
            Symbol("408") => InsufficientFunds,
            Symbol("409") => InvalidAddress,
            Symbol("410") => ExchangeError,
            Symbol("411") => BadRequest,
            Symbol("412") => InvalidAddress,
            Symbol("413") => InvalidAddress,
            Symbol("414") => ExchangeError
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("start parameter is invalid") => BadRequest,
            Symbol("symbol parameter is invalid") => BadSymbol,
            Symbol("amount parameter is invalid") => InvalidOrder,
            Symbol("orderId parameter is invalid") => InvalidOrder
        )
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("mica") => true,
        Symbol("currencyToPrecisionRoundingMode") => TRUNCATE,
        Symbol("recvWindow") => 10000,
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("ERC20") => "ETH",
            Symbol("TRC20") => "TRX"
        ),
        Symbol("operatorId") => nothing,
        Symbol("fetchCurrencies") => Dict{Symbol, Any}(
            Symbol("fiatCurrencies") => ["EUR"]
        )
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("commonCurrencies") => Dict{Symbol, Any}(
        Symbol("MIOTA") => "IOTA"
    ),
    Symbol("rollingWindowSize") => 60000
))

end
function fetchTime(self::Bitvavo, params=Dict())
    response = Base.fetch(self.publicGetTime(params));
    return safeInteger(response, "time")

end
function fetchMarkets(self::Bitvavo, params=Dict())
    response = Base.fetch(self.publicGetMarkets(params));
    return self.parseMarkets(response)

end
function parseMarkets(self::Bitvavo, markets)
    result = [];
    fees = self.fees;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(markets)))
        market = get(markets, i + 1, nothing);
        id = safeString(market, "market");
        baseId = safeString(market, "base");
        quoteId = safeString(market, "quote");
        base = self.safeCurrencyCode(baseId);
        quote_var = self.safeCurrencyCode(quoteId);
        status = safeString(market, "status");
        push!(result, self.safeMarketStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("symbol") => string(base, "/", quote_var),
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => nothing,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => nothing,
    Symbol("type") => "spot",
    Symbol("spot") => true,
    Symbol("margin") => false,
    Symbol("swap") => false,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => (status == "trading"),
    Symbol("contract") => false,
    Symbol("linear") => nothing,
    Symbol("inverse") => nothing,
    Symbol("contractSize") => nothing,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("taker") => get(get(fees, Symbol("trading"), nothing), Symbol("taker"), nothing),
    Symbol("maker") => get(get(fees, Symbol("trading"), nothing), Symbol("maker"), nothing),
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.parseNumber(self.parsePrecision(safeString(market, "quantityDecimals"))),
        Symbol("price") => self.safeNumber(market, "tickSize"),
        Symbol("cost") => self.parseNumber(self.parsePrecision(safeString(market, "notionalDecimals")))
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "minOrderInBaseAsset"),
            Symbol("max") => self.safeNumber(market, "maxOrderInBaseAsset")
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "minOrderInQuoteAsset"),
            Symbol("max") => self.safeNumber(market, "maxOrderInQuoteAsset")
        )
    ),
    Symbol("created") => nothing,
    Symbol("info") => market
)));
        i += 1
    end
    return result

end
function fetchCurrencies(self::Bitvavo, params=Dict())
    response = Base.fetch(self.publicGetAssets(params));
    return self.parseCurrencies(response)

end
function parseCurrency(self::Bitvavo, rawCurrency)
    fiatCurrencies = self.handleOption("fetchCurrencies", "fiatCurrencies", []);
    id = safeString(rawCurrency, "symbol");
    code = self.safeCurrencyCode(id);
    isFiat = inArray(code, fiatCurrencies);
    networks = Dict{Symbol, Any}();
    networksArray = self.safeList(rawCurrency, "networks", []);
    deposit = safeString(rawCurrency, "depositStatus") == "OK";
    withdrawal = safeString(rawCurrency, "withdrawalStatus") == "OK";
    active = @functions.ccxt_and(deposit, withdrawal);
    withdrawFee = self.safeNumber(rawCurrency, "withdrawalFee");
    precision = safeString(rawCurrency, "decimals", "8");
    minWithdraw = self.safeNumber(rawCurrency, "withdrawalMinAmount");
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(networksArray)))
        networkId = get(networksArray, j + 1, nothing);
        networkCode = self.networkIdToCode(networkId, code);
        if functions.ccxtruthy(networkCode != nothing)
            networks[Symbol(networkCode)] = Dict{Symbol, Any}(
                Symbol("info") => rawCurrency,
                Symbol("id") => networkId,
                Symbol("network") => networkCode,
                Symbol("active") => active,
                Symbol("deposit") => deposit,
                Symbol("withdraw") => withdrawal,
                Symbol("fee") => withdrawFee,
                Symbol("precision") => self.parseNumber(self.parsePrecision(precision)),
                Symbol("limits") => Dict{Symbol, Any}(
                    Symbol("withdraw") => Dict{Symbol, Any}(
                        Symbol("min") => minWithdraw,
                        Symbol("max") => nothing
                    )
                )
            );
        end
        j += 1
    end
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("info") => rawCurrency,
    Symbol("id") => id,
    Symbol("code") => code,
    Symbol("name") => safeString(rawCurrency, "name"),
    Symbol("active") => active,
    Symbol("deposit") => deposit,
    Symbol("withdraw") => withdrawal,
    Symbol("networks") => networks,
    Symbol("fee") => withdrawFee,
    Symbol("precision") => nothing,
    Symbol("type") => functions.ccxtruthy(isFiat) ? "fiat" : "crypto",
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("deposit") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("min") => minWithdraw,
            Symbol("max") => nothing
        )
    )
))

end
function fetchTicker(self::Bitvavo, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetTicker24h(extend(request, params)));
    return self.parseTicker(response, market)

end
function parseTicker(self::Bitvavo, ticker, market=nothing)
    marketId = safeString(ticker, "market");
    symbol = self.safeSymbol(marketId, market, "-");
    timestamp = safeInteger(ticker, "timestamp");
    last_var = safeString(ticker, "last");
    baseVolume = safeString(ticker, "volume");
    quoteVolume = safeString(ticker, "volumeQuote");
    open = safeString(ticker, "open");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => safeString(ticker, "high"),
    Symbol("low") => safeString(ticker, "low"),
    Symbol("bid") => safeString(ticker, "bid"),
    Symbol("bidVolume") => safeString(ticker, "bidSize"),
    Symbol("ask") => safeString(ticker, "ask"),
    Symbol("askVolume") => safeString(ticker, "askSize"),
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
    Symbol("info") => ticker
), market)

end
function fetchTickers(self::Bitvavo, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.publicGetTicker24h(params));
    return self.parseTickers(response, symbols)

end
function fetchTrades(self::Bitvavo, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchTrades", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchTrades", symbol, since, limit, params))
    end
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 1000);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start")] = since;
    end
    (request, params) = self.handleUntilOption("end", request, params);
    response = Base.fetch(self.publicGetMarketTrades(extend(request, params)));
    return self.parseTrades(response, market, since, limit)

end
function parseTrade(self::Bitvavo, trade, market=nothing)
    priceString = safeString(trade, "price");
    amountString = safeString(trade, "amount");
    timestamp = safeInteger(trade, "timestamp");
    side = safeString(trade, "side");
    id = safeString2(trade, "id", "fillId");
    marketId = safeString(trade, "market");
    symbol = self.safeSymbol(marketId, market, "-");
    taker = safeValue(trade, "taker");
    takerOrMaker = nothing;
    if functions.ccxtruthy(taker != nothing)
        takerOrMaker = functions.ccxtruthy(taker) ? "taker" : "maker";
    end
    feeCostString = safeString(trade, "fee");
    fee = nothing;
    if functions.ccxtruthy(feeCostString != nothing)
        feeCurrencyId = safeString(trade, "feeCurrency");
        feeCurrencyCode = self.safeCurrencyCode(feeCurrencyId);
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCostString,
            Symbol("currency") => feeCurrencyCode
        );
    end
    orderId = safeString(trade, "orderId");
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("id") => id,
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("order") => orderId,
    Symbol("type") => nothing,
    Symbol("side") => side,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("price") => priceString,
    Symbol("amount") => amountString,
    Symbol("cost") => nothing,
    Symbol("fee") => fee
), market)

end
function fetchTradingFees(self::Bitvavo, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetAccount(params));
    return self.parseTradingFees(response)

end
function parseTradingFees(self::Bitvavo, fees, market=nothing)
    feesValue = safeValue(fees, "fees");
    maker = self.safeNumber(feesValue, "maker");
    taker = self.safeNumber(feesValue, "taker");
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(self.symbols)))
        symbol = get(self.symbols, i + 1, nothing);
        result[Symbol(symbol)] = Dict{Symbol, Any}(
            Symbol("info") => fees,
            Symbol("symbol") => symbol,
            Symbol("maker") => maker,
            Symbol("taker") => taker,
            Symbol("percentage") => true,
            Symbol("tierBased") => true
        );
        i += 1
    end
    return result

end
function fetchTradingFee(self::Bitvavo, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateGetAccountFees(extend(request, params)));
    return self.parseTradingFee(response, market)

end
function parseTradingFee(self::Bitvavo, fee, market=nothing)
    return Dict{Symbol, Any}(
    Symbol("info") => fee,
    Symbol("symbol") => self.safeSymbol(nothing, market),
    Symbol("maker") => self.safeNumber(fee, "maker"),
    Symbol("taker") => self.safeNumber(fee, "taker"),
    Symbol("percentage") => true,
    Symbol("tierBased") => true
)

end
function fetchOrderBook(self::Bitvavo, symbol, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("depth")] = limit;
    end
    response = Base.fetch(self.publicGetMarketBook(extend(request, params)));
    orderbook = self.parseOrderBook(response, get(market, Symbol("symbol"), nothing));
    orderbook[Symbol("nonce")] = safeInteger(response, "nonce");
    return orderbook

end
function parseOHLCV(self::Bitvavo, ohlcv, market=nothing)
    return [safeInteger(ohlcv, 0), self.safeNumber(ohlcv, 1), self.safeNumber(ohlcv, 2), self.safeNumber(ohlcv, 3), self.safeNumber(ohlcv, 4), self.safeNumber(ohlcv, 5)]

end
function fetchOHLCVRequest(self::Bitvavo, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing),
        Symbol("interval") => safeString(self.timeframes, timeframe, timeframe)
    );
    if functions.ccxtruthy(since != nothing)
        duration = self.parseTimeframe(timeframe);
        request[Symbol("start")] = since;
        if functions.ccxtruthy(limit == nothing)
            limit = 1440;
        else
            limit = min(limit, 1440);
        end
        request[Symbol("end")] = self.sum(since, limit * duration * 1000);
    end
    (request, params) = self.handleUntilOption("end", request, params);
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    return extend(request, params)

end
function fetchOHLCV(self::Bitvavo, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOHLCV", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchOHLCV", symbol, since, limit, timeframe, params, 1440))
    end
    request = self.fetchOHLCVRequest(symbol, timeframe, since, limit, params);
    response = Base.fetch(self.publicGetMarketCandles(request));
    return self.parseOHLCVs(toArray(response), market, timeframe, since, limit)

end
function parseBalance(self::Bitvavo, response)
    result = Dict{Symbol, Any}(
        Symbol("info") => response,
        Symbol("timestamp") => nothing,
        Symbol("datetime") => nothing
    );
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        balance = get(response, i + 1, nothing);
        currencyId = safeString(balance, "symbol");
        code = self.safeCurrencyCode(currencyId);
        account = self.account();
        account[Symbol("free")] = safeString(balance, "available");
        account[Symbol("used")] = safeString(balance, "inOrder");
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
function fetchBalance(self::Bitvavo, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetBalance(params));
    return self.parseBalance(response)

end
function fetchAccounts(self::Bitvavo, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetSubaccounts(params));
    accounts = self.safeList(response, "items", []);
    return self.parseAccounts(accounts)

end
function parseAccount(self::Bitvavo, account)
    return Dict{Symbol, Any}(
    Symbol("id") => safeString(account, "id"),
    Symbol("type") => safeString(account, "type"),
    Symbol("code") => nothing,
    Symbol("info") => account
)

end
function transfer(self::Bitvavo, code, amount, fromAccount, toAccount, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    subaccountId = safeString(params, "subaccountId");
    params = omit(params, "subaccountId");
    direction = nothing;
    if functions.ccxtruthy(@functions.ccxt_and((fromAccount == "master"), (toAccount == "master")))
        throw(ArgumentsRequired(string(self.id, " transfer() requires fromAccount and toAccount to be different (one master and one subaccount id)")));
    elseif functions.ccxtruthy(fromAccount == "master")
        direction = "masterToSub";
        if functions.ccxtruthy(subaccountId == nothing)
            subaccountId = toAccount;
        end
    else
        if functions.ccxtruthy(toAccount == "master")
            direction = "subToMaster";
            if functions.ccxtruthy(subaccountId == nothing)
                subaccountId = fromAccount;
            end
        else
            throw(ArgumentsRequired(string(self.id, " transfer() requires either fromAccount or toAccount to be master")));
        end

    end
    if functions.ccxtruthy(subaccountId == nothing)
        throw(ArgumentsRequired(string(self.id, " transfer() requires a subaccount id (provide it as fromAccount/toAccount or params.subaccountId)")));
    end
    request = Dict{Symbol, Any}(
        Symbol("subaccountId") => subaccountId,
        Symbol("direction") => direction,
        Symbol("symbol") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => self.currencyToPrecision(code, amount)
    );
    response = Base.fetch(self.privatePostSubaccountsTransfers(extend(request, params)));
    return self.parseTransfer(response, currency)

end
function fetchTransfers(self::Bitvavo, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("symbol")] = get(currency, Symbol("id"), nothing);
    end
    subaccountId = safeString(params, "subaccountId");
    if functions.ccxtruthy(subaccountId == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchTransfers() requires a subaccountId parameter")));
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    (request, params) = self.handleUntilOption("end", request, params);
    response = Base.fetch(self.privateGetSubaccountsTransfers(extend(request, params)));
    items = self.safeList(response, "items", []);
    return self.parseTransfers(items, currency, since, limit)

end
function fetchTransfer(self::Bitvavo, id, code=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    request = Dict{Symbol, Any}(
        Symbol("transferId") => id
    );
    response = Base.fetch(self.privateGetSubaccountsTransfersTransferId(extend(request, params)));
    return self.parseTransfer(response, currency)

end
function parseTransferStatus(self::Bitvavo, status)
    statuses = Dict{Symbol, Any}(
        Symbol("completed") => "ok",
        Symbol("pending") => "pending",
        Symbol("failed") => "failed"
    );
    return safeString(statuses, status, status)

end
function parseTransfer(self::Bitvavo, transfer, currency=nothing)
    currencyId = safeString(transfer, "symbol");
    code = self.safeCurrencyCode(currencyId, currency);
    subaccountId = safeString(transfer, "subaccountId");
    direction = safeString(transfer, "direction");
    fromAccount = nothing;
    toAccount = nothing;
    if functions.ccxtruthy(direction == "masterToSub")
        fromAccount = "master";
        toAccount = subaccountId;
    elseif functions.ccxtruthy(direction == "subToMaster")
        fromAccount = subaccountId;
        toAccount = "master";
    end
    timestamp = safeInteger(transfer, "createdAt");
    if functions.ccxtruthy(timestamp == nothing)
        timestamp = self.parse8601(safeString(transfer, "createdAt"));
    end
    return Dict{Symbol, Any}(
    Symbol("info") => transfer,
    Symbol("id") => safeString(transfer, "transferId"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("currency") => code,
    Symbol("amount") => self.safeNumber(transfer, "amount"),
    Symbol("fromAccount") => fromAccount,
    Symbol("toAccount") => toAccount,
    Symbol("status") => self.parseTransferStatus(safeString(transfer, "status"))
)

end
function fetchDepositAddress(self::Bitvavo, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(currency, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateGetDeposit(extend(request, params)));
    address = safeString(response, "address");
    tag = safeString(response, "paymentId");
    self.checkAddress(address);
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("currency") => code,
    Symbol("network") => nothing,
    Symbol("address") => address,
    Symbol("tag") => tag
)

end
function createOrderRequest(self::Bitvavo, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(type_var == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a type argument")));
    end
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a side argument")));
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing),
        Symbol("side") => side,
        Symbol("orderType") => type_var
    );
    isMarketOrder = @functions.ccxt_or(@functions.ccxt_or((type_var == "market"), (type_var == "stopLoss")), (type_var == "takeProfit"));
    isLimitOrder = @functions.ccxt_or(@functions.ccxt_or((type_var == "limit"), (type_var == "stopLossLimit")), (type_var == "takeProfitLimit"));
    timeInForce = safeString(params, "timeInForce");
    triggerPrice = safeStringN(params, ["triggerPrice", "stopPrice", "triggerAmount"]);
    postOnly = self.isPostOnly(isMarketOrder, false, params);
    stopLossPrice = safeValue(params, "stopLossPrice");
    takeProfitPrice = safeValue(params, "takeProfitPrice");
    params = omit(params, ["timeInForce", "triggerPrice", "stopPrice", "stopLossPrice", "takeProfitPrice"]);
    if functions.ccxtruthy(isMarketOrder)
        cost = nothing;
        if functions.ccxtruthy(price != nothing)
            priceString = numberToString(price);
            amountString = numberToString(amount);
            quoteAmount = stringMul(amountString, priceString);
            cost = self.parseNumber(quoteAmount);
        else
            cost = self.safeNumber(params, "cost");
        end
        if functions.ccxtruthy(cost != nothing)
            precision = get(self.currency(get(market, Symbol("quote"), nothing)), Symbol("precision"), nothing);
            request[Symbol("amountQuote")] = decimalToPrecision(cost, TRUNCATE, precision, self.precisionMode);
        else
            request[Symbol("amount")] = self.amountToPrecision(symbol, amount);
        end
        params = omit(params, ["cost"]);
    elseif functions.ccxtruthy(isLimitOrder)
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
        request[Symbol("amount")] = self.amountToPrecision(symbol, amount);
    end
    isTakeProfit = @functions.ccxt_or(@functions.ccxt_or((takeProfitPrice != nothing), (type_var == "takeProfit")), (type_var == "takeProfitLimit"));
    isStopLoss = @functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or((stopLossPrice != nothing), @functions.ccxt_and((triggerPrice != nothing), (!functions.ccxtruthy(isTakeProfit)))), (type_var == "stopLoss")), (type_var == "stopLossLimit"));
    if functions.ccxtruthy(isStopLoss)
        if functions.ccxtruthy(stopLossPrice != nothing)
            triggerPrice = stopLossPrice;
        end
        request[Symbol("orderType")] = functions.ccxtruthy(isMarketOrder) ? "stopLoss" : "stopLossLimit";
    elseif functions.ccxtruthy(isTakeProfit)
        if functions.ccxtruthy(takeProfitPrice != nothing)
            triggerPrice = takeProfitPrice;
        end
        request[Symbol("orderType")] = functions.ccxtruthy(isMarketOrder) ? "takeProfit" : "takeProfitLimit";
    end
    if functions.ccxtruthy(triggerPrice != nothing)
        request[Symbol("triggerAmount")] = self.priceToPrecision(symbol, triggerPrice);
        request[Symbol("triggerType")] = "price";
        request[Symbol("triggerReference")] = "lastTrade";
    end
    if functions.ccxtruthy(@functions.ccxt_and((timeInForce != nothing), (timeInForce != "PO")))
        request[Symbol("timeInForce")] = timeInForce;
    end
    if functions.ccxtruthy(postOnly)
        request[Symbol("postOnly")] = true;
    end
    operatorId = nothing;
    (operatorId, params) = self.handleOptionAndParams(params, "createOrder", "operatorId");
    if functions.ccxtruthy(operatorId != nothing)
        request[Symbol("operatorId")] = self.parseToInt(operatorId);
    else
        throw(ArgumentsRequired(string(self.id, " createOrder() requires an operatorId in params or options, eg: exchange.options[\'operatorId\'] = 1234567890")));
    end
    selfTradePrevention = nothing;
    (selfTradePrevention, params) = self.handleOptionAndParams(params, "createOrder", "selfTradePrevention");
    if functions.ccxtruthy(selfTradePrevention != nothing)
        if functions.ccxtruthy(selfTradePrevention == "EXPIRE_BOTH")
            request[Symbol("selfTradePrevention")] = "cancelBoth";
        else
            request[Symbol("selfTradePrevention")] = selfTradePrevention;
        end
    end
    return extend(request, params)

end
function createOrder(self::Bitvavo, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = self.createOrderRequest(symbol, type_var, side, amount, price, params);
    response = Base.fetch(self.privatePostOrder(request));
    return self.parseOrder(response, market)

end
function editOrderRequest(self::Bitvavo, id, symbol, type_var, side, amount=nothing, price=nothing, params=Dict())
    request = Dict{Symbol, Any}();
    market = self.market(symbol);
    amountRemaining = self.safeNumber(params, "amountRemaining");
    triggerPrice = safeStringN(params, ["triggerPrice", "stopPrice", "triggerAmount"]);
    params = omit(params, ["amountRemaining", "triggerPrice", "stopPrice", "triggerAmount"]);
    if functions.ccxtruthy(price != nothing)
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    if functions.ccxtruthy(amount != nothing)
        request[Symbol("amount")] = self.amountToPrecision(symbol, amount);
    end
    if functions.ccxtruthy(amountRemaining != nothing)
        request[Symbol("amountRemaining")] = self.amountToPrecision(symbol, amountRemaining);
    end
    if functions.ccxtruthy(triggerPrice != nothing)
        request[Symbol("triggerAmount")] = self.priceToPrecision(symbol, triggerPrice);
    end
    request = extend(request, params);
    if functions.ccxtruthy(isEmpty(request))
        throw(ArgumentsRequired(string(self.id, " editOrder() requires an amount argument, or a price argument, or non-empty params")));
    end
    clientOrderId = safeString(params, "clientOrderId");
    if functions.ccxtruthy(clientOrderId == nothing)
        request[Symbol("orderId")] = id;
    end
    operatorId = nothing;
    (operatorId, params) = self.handleOptionAndParams(params, "editOrder", "operatorId");
    if functions.ccxtruthy(operatorId != nothing)
        request[Symbol("operatorId")] = self.parseToInt(operatorId);
    else
        throw(ArgumentsRequired(string(self.id, " editOrder() requires an operatorId in params or options, eg: exchange.options[\'operatorId\'] = 1234567890")));
    end
    request[Symbol("market")] = get(market, Symbol("id"), nothing);
    return request

end
function editOrder(self::Bitvavo, id, symbol, type_var, side, amount=nothing, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = self.editOrderRequest(id, symbol, type_var, side, amount, price, params);
    response = Base.fetch(self.privatePutOrder(request));
    return self.parseOrder(response, market)

end
function cancelOrderRequest(self::Bitvavo, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a symbol argument")));
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    clientOrderId = safeString(params, "clientOrderId");
    if functions.ccxtruthy(clientOrderId == nothing)
        request[Symbol("orderId")] = id;
    end
    operatorId = nothing;
    (operatorId, params) = self.handleOptionAndParams(params, "cancelOrder", "operatorId");
    if functions.ccxtruthy(operatorId != nothing)
        request[Symbol("operatorId")] = self.parseToInt(operatorId);
    else
        throw(ArgumentsRequired(string(self.id, " cancelOrder() requires an operatorId in params or options, eg: exchange.options[\'operatorId\'] = 1234567890")));
    end
    return extend(request, params)

end
function cancelOrder(self::Bitvavo, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = self.cancelOrderRequest(id, symbol, params);
    response = Base.fetch(self.privateDeleteOrder(request));
    return self.parseOrder(response, market)

end
function cancelAllOrders(self::Bitvavo, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("market")] = get(market, Symbol("id"), nothing);
    end
    operatorId = nothing;
    (operatorId, params) = self.handleOptionAndParams(params, "cancelAllOrders", "operatorId");
    if functions.ccxtruthy(operatorId != nothing)
        request[Symbol("operatorId")] = self.parseToInt(operatorId);
    else
        throw(ArgumentsRequired(string(self.id, " canceAllOrders() requires an operatorId in params or options, eg: exchange.options[\'operatorId\'] = 1234567890")));
    end
    response = Base.fetch(self.privateDeleteOrders(extend(request, params)));
    return self.parseOrders(response, market)

end
function cancelAllOrdersAfter(self::Bitvavo, timeout, params=Dict())
    if functions.ccxtruthy(functions.ccxt_gt(timeout, 300000))
        throw(BadRequest(string(self.id, " cancelAllOrdersAfter() timeout should be less than or equal to 300000 milliseconds")));
    end
    if functions.ccxtruthy(@functions.ccxt_and((functions.ccxt_gt(timeout, 0)), (functions.ccxt_lt(timeout, 10000))))
        throw(BadRequest(string(self.id, " cancelAllOrdersAfter() timeout should be 0 or greater than or equal to 10000 milliseconds")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    codGroupId = nothing;
    (codGroupId, params) = self.handleOptionAndParams(params, "cancelAllOrdersAfter", "codGroupId", 1);
    request = Dict{Symbol, Any}(
        Symbol("codGroupId") => codGroupId,
        Symbol("expiryAfterSeconds") => functions.ccxtruthy((functions.ccxt_gt(timeout, 0))) ? self.parseToInt(timeout / 1000) : 0
    );
    response = Base.fetch(self.privatePostCancelOrdersAfter(extend(request, params)));
    return response

end
function fetchOrder(self::Bitvavo, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOrder() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    clientOrderId = safeString(params, "clientOrderId");
    if functions.ccxtruthy(clientOrderId == nothing)
        request[Symbol("orderId")] = id;
    end
    response = Base.fetch(self.privateGetOrder(extend(request, params)));
    return self.parseOrder(response, market)

end
function fetchOrdersRequest(self::Bitvavo, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    (request, params) = self.handleUntilOption("end", request, params);
    return extend(request, params)

end
function fetchOrders(self::Bitvavo, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOrders", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchOrders", symbol, since, limit, params))
    end
    market = self.market(symbol);
    request = self.fetchOrdersRequest(symbol, since, limit, params);
    response = Base.fetch(self.privateGetOrders(request));
    return self.parseOrders(response, market, since, limit)

end
function fetchOpenOrders(self::Bitvavo, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("market")] = get(market, Symbol("id"), nothing);
    end
    response = Base.fetch(self.privateGetOrdersOpen(extend(request, params)));
    return self.parseOrders(response, market, since, limit)

end
function parseOrderStatus(self::Bitvavo, status)
    statuses = Dict{Symbol, Any}(
        Symbol("new") => "open",
        Symbol("canceled") => "canceled",
        Symbol("canceledAuction") => "canceled",
        Symbol("canceledSelfTradePrevention") => "canceled",
        Symbol("canceledIOC") => "canceled",
        Symbol("canceledFOK") => "canceled",
        Symbol("canceledMarketProtection") => "canceled",
        Symbol("canceledPostOnly") => "canceled",
        Symbol("filled") => "closed",
        Symbol("partiallyFilled") => "open",
        Symbol("expired") => "canceled",
        Symbol("rejected") => "canceled",
        Symbol("awaitingTrigger") => "open"
    );
    return safeString(statuses, status, status)

end
function parseOrder(self::Bitvavo, order, market=nothing)
    id = safeString(order, "orderId");
    timestamp = safeInteger(order, "created");
    marketId = safeString(order, "market");
    market = self.safeMarket(marketId, market, "-");
    symbol = get(market, Symbol("symbol"), nothing);
    status = self.parseOrderStatus(safeString(order, "status"));
    side = safeString(order, "side");
    type_var = safeString(order, "orderType");
    price = safeString(order, "price");
    amount = safeString(order, "amount");
    remaining = safeString(order, "amountRemaining");
    filled = safeString(order, "filledAmount");
    cost = safeString(order, "filledAmountQuote");
    if functions.ccxtruthy(cost == nothing)
        amountQuote = safeString(order, "amountQuote");
        amountQuoteRemaining = safeString(order, "amountQuoteRemaining");
        cost = stringSub(amountQuote, amountQuoteRemaining);
    end
    fee = nothing;
    feeCost = self.safeNumber(order, "feePaid");
    if functions.ccxtruthy(feeCost != nothing)
        feeCurrencyId = safeString(order, "feeCurrency");
        feeCurrencyCode = self.safeCurrencyCode(feeCurrencyId);
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCost,
            Symbol("currency") => feeCurrencyCode
        );
    end
    rawTrades = safeValue(order, "fills", []);
    timeInForce = safeString(order, "timeInForce");
    postOnly = safeValue(order, "postOnly");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => id,
    Symbol("clientOrderId") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("symbol") => symbol,
    Symbol("type") => type_var,
    Symbol("timeInForce") => timeInForce,
    Symbol("postOnly") => postOnly,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("triggerPrice") => self.safeNumber(order, "triggerPrice"),
    Symbol("amount") => amount,
    Symbol("cost") => cost,
    Symbol("average") => nothing,
    Symbol("filled") => filled,
    Symbol("remaining") => remaining,
    Symbol("status") => status,
    Symbol("fee") => fee,
    Symbol("trades") => rawTrades
), market)

end
function fetchMyTradesRequest(self::Bitvavo, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    (request, params) = self.handleUntilOption("end", request, params);
    return extend(request, params)

end
function fetchMyTrades(self::Bitvavo, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchMyTrades() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchMyTrades", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchMyTrades", symbol, since, limit, params))
    end
    market = self.market(symbol);
    request = self.fetchMyTradesRequest(symbol, since, limit, params);
    response = Base.fetch(self.privateGetTrades(request));
    return self.parseTrades(response, market, since, limit)

end
function fetchLedger(self::Bitvavo, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("fromDate")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("maxItems")] = min(limit, 100);
    end
    (request, params) = self.handleUntilOption("toDate", request, params);
    response = Base.fetch(self.privateGetAccountHistory(extend(request, params)));
    items = self.safeList(response, "items", []);
    return self.parseLedger(items, currency, since, limit)

end
function parseLedgerEntryType(self::Bitvavo, type_var)
    types = Dict{Symbol, Any}(
        Symbol("buy") => "trade",
        Symbol("sell") => "trade",
        Symbol("deposit") => "transaction",
        Symbol("withdrawal") => "transaction",
        Symbol("withdrawal_cancelled") => "transaction",
        Symbol("internal_transfer") => "transaction",
        Symbol("external_transferred_funds") => "transaction"
    );
    return safeString(types, type_var, type_var)

end
function parseLedgerEntry(self::Bitvavo, item, currency=nothing)
    rawType = safeString(item, "type");
    type_var = self.parseLedgerEntryType(rawType);
    currencyId = safeString(item, "receivedCurrency");
    amount = safeString(item, "receivedAmount");
    direction = "in";
    if functions.ccxtruthy(amount == nothing)
        currencyId = safeString(item, "sentCurrency");
        amount = safeString(item, "sentAmount");
        direction = "out";
    end
    code = self.safeCurrencyCode(currencyId);
    currency = self.safeCurrency(currencyId, currency);
    timestamp = self.parse8601(safeString(item, "executedAt"));
    fee = nothing;
    feeCost = safeString(item, "feesAmount");
    if functions.ccxtruthy(feeCost != nothing)
        feeCurrencyId = safeString(item, "feesCurrency");
        feeCurrencyCode = self.safeCurrencyCode(feeCurrencyId);
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCost,
            Symbol("currency") => feeCurrencyCode
        );
    end
    return self.safeLedgerEntry(Dict{Symbol, Any}(
    Symbol("info") => item,
    Symbol("id") => safeString(item, "transactionId"),
    Symbol("direction") => direction,
    Symbol("account") => nothing,
    Symbol("referenceId") => safeString(item, "transactionId"),
    Symbol("referenceAccount") => safeString(item, "address"),
    Symbol("type") => type_var,
    Symbol("currency") => code,
    Symbol("amount") => amount,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("before") => nothing,
    Symbol("after") => nothing,
    Symbol("status") => "ok",
    Symbol("fee") => fee
), currency)

end
function withdrawRequest(self::Bitvavo, code, amount, address, tag=nothing, params=Dict())
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => self.currencyToPrecision(code, amount),
        Symbol("address") => address
    );
    if functions.ccxtruthy(tag != nothing)
        request[Symbol("paymentId")] = tag;
    end
    return extend(request, params)

end
function withdraw(self::Bitvavo, code, amount, address, tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    self.checkAddress(address);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = self.withdrawRequest(code, amount, address, tag, params);
    response = Base.fetch(self.privatePostWithdrawal(request));
    return self.parseTransaction(response, currency)

end
function fetchWithdrawalsRequest(self::Bitvavo, code=nothing, since=nothing, limit=nothing, params=Dict())
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("symbol")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    return extend(request, params)

end
function fetchWithdrawals(self::Bitvavo, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = self.fetchWithdrawalsRequest(code, since, limit, params);
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    response = Base.fetch(self.privateGetWithdrawalHistory(request));
    return self.parseTransactions(response, currency, since, limit, Dict{Symbol, Any}(
    Symbol("type") => "withdrawal"
))

end
function fetchDepositsRequest(self::Bitvavo, code=nothing, since=nothing, limit=nothing, params=Dict())
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("symbol")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    return extend(request, params)

end
function fetchDeposits(self::Bitvavo, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = self.fetchDepositsRequest(code, since, limit, params);
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    response = Base.fetch(self.privateGetDepositHistory(request));
    return self.parseTransactions(response, currency, since, limit, Dict{Symbol, Any}(
    Symbol("type") => "deposit"
))

end
function parseTransactionStatus(self::Bitvavo, status)
    statuses = Dict{Symbol, Any}(
        Symbol("awaiting_processing") => "pending",
        Symbol("awaiting_email_confirmation") => "pending",
        Symbol("awaiting_bitvavo_inspection") => "pending",
        Symbol("approved") => "pending",
        Symbol("sending") => "pending",
        Symbol("in_mempool") => "pending",
        Symbol("processed") => "pending",
        Symbol("completed") => "ok",
        Symbol("canceled") => "canceled"
    );
    return safeString(statuses, status, status)

end
function parseTransaction(self::Bitvavo, transaction, currency=nothing)
    id = nothing;
    timestamp = safeInteger(transaction, "timestamp");
    currencyId = safeString(transaction, "symbol");
    code = self.safeCurrencyCode(currencyId, currency);
    status = self.parseTransactionStatus(safeString(transaction, "status"));
    amount = self.safeNumber(transaction, "amount");
    address = safeString(transaction, "address");
    txid = safeString(transaction, "txId");
    fee = nothing;
    feeCost = self.safeNumber(transaction, "fee");
    if functions.ccxtruthy(feeCost != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCost,
            Symbol("currency") => code
        );
    end
    type_var = nothing;
    if functions.ccxtruthy(@functions.ccxt_or((ccxt_in("success", transaction)), (ccxt_in("address", transaction))))
        type_var = "withdrawal";
    else
        type_var = "deposit";
    end
    tag = safeString(transaction, "paymentId");
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => id,
    Symbol("txid") => txid,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("addressFrom") => nothing,
    Symbol("address") => address,
    Symbol("addressTo") => address,
    Symbol("tagFrom") => nothing,
    Symbol("tag") => tag,
    Symbol("tagTo") => tag,
    Symbol("type") => type_var,
    Symbol("amount") => amount,
    Symbol("currency") => code,
    Symbol("status") => status,
    Symbol("updated") => nothing,
    Symbol("fee") => fee,
    Symbol("network") => nothing,
    Symbol("comment") => nothing,
    Symbol("internal") => nothing
)

end
function parseDepositWithdrawFee(self::Bitvavo, fee, currency=nothing)
    result = Dict{Symbol, Any}(
        Symbol("info") => fee,
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("fee") => self.safeNumber(fee, "withdrawalFee"),
            Symbol("percentage") => false
        ),
        Symbol("deposit") => Dict{Symbol, Any}(
            Symbol("fee") => self.safeNumber(fee, "depositFee"),
            Symbol("percentage") => false
        ),
        Symbol("networks") => Dict{Symbol, Any}()
    );
    networks = safeValue(fee, "networks");
    networkId = safeValue(networks, 0);
    currencyCode = safeString(currency, "code");
    if functions.ccxtruthy(networkId == "Mainnet")
        networkId = currencyCode;
    end
    networkCode = self.networkIdToCode(networkId, currencyCode);
    if functions.ccxtruthy(networkCode != nothing)
        result[Symbol("networks")][Symbol(networkCode)] = Dict{Symbol, Any}(
            Symbol("deposit") => get(result, Symbol("deposit"), nothing),
            Symbol("withdraw") => get(result, Symbol("withdraw"), nothing)
        );
    end
    return result

end
function fetchDepositWithdrawFees(self::Bitvavo, codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.publicGetAssets(params));
    return self.parseDepositWithdrawFees(response, codes, "symbol")

end
function sign(self::Bitvavo, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    query = omit(params, self.extractParams(path));
    url = string("/", self.version, "/", self.implodeParams(path, params));
    getOrDelete = @functions.ccxt_or((method == "GET"), (method == "DELETE"));
    if functions.ccxtruthy(getOrDelete)
        if functions.ccxtruthy(length(objectKeys(query)))
            url += string("?", self.urlencode(query));
        end
    end
    if functions.ccxtruthy(api == "private")
        self.checkRequiredCredentials();
        payload = "";
        if functions.ccxtruthy(!functions.ccxtruthy(getOrDelete))
            if functions.ccxtruthy(length(objectKeys(query)))
                body = json(query);
                payload = body;
            end
        end
        timestamp = string(milliseconds());
        auth = string(timestamp, method, url, payload);
        signature = self.hmac(self.encode(auth), self.encode(self.secret), sha256);
        accessWindow = safeString2(self.options, "recvWindow", "BITVAVO-ACCESS-WINDOW", "10000");
        headers = Dict{Symbol, Any}(
            Symbol("BITVAVO-ACCESS-KEY") => self.apiKey,
            Symbol("BITVAVO-ACCESS-SIGNATURE") => signature,
            Symbol("BITVAVO-ACCESS-TIMESTAMP") => timestamp,
            Symbol("BITVAVO-ACCESS-WINDOW") => accessWindow
        );
        if functions.ccxtruthy(!functions.ccxtruthy(getOrDelete))
            headers[Symbol("Content-Type")] = "application/json";
        end
    end
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing), url);
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Bitvavo, httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    errorCode = safeString(response, "errorCode");
    error = safeString(response, "error");
    if functions.ccxtruthy(errorCode != nothing)
        feedback = string(self.id, " ", body);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), error, feedback);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), errorCode, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end
function calculateRateLimiterCost(self::Bitvavo, api, method, path, params, config=Dict())
    if functions.ccxtruthy(@functions.ccxt_and((ccxt_in("noMarket", config)), !functions.ccxtruthy((ccxt_in("market", params)))))
            return get(config, Symbol("noMarket"), nothing)
    end
    return safeValue(config, "cost", 1)

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Bitvavo, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetMarketBook(self::Bitvavo, params=Dict(), context=Dict())
    return request(self, "{market}/book", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetReportMarketBook(self::Bitvavo, params=Dict(), context=Dict())
    return request(self, "report/{market}/book", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetMarketTrades(self::Bitvavo, params=Dict(), context=Dict())
    return request(self, "{market}/trades", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetReportMarketTrades(self::Bitvavo, params=Dict(), context=Dict())
    return request(self, "report/{market}/trades", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTickerPrice(self::Bitvavo, params=Dict(), context=Dict())
    return request(self, "ticker/price", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTickerBook(self::Bitvavo, params=Dict(), context=Dict())
    return request(self, "ticker/book", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetMarketCandles(self::Bitvavo, params=Dict(), context=Dict())
    return request(self, "{market}/candles", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTicker24h(self::Bitvavo, params=Dict(), context=Dict())
    return request(self, "ticker/24h", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTime(self::Bitvavo, params=Dict(), context=Dict())
    return request(self, "time", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetMarkets(self::Bitvavo, params=Dict(), context=Dict())
    return request(self, "markets", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetAssets(self::Bitvavo, params=Dict(), context=Dict())
    return request(self, "assets", "public", "GET", params, nothing, nothing, Dict())
end

function privateGetOrder(self::Bitvavo, params=Dict(), context=Dict())
    return request(self, "order", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetOrdersOpen(self::Bitvavo, params=Dict(), context=Dict())
    return request(self, "ordersOpen", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTrades(self::Bitvavo, params=Dict(), context=Dict())
    return request(self, "trades", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetOrders(self::Bitvavo, params=Dict(), context=Dict())
    return request(self, "orders", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetDeposit(self::Bitvavo, params=Dict(), context=Dict())
    return request(self, "deposit", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetDepositHistory(self::Bitvavo, params=Dict(), context=Dict())
    return request(self, "depositHistory", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetWithdrawalHistory(self::Bitvavo, params=Dict(), context=Dict())
    return request(self, "withdrawalHistory", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccount(self::Bitvavo, params=Dict(), context=Dict())
    return request(self, "account", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetBalance(self::Bitvavo, params=Dict(), context=Dict())
    return request(self, "balance", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetStakingBalance(self::Bitvavo, params=Dict(), context=Dict())
    return request(self, "stakingBalance", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountFees(self::Bitvavo, params=Dict(), context=Dict())
    return request(self, "account/fees", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountHistory(self::Bitvavo, params=Dict(), context=Dict())
    return request(self, "account/history", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetSubaccounts(self::Bitvavo, params=Dict(), context=Dict())
    return request(self, "subaccounts", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetSubaccountsTransfers(self::Bitvavo, params=Dict(), context=Dict())
    return request(self, "subaccounts/transfers", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetSubaccountsTransfersTransferId(self::Bitvavo, params=Dict(), context=Dict())
    return request(self, "subaccounts/transfers/{transferId}", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetInstitutionalSubaccountsBalance(self::Bitvavo, params=Dict(), context=Dict())
    return request(self, "institutional/subaccounts/balance", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetInstitutionalSubaccountsHistory(self::Bitvavo, params=Dict(), context=Dict())
    return request(self, "institutional/subaccounts/history", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetInstitutionalSubaccountsOrdersOpen(self::Bitvavo, params=Dict(), context=Dict())
    return request(self, "institutional/subaccounts/orders/open", "private", "GET", params, nothing, nothing, Dict())
end

function privatePostOrder(self::Bitvavo, params=Dict(), context=Dict())
    return request(self, "order", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostCancelOrdersAfter(self::Bitvavo, params=Dict(), context=Dict())
    return request(self, "cancelOrdersAfter", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostWithdrawal(self::Bitvavo, params=Dict(), context=Dict())
    return request(self, "withdrawal", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostCryptoWithdrawal(self::Bitvavo, params=Dict(), context=Dict())
    return request(self, "crypto/withdrawal", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostSubaccounts(self::Bitvavo, params=Dict(), context=Dict())
    return request(self, "subaccounts", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostSubaccountsTransfers(self::Bitvavo, params=Dict(), context=Dict())
    return request(self, "subaccounts/transfers", "private", "POST", params, nothing, nothing, Dict())
end

function privatePutOrder(self::Bitvavo, params=Dict(), context=Dict())
    return request(self, "order", "private", "PUT", params, nothing, nothing, Dict())
end

function privateDeleteOrder(self::Bitvavo, params=Dict(), context=Dict())
    return request(self, "order", "private", "DELETE", params, nothing, nothing, Dict())
end

function privateDeleteOrders(self::Bitvavo, params=Dict(), context=Dict())
    return request(self, "orders", "private", "DELETE", params, nothing, nothing, Dict())
end

function privateDeleteAtomicOrders(self::Bitvavo, params=Dict(), context=Dict())
    return request(self, "atomic/orders", "private", "DELETE", params, nothing, nothing, Dict())
end

function privateDeleteInstitutionalSubaccountsOrder(self::Bitvavo, params=Dict(), context=Dict())
    return request(self, "institutional/subaccounts/order", "private", "DELETE", params, nothing, nothing, Dict())
end

function privateDeleteInstitutionalSubaccountsOrders(self::Bitvavo, params=Dict(), context=Dict())
    return request(self, "institutional/subaccounts/orders", "private", "DELETE", params, nothing, nothing, Dict())
end

function Bitvavo(; kwargs...)
    inst = Bitvavo(Exchange(), describe, fetchTime, fetchMarkets, parseMarkets, fetchCurrencies, parseCurrency, fetchTicker, parseTicker, fetchTickers, fetchTrades, parseTrade, fetchTradingFees, parseTradingFees, fetchTradingFee, parseTradingFee, fetchOrderBook, parseOHLCV, fetchOHLCVRequest, fetchOHLCV, parseBalance, fetchBalance, fetchAccounts, parseAccount, transfer, fetchTransfers, fetchTransfer, parseTransferStatus, parseTransfer, fetchDepositAddress, createOrderRequest, createOrder, editOrderRequest, editOrder, cancelOrderRequest, cancelOrder, cancelAllOrders, cancelAllOrdersAfter, fetchOrder, fetchOrdersRequest, fetchOrders, fetchOpenOrders, parseOrderStatus, parseOrder, fetchMyTradesRequest, fetchMyTrades, fetchLedger, parseLedgerEntryType, parseLedgerEntry, withdrawRequest, withdraw, fetchWithdrawalsRequest, fetchWithdrawals, fetchDepositsRequest, fetchDeposits, parseTransactionStatus, parseTransaction, parseDepositWithdrawFee, fetchDepositWithdrawFees, sign, handleErrors, calculateRateLimiterCost, publicGetMarketBook, publicGetReportMarketBook, publicGetMarketTrades, publicGetReportMarketTrades, publicGetTickerPrice, publicGetTickerBook, publicGetMarketCandles, publicGetTicker24h, publicGetTime, publicGetMarkets, publicGetAssets, privateGetOrder, privateGetOrdersOpen, privateGetTrades, privateGetOrders, privateGetDeposit, privateGetDepositHistory, privateGetWithdrawalHistory, privateGetAccount, privateGetBalance, privateGetStakingBalance, privateGetAccountFees, privateGetAccountHistory, privateGetSubaccounts, privateGetSubaccountsTransfers, privateGetSubaccountsTransfersTransferId, privateGetInstitutionalSubaccountsBalance, privateGetInstitutionalSubaccountsHistory, privateGetInstitutionalSubaccountsOrdersOpen, privatePostOrder, privatePostCancelOrdersAfter, privatePostWithdrawal, privatePostCryptoWithdrawal, privatePostSubaccounts, privatePostSubaccountsTransfers, privatePutOrder, privateDeleteOrder, privateDeleteOrders, privateDeleteAtomicOrders, privateDeleteInstitutionalSubaccountsOrder, privateDeleteInstitutionalSubaccountsOrders)
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
