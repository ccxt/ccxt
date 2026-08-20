@kwdef mutable struct Coinbaseexchange <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    fetchMarkets::Function = fetchMarkets
    fetchAccounts::Function = fetchAccounts
    parseAccount::Function = parseAccount
    parseBalance::Function = parseBalance
    fetchBalance::Function = fetchBalance
    fetchOrderBook::Function = fetchOrderBook
    parseTicker::Function = parseTicker
    fetchTickers::Function = fetchTickers
    fetchTicker::Function = fetchTicker
    parseTrade::Function = parseTrade
    fetchMyTrades::Function = fetchMyTrades
    fetchTrades::Function = fetchTrades
    fetchTradingFees::Function = fetchTradingFees
    parseOHLCV::Function = parseOHLCV
    fetchOHLCV::Function = fetchOHLCV
    fetchTime::Function = fetchTime
    parseOrderStatus::Function = parseOrderStatus
    parseOrder::Function = parseOrder
    fetchOrder::Function = fetchOrder
    fetchOrderTrades::Function = fetchOrderTrades
    fetchOrders::Function = fetchOrders
    fetchOpenOrders::Function = fetchOpenOrders
    fetchClosedOrders::Function = fetchClosedOrders
    createOrder::Function = createOrder
    cancelOrder::Function = cancelOrder
    cancelAllOrders::Function = cancelAllOrders
    fetchPaymentMethods::Function = fetchPaymentMethods
    withdraw::Function = withdraw
    parseLedgerEntryType::Function = parseLedgerEntryType
    parseLedgerEntry::Function = parseLedgerEntry
    fetchLedger::Function = fetchLedger
    fetchDepositsWithdrawals::Function = fetchDepositsWithdrawals
    fetchDeposits::Function = fetchDeposits
    fetchWithdrawals::Function = fetchWithdrawals
    parseTransactionStatus::Function = parseTransactionStatus
    parseTransaction::Function = parseTransaction
    createDepositAddress::Function = createDepositAddress
    sign::Function = sign
    handleErrors::Function = handleErrors
    request::Function = request

# Generated REST endpoint fields
    publicGetCurrencies::Function = publicGetCurrencies
    publicGetProducts::Function = publicGetProducts
    publicGetProductsId::Function = publicGetProductsId
    publicGetProductsIdBook::Function = publicGetProductsIdBook
    publicGetProductsIdCandles::Function = publicGetProductsIdCandles
    publicGetProductsIdStats::Function = publicGetProductsIdStats
    publicGetProductsIdTicker::Function = publicGetProductsIdTicker
    publicGetProductsIdTrades::Function = publicGetProductsIdTrades
    publicGetTime::Function = publicGetTime
    publicGetProductsSparkLines::Function = publicGetProductsSparkLines
    publicGetProductsVolumeSummary::Function = publicGetProductsVolumeSummary
    privateGetAddressBook::Function = privateGetAddressBook
    privateGetAccounts::Function = privateGetAccounts
    privateGetAccountsId::Function = privateGetAccountsId
    privateGetAccountsIdHolds::Function = privateGetAccountsIdHolds
    privateGetAccountsIdLedger::Function = privateGetAccountsIdLedger
    privateGetAccountsIdTransfers::Function = privateGetAccountsIdTransfers
    privateGetCoinbaseAccounts::Function = privateGetCoinbaseAccounts
    privateGetFills::Function = privateGetFills
    privateGetFunding::Function = privateGetFunding
    privateGetFees::Function = privateGetFees
    privateGetMarginProfileInformation::Function = privateGetMarginProfileInformation
    privateGetMarginBuyingPower::Function = privateGetMarginBuyingPower
    privateGetMarginWithdrawalPower::Function = privateGetMarginWithdrawalPower
    privateGetMarginWithdrawalPowerAll::Function = privateGetMarginWithdrawalPowerAll
    privateGetMarginExitPlan::Function = privateGetMarginExitPlan
    privateGetMarginLiquidationHistory::Function = privateGetMarginLiquidationHistory
    privateGetMarginPositionRefreshAmounts::Function = privateGetMarginPositionRefreshAmounts
    privateGetMarginStatus::Function = privateGetMarginStatus
    privateGetOracle::Function = privateGetOracle
    privateGetOrders::Function = privateGetOrders
    privateGetOrdersId::Function = privateGetOrdersId
    privateGetOrdersClientClientOid::Function = privateGetOrdersClientClientOid
    privateGetOtcOrders::Function = privateGetOtcOrders
    privateGetPaymentMethods::Function = privateGetPaymentMethods
    privateGetPosition::Function = privateGetPosition
    privateGetProfiles::Function = privateGetProfiles
    privateGetProfilesId::Function = privateGetProfilesId
    privateGetReportsReportId::Function = privateGetReportsReportId
    privateGetTransfers::Function = privateGetTransfers
    privateGetTransfersTransferId::Function = privateGetTransfersTransferId
    privateGetUsersSelfExchangeLimits::Function = privateGetUsersSelfExchangeLimits
    privateGetUsersSelfHoldBalances::Function = privateGetUsersSelfHoldBalances
    privateGetUsersSelfTrailingVolume::Function = privateGetUsersSelfTrailingVolume
    privateGetWithdrawalsFeeEstimate::Function = privateGetWithdrawalsFeeEstimate
    privateGetConversionsConversionId::Function = privateGetConversionsConversionId
    privateGetConversions::Function = privateGetConversions
    privateGetConversionsFees::Function = privateGetConversionsFees
    privateGetLoansLendingOverview::Function = privateGetLoansLendingOverview
    privateGetLoansLendingOverviewXm::Function = privateGetLoansLendingOverviewXm
    privateGetLoansLoanPreview::Function = privateGetLoansLoanPreview
    privateGetLoansLoanPreviewXm::Function = privateGetLoansLoanPreviewXm
    privateGetLoansRepaymentPreview::Function = privateGetLoansRepaymentPreview
    privateGetLoansRepaymentPreviewXm::Function = privateGetLoansRepaymentPreviewXm
    privateGetLoansInterestLoanId::Function = privateGetLoansInterestLoanId
    privateGetLoansInterestHistoryLoanId::Function = privateGetLoansInterestHistoryLoanId
    privateGetLoansInterest::Function = privateGetLoansInterest
    privateGetLoansAssets::Function = privateGetLoansAssets
    privateGetLoans::Function = privateGetLoans
    privatePostConversions::Function = privatePostConversions
    privatePostDepositsCoinbaseAccount::Function = privatePostDepositsCoinbaseAccount
    privatePostDepositsPaymentMethod::Function = privatePostDepositsPaymentMethod
    privatePostCoinbaseAccountsIdAddresses::Function = privatePostCoinbaseAccountsIdAddresses
    privatePostFundingRepay::Function = privatePostFundingRepay
    privatePostOrders::Function = privatePostOrders
    privatePostPositionClose::Function = privatePostPositionClose
    privatePostProfiles::Function = privatePostProfiles
    privatePostProfilesMarginTransfer::Function = privatePostProfilesMarginTransfer
    privatePostProfilesTransfer::Function = privatePostProfilesTransfer
    privatePostReports::Function = privatePostReports
    privatePostWithdrawalsCoinbase::Function = privatePostWithdrawalsCoinbase
    privatePostWithdrawalsCoinbaseAccount::Function = privatePostWithdrawalsCoinbaseAccount
    privatePostWithdrawalsCrypto::Function = privatePostWithdrawalsCrypto
    privatePostWithdrawalsPaymentMethod::Function = privatePostWithdrawalsPaymentMethod
    privatePostLoansOpen::Function = privatePostLoansOpen
    privatePostLoansRepayInterest::Function = privatePostLoansRepayInterest
    privatePostLoansRepayPrincipal::Function = privatePostLoansRepayPrincipal
    privateDeleteOrders::Function = privateDeleteOrders
    privateDeleteOrdersClientClientOid::Function = privateDeleteOrdersClientClientOid
    privateDeleteOrdersId::Function = privateDeleteOrdersId
    privatePutProfilesIdDeactivate::Function = privatePutProfilesIdDeactivate
    privatePutProfilesId::Function = privatePutProfilesId

end
function describe(self::Coinbaseexchange, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "coinbaseexchange",
    Symbol("name") => "Coinbase Exchange",
    Symbol("countries") => ["US"],
    Symbol("rateLimit") => 100,
    Symbol("userAgent") => get(self.userAgents, Symbol("chrome"), nothing),
    Symbol("pro") => true,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => true,
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
        Symbol("cancelOrder") => true,
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => false,
        Symbol("createDepositAddress") => true,
        Symbol("createOrder") => true,
        Symbol("createOrderWithTakeProfitAndStopLoss") => false,
        Symbol("createOrderWithTakeProfitAndStopLossWs") => false,
        Symbol("createPostOnlyOrder") => false,
        Symbol("createReduceOnlyOrder") => false,
        Symbol("createStopLimitOrder") => true,
        Symbol("createStopMarketOrder") => true,
        Symbol("createStopOrder") => true,
        Symbol("fetchAccounts") => true,
        Symbol("fetchBalance") => true,
        Symbol("fetchBorrowInterest") => false,
        Symbol("fetchBorrowRate") => false,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchBorrowRates") => false,
        Symbol("fetchBorrowRatesPerSymbol") => false,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDepositAddress") => false,
        Symbol("fetchDeposits") => true,
        Symbol("fetchDepositsWithdrawals") => true,
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
        Symbol("fetchOrderTrades") => true,
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
        Symbol("fetchTradingFee") => false,
        Symbol("fetchTradingFees") => true,
        Symbol("fetchTransactions") => "emulated",
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
        Symbol("withdraw") => true
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => 60,
        Symbol("5m") => 300,
        Symbol("15m") => 900,
        Symbol("1h") => 3600,
        Symbol("6h") => 21600,
        Symbol("1d") => 86400
    ),
    Symbol("hostname") => "exchange.coinbase.com",
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("test") => Dict{Symbol, Any}(
            Symbol("public") => "https://api-public.sandbox.exchange.coinbase.com",
            Symbol("private") => "https://api-public.sandbox.exchange.coinbase.com"
        ),
        Symbol("logo") => "https://github.com/user-attachments/assets/a99ef849-a4b2-4dd4-87fe-458ef17db7fd",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => "https://api.{hostname}",
            Symbol("private") => "https://api.{hostname}"
        ),
        Symbol("www") => "https://coinbase.com/",
        Symbol("doc") => "https://docs.cloud.coinbase.com/exchange/docs/",
        Symbol("fees") => ["https://docs.pro.coinbase.com/#fees", "https://support.pro.coinbase.com/customer/en/portal/articles/2945310-fees"]
    ),
    Symbol("requiredCredentials") => Dict{Symbol, Any}(
        Symbol("apiKey") => true,
        Symbol("secret") => true,
        Symbol("password") => true
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("currencies") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("products") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("products/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("products/{id}/book") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("products/{id}/candles") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("products/{id}/stats") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("products/{id}/ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("products/{id}/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("time") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("products/spark-lines") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("products/volume-summary") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("address-book") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("accounts") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("accounts/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("accounts/{id}/holds") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("accounts/{id}/ledger") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("accounts/{id}/transfers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("coinbase-accounts") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("fills") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("funding") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("fees") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/profile_information") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/buying_power") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/withdrawal_power") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/withdrawal_power_all") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/exit_plan") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/liquidation_history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/position_refresh_amounts") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/status") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("oracle") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/client:{client_oid}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("otc/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("payment-methods") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("position") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("profiles") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("profiles/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("reports/{report_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("transfers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("transfers/{transfer_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("users/self/exchange-limits") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("users/self/hold-balances") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("users/self/trailing-volume") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("withdrawals/fee-estimate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("conversions/{conversion_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("conversions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("conversions/fees") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("loans/lending-overview") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("loans/lending-overview-xm") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("loans/loan-preview") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("loans/loan-preview-xm") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("loans/repayment-preview") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("loans/repayment-preview-xm") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("loans/interest/{loan_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("loans/interest/history/{loan_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("loans/interest") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("loans/assets") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("loans") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("conversions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("deposits/coinbase-account") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("deposits/payment-method") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("coinbase-accounts/{id}/addresses") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("funding/repay") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("position/close") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("profiles") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("profiles/margin-transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("profiles/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("reports") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("withdrawals/coinbase") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("withdrawals/coinbase-account") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("withdrawals/crypto") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("withdrawals/payment-method") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("loans/open") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("loans/repay-interest") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("loans/repay-principal") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/client:{client_oid}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("put") => Dict{Symbol, Any}(
                Symbol("profiles/{id}/deactivate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("profiles/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        )
    ),
    Symbol("commonCurrencies") => Dict{Symbol, Any}(
        Symbol("CGLD") => "CELO"
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("tierBased") => true,
            Symbol("percentage") => true,
            Symbol("maker") => self.parseNumber("0.004"),
            Symbol("taker") => self.parseNumber("0.006")
        ),
        Symbol("funding") => Dict{Symbol, Any}(
            Symbol("tierBased") => false,
            Symbol("percentage") => false,
            Symbol("withdraw") => Dict{Symbol, Any}(
                Symbol("BCH") => 0,
                Symbol("BTC") => 0,
                Symbol("LTC") => 0,
                Symbol("ETH") => 0,
                Symbol("EUR") => 0.15,
                Symbol("USD") => 25
            ),
            Symbol("deposit") => Dict{Symbol, Any}(
                Symbol("BCH") => 0,
                Symbol("BTC") => 0,
                Symbol("LTC") => 0,
                Symbol("ETH") => 0,
                Symbol("EUR") => 0.15,
                Symbol("USD") => 10
            )
        )
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("default") => Dict{Symbol, Any}(
            Symbol("sandbox") => true,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
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
                    Symbol("GTD") => true
                ),
                Symbol("hedged") => false,
                Symbol("trailing") => false,
                Symbol("leverage") => false,
                Symbol("marketBuyByCost") => false,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("selfTradePrevention") => false,
                Symbol("iceberg") => true
            ),
            Symbol("createOrders") => nothing,
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => 100000,
                Symbol("untilDays") => 100000,
                Symbol("symbolRequired") => true
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
                Symbol("daysBack") => 100000,
                Symbol("untilDays") => 100000,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => 100000,
                Symbol("daysBackCanceled") => 1,
                Symbol("untilDays") => 100000,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 300
            )
        ),
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("extends") => "default"
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
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("BTC") => "bitcoin",
            Symbol("ETH") => "ethereum",
            Symbol("SOL") => "solana",
            Symbol("ARBITRUM") => "arbitrum",
            Symbol("AVAXC") => "avacchain",
            Symbol("MATIC") => "polygon",
            Symbol("BASE") => "base",
            Symbol("SUI") => "sui",
            Symbol("OP") => "optimism",
            Symbol("NEAR") => "near",
            Symbol("APT") => "aptos",
            Symbol("KAVA") => "kava",
            Symbol("BLAST") => "blast",
            Symbol("XLM") => "stellar",
            Symbol("SEI") => "sei",
            Symbol("ADA") => "cardano",
            Symbol("CORE") => "coredao",
            Symbol("ALGO") => "algorand",
            Symbol("OSMO") => "osmosis",
            Symbol("CELO") => "celo",
            Symbol("HBAR") => "hedera",
            Symbol("ZKSYNC") => "zksync",
            Symbol("STX") => "stacks",
            Symbol("XTZ") => "tezos",
            Symbol("EGLD") => "elrond",
            Symbol("LTC") => "litecoin",
            Symbol("ATOM") => "cosmos",
            Symbol("FIL") => "filecoin",
            Symbol("DOT") => "polkadot",
            Symbol("DOGE") => "dogecoin",
            Symbol("XRP") => "ripple",
            Symbol("DASH") => "dash"
        )
    ),
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("Insufficient funds") => InsufficientFunds,
            Symbol("NotFound") => OrderNotFound,
            Symbol("Invalid API Key") => AuthenticationError,
            Symbol("invalid signature") => AuthenticationError,
            Symbol("Invalid Passphrase") => AuthenticationError,
            Symbol("Invalid order id") => InvalidOrder,
            Symbol("Private rate limit exceeded") => RateLimitExceeded,
            Symbol("Trading pair not available") => PermissionDenied,
            Symbol("Product not found") => InvalidOrder
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("Order already done") => OrderNotFound,
            Symbol("order not found") => OrderNotFound,
            Symbol("price too small") => InvalidOrder,
            Symbol("price too precise") => InvalidOrder,
            Symbol("under maintenance") => OnMaintenance,
            Symbol("size is too small") => InvalidOrder,
            Symbol("Cancel only mode") => OnMaintenance
        )
    )
))

end
"""
fetches all available currencies on an exchange
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_getcurrencies

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
function fetchCurrencies(self::Coinbaseexchange; params=Dict())
    response = Base.fetch(self.publicGetCurrencies(params));
    return self.parseCurrencies(response)

end
function parseCurrency(self::Coinbaseexchange, rawCurrency)
    id = safeString(rawCurrency, "id");
    name = safeString(rawCurrency, "name");
    code = self.safeCurrencyCode(id);
    details = self.safeDict(rawCurrency, "details", defaultValue = Dict{Symbol, Any}());
    networks = Dict{Symbol, Any}();
    supportedNetworks = self.safeList(rawCurrency, "supported_networks", defaultValue = []);
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(supportedNetworks)))
        network = get(supportedNetworks, j + 1, nothing);
        networkId = safeString(network, "id");
        networkCode = self.networkIdToCode(networkId = networkId, currencyCode = code);
        if functions.ccxtruthy(networkCode != nothing)
            networks[Symbol(networkCode)] = Dict{Symbol, Any}(
                Symbol("id") => networkId,
                Symbol("name") => safeString(network, "name"),
                Symbol("network") => networkCode,
                Symbol("active") => safeString(network, "status") == "online",
                Symbol("withdraw") => nothing,
                Symbol("deposit") => nothing,
                Symbol("fee") => nothing,
                Symbol("precision") => nothing,
                Symbol("limits") => Dict{Symbol, Any}(
                    Symbol("withdraw") => Dict{Symbol, Any}(
                        Symbol("min") => self.safeNumber(network, "min_withdrawal_amount"),
                        Symbol("max") => self.safeNumber(network, "max_withdrawal_amount")
                    )
                ),
                Symbol("contract") => safeString(network, "contract_address"),
                Symbol("info") => network
            );
        end
        j += 1
    end
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("code") => code,
    Symbol("info") => rawCurrency,
    Symbol("type") => safeString(details, "type"),
    Symbol("name") => name,
    Symbol("active") => safeString(rawCurrency, "status") == "online",
    Symbol("deposit") => nothing,
    Symbol("withdraw") => nothing,
    Symbol("fee") => nothing,
    Symbol("precision") => self.safeNumber(rawCurrency, "max_precision"),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(details, "min_size"),
            Symbol("max") => nothing
        ),
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(details, "min_withdrawal_amount"),
            Symbol("max") => self.safeNumber(details, "max_withdrawal_amount")
        )
    ),
    Symbol("networks") => networks
))

end
"""
retrieves data on all markets for coinbaseexchange
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_getproducts

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Coinbaseexchange; params=Dict())
    response = Base.fetch(self.publicGetProducts(params));
    result = [];
    rawMarkets = toArray(response);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(rawMarkets)))
        market = get(rawMarkets, i + 1, nothing);
        id = safeString(market, "id");
        (baseId, quoteId) = split(id, "-");
        base = self.safeCurrencyCode(baseId);
        quote_var = self.safeCurrencyCode(quoteId);
        status = safeString(market, "status");
        push!(result, extend(get(self.fees, Symbol("trading"), nothing), Dict{Symbol, Any}(
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
    Symbol("margin") => safeValue(market, "margin_enabled"),
    Symbol("swap") => false,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => (status == "online"),
    Symbol("contract") => false,
    Symbol("linear") => nothing,
    Symbol("inverse") => nothing,
    Symbol("contractSize") => nothing,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.safeNumber(market, "base_increment"),
        Symbol("price") => self.safeNumber(market, "quote_increment")
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
            Symbol("min") => self.safeNumber(market, "min_market_funds"),
            Symbol("max") => nothing
        )
    ),
    Symbol("created") => nothing,
    Symbol("info") => market
)));
        i += 1
    end
    return result

end
"""
fetch all the accounts associated with a profile
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_getaccounts

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [account structures]{@link https://docs.ccxt.com/?id=account-structure} indexed by the account type
"""
function fetchAccounts(self::Coinbaseexchange; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetAccounts(params));
    accounts = toArray(response);
    return self.parseAccounts(accounts, params = params)

end
function parseAccount(self::Coinbaseexchange, account)
    currencyId = safeString(account, "currency");
    return Dict{Symbol, Any}(
    Symbol("id") => safeString(account, "id"),
    Symbol("type") => nothing,
    Symbol("code") => self.safeCurrencyCode(currencyId),
    Symbol("info") => account
)

end
function parseBalance(self::Coinbaseexchange, response)
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        balance = get(response, i + 1, nothing);
        currencyId = safeString(balance, "currency");
        code = self.safeCurrencyCode(currencyId);
        account = self.account();
        account[Symbol("free")] = safeString(balance, "available");
        account[Symbol("used")] = safeString(balance, "hold");
        account[Symbol("total")] = safeString(balance, "balance");
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_getaccounts

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Coinbaseexchange; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetAccounts(params));
    return self.parseBalance(response)

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_getproductbook

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Coinbaseexchange, symbol; limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("id") => self.marketId(symbol),
        Symbol("level") => 2
    );
    response = Base.fetch(self.publicGetProductsIdBook(extend(request, params)));
    orderbook = self.parseOrderBook(response, symbol);
    orderbook[Symbol("nonce")] = safeInteger(response, "sequence");
    return orderbook

end
function parseTicker(self::Coinbaseexchange, ticker; market=nothing)
    timestamp = nothing;
    bid = nothing;
    ask = nothing;
    last_var = nothing;
    high = nothing;
    low = nothing;
    open = nothing;
    volume = nothing;
    symbol = functions.ccxtruthy((market == nothing)) ? nothing : get(market, Symbol("symbol"), nothing);
    if functions.ccxtruthy(functions.ccxt_isArray(ticker))
        last_var = safeString(ticker, 4);
        timestamp = milliseconds();
    else
        timestamp = self.parse8601(safeValue(ticker, "time"));
        bid = safeString(ticker, "bid");
        ask = safeString(ticker, "ask");
        high = safeString(ticker, "high");
        low = safeString(ticker, "low");
        open = safeString(ticker, "open");
        last_var = safeString2(ticker, "price", "last");
        volume = safeString(ticker, "volume");
    end
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => high,
    Symbol("low") => low,
    Symbol("bid") => bid,
    Symbol("bidVolume") => nothing,
    Symbol("ask") => ask,
    Symbol("askVolume") => nothing,
    Symbol("vwap") => nothing,
    Symbol("open") => open,
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => nothing,
    Symbol("average") => nothing,
    Symbol("baseVolume") => volume,
    Symbol("quoteVolume") => nothing,
    Symbol("info") => ticker
), market = market)

end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_getproduct

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTickers(self::Coinbaseexchange; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols);
    request = Dict{Symbol, Any}();
    response = Base.fetch(self.publicGetProductsSparkLines(extend(request, params)));
    result = Dict{Symbol, Any}();
    marketIds = objectKeys(response);
    delimiter = "-";
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(marketIds)))
        marketId = get(marketIds, i + 1, nothing);
        entry = safeValue(response, marketId, []);
        first_var = safeValue(entry, 0, []);
        market = self.safeMarket(marketId = marketId, market = nothing, delimiter = delimiter);
        symbol = get(market, Symbol("symbol"), nothing);
        result[Symbol(symbol)] = self.parseTicker(first_var, market = market);
        i += 1
    end
    return self.filterByArrayTickers(result, "symbol", values = symbols)

end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_getproductticker

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTicker(self::Coinbaseexchange, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("id") => get(market, Symbol("id"), nothing)
    );
    method = safeString(self.options, "fetchTickerMethod", "publicGetProductsIdTicker");
    response = Base.fetch(getproperty(self, Symbol(method))(extend(request, params)));
    return self.parseTicker(response, market = market)

end
function parseTrade(self::Coinbaseexchange, trade; market=nothing)
    timestamp = self.parse8601(safeString2(trade, "time", "created_at"));
    marketId = safeString(trade, "product_id");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = "-");
    feeRate = nothing;
    takerOrMaker = nothing;
    cost = nothing;
    feeCurrencyId = safeStringLower(market, "quoteId");
    if functions.ccxtruthy(feeCurrencyId != nothing)
        costField = string(feeCurrencyId, "_value");
        cost = safeString(trade, costField);
        liquidity = safeString(trade, "liquidity");
        if functions.ccxtruthy(liquidity != nothing)
            takerOrMaker = functions.ccxtruthy((liquidity == "T")) ? "taker" : "maker";
            feeRate = safeString(market, takerOrMaker);
        end
    end
    feeCost = safeString2(trade, "fill_fees", "fee");
    fee = Dict{Symbol, Any}(
        Symbol("cost") => feeCost,
        Symbol("currency") => get(market, Symbol("quote"), nothing),
        Symbol("rate") => feeRate
    );
    id = safeString(trade, "trade_id");
    side = functions.ccxtruthy((get(trade, Symbol("side"), nothing) == "buy")) ? "sell" : "buy";
    orderId = safeString(trade, "order_id");
    makerOrderId = safeString(trade, "maker_order_id");
    takerOrderId = safeString(trade, "taker_order_id");
    if functions.ccxtruthy(@functions.ccxt_or((orderId != nothing), (@functions.ccxt_and((makerOrderId != nothing), (takerOrderId != nothing)))))
        side = functions.ccxtruthy((get(trade, Symbol("side"), nothing) == "buy")) ? "buy" : "sell";
    end
    price = safeString(trade, "price");
    amount = safeString(trade, "size");
    symbol = get(market, Symbol("symbol"), nothing);
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("order") => orderId,
    Symbol("info") => trade,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => symbol,
    Symbol("type") => nothing,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("amount") => amount,
    Symbol("fee") => fee,
    Symbol("cost") => cost
), market = market)

end
"""
fetch all trades made by the user
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_getfills

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch trades for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchMyTrades(self::Coinbaseexchange; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchMyTrades() requires a symbol argument")));
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchMyTrades", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchMyTrades", symbol = symbol, since = since, limit = limit, params = params, maxEntriesPerRequest = 100))
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("product_id") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_date")] = self.iso8601(since);
    end
    until = safeValue2(params, "until", "end_date");
    if functions.ccxtruthy(until != nothing)
        params = omit(params, ["until"]);
        request[Symbol("end_date")] = self.iso8601(until);
    end
    response = Base.fetch(self.privateGetFills(extend(request, params)));
    return self.parseTrades(response, market = market, since = since, limit = limit)

end
"""
get the list of most recent trades for a particular symbol
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_getproducttrades

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
function fetchTrades(self::Coinbaseexchange, symbol; since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("id") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.publicGetProductsIdTrades(extend(request, params)));
    return self.parseTrades(response, market = market, since = since, limit = limit)

end
"""
fetch the trading fees for multiple markets
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_getfees

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
"""
function fetchTradingFees(self::Coinbaseexchange; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetFees(params));
    maker = self.safeNumber(response, "maker_fee_rate");
    taker = self.safeNumber(response, "taker_fee_rate");
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(self.symbols)))
        symbol = get(self.symbols, i + 1, nothing);
        result[Symbol(symbol)] = Dict{Symbol, Any}(
            Symbol("info") => response,
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
function parseOHLCV(self::Coinbaseexchange, ohlcv; market=nothing)
    return [safeTimestamp(ohlcv, 0), self.safeNumber(ohlcv, 3), self.safeNumber(ohlcv, 2), self.safeNumber(ohlcv, 1), self.safeNumber(ohlcv, 4), self.safeNumber(ohlcv, 5)]

end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_getproductcandles

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch trades for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchOHLCV(self::Coinbaseexchange, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOHLCV", "paginate", defaultValue = false);
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchOHLCV", symbol = symbol, since = since, limit = limit, timeframe = timeframe, params = params, maxEntriesPerRequest = 300))
    end
    market = self.market(symbol);
    parsedTimeframe = safeInteger(self.timeframes, timeframe);
    request = Dict{Symbol, Any}(
        Symbol("id") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(parsedTimeframe != nothing)
        request[Symbol("granularity")] = parsedTimeframe;
    else
        request[Symbol("granularity")] = timeframe;
    end
    until = safeValue2(params, "until", "end");
    params = omit(params, ["until"]);
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start")] = self.iso8601(since);
        if functions.ccxtruthy(limit == nothing)
            limit = 300;
        else
            limit = min(300, limit);
        end
        if functions.ccxtruthy(until == nothing)
            parsedTimeframeMilliseconds = parsedTimeframe * 1000;
            if functions.ccxtruthy(self.isRoundNumber(since % parsedTimeframeMilliseconds))
                request[Symbol("end")] = self.iso8601(self.sum((limit - 1) * parsedTimeframeMilliseconds, since));
            else
                request[Symbol("end")] = self.iso8601(self.sum(limit * parsedTimeframeMilliseconds, since));
            end
        else
            request[Symbol("end")] = self.iso8601(until);
        end
    end
    response = Base.fetch(self.publicGetProductsIdCandles(extend(request, params)));
    return self.parseOHLCVs(toArray(response), market = market, timeframe = timeframe, since = since, limit = limit)

end
"""
fetches the current integer timestamp in milliseconds from the exchange server

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
function fetchTime(self::Coinbaseexchange; params=Dict())
    response = Base.fetch(self.publicGetTime(params));
    return safeTimestamp(response, "epoch")

end
function parseOrderStatus(self::Coinbaseexchange, status)
    statuses = Dict{Symbol, Any}(
        Symbol("pending") => "open",
        Symbol("active") => "open",
        Symbol("open") => "open",
        Symbol("done") => "closed",
        Symbol("canceled") => "canceled",
        Symbol("canceling") => "open"
    );
    return safeString(statuses, status, status)

end
function parseOrder(self::Coinbaseexchange, order; market=nothing)
    timestamp = self.parse8601(safeString(order, "created_at"));
    marketId = safeString(order, "product_id");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = "-");
    status = self.parseOrderStatus(safeString(order, "status"));
    doneReason = safeString(order, "done_reason");
    if functions.ccxtruthy(@functions.ccxt_and((status == "closed"), (doneReason == "canceled")))
        status = "canceled";
    end
    price = safeString(order, "price");
    filled = safeString(order, "filled_size");
    amount = safeString(order, "size", filled);
    cost = safeString(order, "executed_value");
    feeCost = self.safeNumber(order, "fill_fees");
    fee = nothing;
    if functions.ccxtruthy(feeCost != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCost,
            Symbol("currency") => get(market, Symbol("quote"), nothing),
            Symbol("rate") => nothing
        );
    end
    id = safeString(order, "id");
    type_var = safeString(order, "type");
    side = safeString(order, "side");
    timeInForce = safeString(order, "time_in_force");
    postOnly = safeValue(order, "post_only");
    triggerPrice = self.safeNumber(order, "stop_price");
    clientOrderId = safeString(order, "client_oid");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("clientOrderId") => clientOrderId,
    Symbol("info") => order,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("status") => status,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("type") => type_var,
    Symbol("timeInForce") => timeInForce,
    Symbol("postOnly") => postOnly,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("triggerPrice") => triggerPrice,
    Symbol("cost") => cost,
    Symbol("amount") => amount,
    Symbol("filled") => filled,
    Symbol("remaining") => nothing,
    Symbol("fee") => fee,
    Symbol("average") => nothing,
    Symbol("trades") => nothing
), market = market)

end
"""
fetches information on an order made by the user
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_getorder

# Arguments
- `id`::string: the order id
- `symbol`::string: not used by coinbaseexchange fetchOrder
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrder(self::Coinbaseexchange, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    clientOrderId = safeString2(params, "clientOrderId", "client_oid");
    method = nothing;
    if functions.ccxtruthy(clientOrderId == nothing)
        method = "privateGetOrdersId";
        request[Symbol("id")] = id;
    else
        method = "privateGetOrdersClientClientOid";
        request[Symbol("client_oid")] = clientOrderId;
        params = omit(params, ["clientOrderId", "client_oid"]);
    end
    response = Base.fetch(getproperty(self, Symbol(method))(extend(request, params)));
    return self.parseOrder(response)

end
"""
fetch all the trades made from a single order

# Arguments
- `id`::string: order id
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchOrderTrades(self::Coinbaseexchange, id; symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
    response = Base.fetch(self.privateGetFills(extend(request, params)));
    return self.parseTrades(response, market = market, since = since, limit = limit)

end
"""
fetches information on multiple orders made by the user
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_getorders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch open orders for

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrders(self::Coinbaseexchange; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("status") => "all"
    );
    return Base.fetch(self.fetchOpenOrders(symbol = symbol, since = since, limit = limit, params = extend(request, params)))

end
"""
fetch all unfilled currently open orders
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_getorders

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of  open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch open orders for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Coinbaseexchange; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOpenOrders", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchOpenOrders", symbol = symbol, since = since, limit = limit, params = params, maxEntriesPerRequest = 100))
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("product_id")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_date")] = self.iso8601(since);
    end
    until = safeValue2(params, "until", "end_date");
    if functions.ccxtruthy(until != nothing)
        params = omit(params, ["until"]);
        request[Symbol("end_date")] = self.iso8601(until);
    end
    response = Base.fetch(self.privateGetOrders(extend(request, params)));
    return self.parseOrders(response, market = market, since = since, limit = limit)

end
"""
fetches information on multiple closed orders made by the user
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_getorders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch open orders for

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchClosedOrders(self::Coinbaseexchange; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("status") => "done"
    );
    return Base.fetch(self.fetchOpenOrders(symbol = symbol, since = since, limit = limit, params = extend(request, params)))

end
"""
create a trade order
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_postorders

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrder(self::Coinbaseexchange, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("type") => type_var,
        Symbol("side") => side,
        Symbol("product_id") => get(market, Symbol("id"), nothing)
    );
    clientOrderId = safeString2(params, "clientOrderId", "client_oid");
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("client_oid")] = clientOrderId;
    end
    triggerPrice = self.safeNumberN(params, ["stopPrice", "stop_price", "triggerPrice"]);
    if functions.ccxtruthy(triggerPrice != nothing)
        request[Symbol("stop_price")] = self.priceToPrecision(symbol, triggerPrice);
    end
    timeInForce = safeString2(params, "timeInForce", "time_in_force");
    if functions.ccxtruthy(timeInForce != nothing)
        request[Symbol("time_in_force")] = timeInForce;
    end
    postOnly = safeValue2(params, "postOnly", "post_only", false);
    if functions.ccxtruthy(postOnly)
        request[Symbol("post_only")] = true;
    end
    params = omit(params, ["timeInForce", "time_in_force", "stopPrice", "stop_price", "clientOrderId", "client_oid", "postOnly", "post_only", "triggerPrice"]);
    if functions.ccxtruthy(type_var == "limit")
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
        request[Symbol("size")] = self.amountToPrecision(symbol, amount);
    elseif functions.ccxtruthy(type_var == "market")
        cost = self.safeNumber2(params, "cost", "funds");
        if functions.ccxtruthy(cost == nothing)
            if functions.ccxtruthy(price != nothing)
                cost = amount * price;
            end
        else
            params = omit(params, ["cost", "funds"]);
        end
        if functions.ccxtruthy(cost != nothing)
            request[Symbol("funds")] = self.costToPrecision(symbol, cost);
        else
            request[Symbol("size")] = self.amountToPrecision(symbol, amount);
        end
    end
    response = Base.fetch(self.privatePostOrders(extend(request, params)));
    return self.parseOrder(response, market = market)

end
"""
cancels an open order
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_deleteorder

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::Coinbaseexchange, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    clientOrderId = safeString2(params, "clientOrderId", "client_oid");
    method = nothing;
    if functions.ccxtruthy(clientOrderId == nothing)
        method = "privateDeleteOrdersId";
        request[Symbol("id")] = id;
    else
        method = "privateDeleteOrdersClientClientOid";
        request[Symbol("client_oid")] = clientOrderId;
        params = omit(params, ["clientOrderId", "client_oid"]);
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("product_id")] = get(market, Symbol("symbol"), nothing);
    end
    response = Base.fetch(getproperty(self, Symbol(method))(extend(request, params)));
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response
))

end
"""
cancel all open orders
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_deleteorders

# Arguments
- `symbol`::string, optional: unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelAllOrders(self::Coinbaseexchange; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("product_id")] = get(market, Symbol("symbol"), nothing);
    end
    response = Base.fetch(self.privateDeleteOrders(extend(request, params)));
    return [self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response
))]

end
function fetchPaymentMethods(self::Coinbaseexchange; params=Dict())
    return Base.fetch(self.privateGetPaymentMethods(params))

end
"""
make a withdrawal
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_postwithdrawpaymentmethod
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_postwithdrawcoinbaseaccount

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function withdraw(self::Coinbaseexchange, code, amount, address; tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    self.checkAddress(address = address);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => amount
    );
    method = "privatePostWithdrawals";
    if functions.ccxtruthy(ccxt_in("payment_method_id", params))
        method += "PaymentMethod";
    elseif functions.ccxtruthy(ccxt_in("coinbase_account_id", params))
        method += "CoinbaseAccount";
    else
        method += "Crypto";
        request[Symbol("crypto_address")] = address;
        if functions.ccxtruthy(tag != nothing)
            request[Symbol("destination_tag")] = tag;
        end
    end
    response = Base.fetch(getproperty(self, Symbol(method))(extend(request, params)));
    if functions.ccxtruthy(!functions.ccxtruthy(response))
        throw(ExchangeError(string(self.id, " withdraw() error: ", json(response))));
    end
    return self.parseTransaction(response, currency = currency)

end
function parseLedgerEntryType(self::Coinbaseexchange, type_var)
    types = Dict{Symbol, Any}(
        Symbol("transfer") => "transfer",
        Symbol("match") => "trade",
        Symbol("fee") => "fee",
        Symbol("rebate") => "rebate",
        Symbol("conversion") => "trade"
    );
    return safeString(types, type_var, type_var)

end
function parseLedgerEntry(self::Coinbaseexchange, item; currency=nothing)
    id = safeString(item, "id");
    amountString = safeString(item, "amount");
    direction = nothing;
    afterString = safeString(item, "balance");
    beforeString = stringSub(afterString, amountString);
    if functions.ccxtruthy(stringLt(amountString, "0"))
        direction = "out";
        amountString = stringAbs(amountString);
    else
        direction = "in";
    end
    amount = self.parseNumber(amountString);
    after = self.parseNumber(afterString);
    before = self.parseNumber(beforeString);
    timestamp = self.parse8601(safeValue(item, "created_at"));
    type_var = self.parseLedgerEntryType(safeString(item, "type"));
    code = self.safeCurrencyCode(nothing, currency = currency);
    details = safeValue(item, "details", Dict{Symbol, Any}());
    account = nothing;
    referenceAccount = nothing;
    referenceId = nothing;
    if functions.ccxtruthy(type_var == "transfer")
        account = safeString(details, "from");
        referenceAccount = safeString(details, "to");
        referenceId = safeString(details, "profile_transfer_id");
    else
        referenceId = safeString(details, "order_id");
    end
    status = "ok";
    return self.safeLedgerEntry(Dict{Symbol, Any}(
    Symbol("info") => item,
    Symbol("id") => id,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("direction") => direction,
    Symbol("account") => account,
    Symbol("referenceAccount") => referenceAccount,
    Symbol("referenceId") => referenceId,
    Symbol("type") => type_var,
    Symbol("currency") => code,
    Symbol("amount") => amount,
    Symbol("before") => before,
    Symbol("after") => after,
    Symbol("status") => status,
    Symbol("fee") => nothing
), currency = currency)

end
"""
fetch the history of changes, actions done by the user or operations that altered the balance of the user
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_getaccountledger

# Arguments
- `code`::string: unified currency code, default is undefined
- `since`::int, optional: timestamp in ms of the earliest ledger entry, default is undefined
- `limit`::int, optional: max number of ledger entries to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch trades for

# Returns
- a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
"""
function fetchLedger(self::Coinbaseexchange; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(code == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchLedger() requires a code param")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.loadAccounts());
    currency = self.currency(code);
    accountsByCurrencyCode = indexBy(self.accounts, "code");
    account = safeValue(accountsByCurrencyCode, code);
    if functions.ccxtruthy(account == nothing)
        throw(ExchangeError(string(self.id, " fetchLedger() could not find account id for ", code)));
    end
    request = Dict{Symbol, Any}(
        Symbol("id") => get(account, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_date")] = self.iso8601(since);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    until = safeValue2(params, "until", "end_date");
    if functions.ccxtruthy(until != nothing)
        params = omit(params, ["until"]);
        request[Symbol("end_date")] = self.iso8601(until);
    end
    response = Base.fetch(self.privateGetAccountsIdLedger(extend(request, params)));
    entries = toArray(response);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(entries)))
        entries[i + 1][Symbol("currency")] = code;
        i += 1
    end
    return self.parseLedger(entries, currency = currency, since = since, limit = limit)

end
"""
fetch history of deposits and withdrawals
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_gettransfers
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_getaccounttransfers

# Arguments
- `code`::string, optional: unified currency code for the currency of the deposit/withdrawals, default is undefined
- `since`::int, optional: timestamp in ms of the earliest deposit/withdrawal, default is undefined
- `limit`::int, optional: max number of deposit/withdrawals to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.id`::string, optional: account id, when defined, the endpoint used is '/accounts/{account_id}/transfers/' instead of '/transfers/'

# Returns
- a list of [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDepositsWithdrawals(self::Coinbaseexchange; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.loadAccounts());
    currency = nothing;
    id = safeString(params, "id");
    if functions.ccxtruthy(id == nothing)
        if functions.ccxtruthy(code != nothing)
            currency = self.currency(code);
            accountsByCurrencyCode = indexBy(self.accounts, "code");
            account = safeValue(accountsByCurrencyCode, code);
            if functions.ccxtruthy(account == nothing)
                throw(ExchangeError(string(self.id, " fetchDepositsWithdrawals() could not find account id for ", code)));
            end
            id = get(account, Symbol("id"), nothing);
        end
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(id != nothing)
        request[Symbol("id")] = id;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(id == nothing)
        transfers = Base.fetch(self.privateGetTransfers(extend(request, params)));
        response = toArray(transfers);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
            account_id = safeString(get(response, i + 1, nothing), "account_id");
            account = safeValue(self.accountsById, account_id);
            codeInner = safeString(account, "code");
            response[i + 1][Symbol("currency")] = codeInner;
            i += 1
        end

    else
        accountTransfers = Base.fetch(self.privateGetAccountsIdTransfers(extend(request, params)));
        response = toArray(accountTransfers);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
            response[i + 1][Symbol("currency")] = code;
            i += 1
        end
    end
    return self.parseTransactions(response, currency = currency, since = since, limit = limit)

end
"""
fetch all deposits made to an account
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_gettransfers
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_getaccounttransfers

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDeposits(self::Coinbaseexchange; code=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchDepositsWithdrawals(code = code, since = since, limit = limit, params = extend(Dict{Symbol, Any}(
    Symbol("type") => "deposit"
), params)))

end
"""
fetch all withdrawals made from an account
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_gettransfers
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_getaccounttransfers

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchWithdrawals(self::Coinbaseexchange; code=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchDepositsWithdrawals(code = code, since = since, limit = limit, params = extend(Dict{Symbol, Any}(
    Symbol("type") => "withdraw"
), params)))

end
function parseTransactionStatus(self::Coinbaseexchange, transaction)
    canceled = safeValue(transaction, "canceled_at");
    if functions.ccxtruthy(canceled)
            return "canceled"
    end
    processed = safeValue(transaction, "processed_at");
    completed = safeValue(transaction, "completed_at");
    if functions.ccxtruthy(completed)
            return "ok"
    elseif functions.ccxtruthy(@functions.ccxt_and(processed, !functions.ccxtruthy(completed)))
        return "failed"
    else
        return "pending"
    end

end
function parseTransaction(self::Coinbaseexchange, transaction; currency=nothing)
    details = safeValue(transaction, "details", Dict{Symbol, Any}());
    timestamp = self.parse8601(safeString(transaction, "created_at"));
    currencyId = safeString(transaction, "currency");
    code = self.safeCurrencyCode(currencyId, currency = currency);
    amount = self.safeNumber(transaction, "amount");
    type_var = safeString(transaction, "type");
    address = safeString(details, "crypto_address");
    address = safeString(transaction, "crypto_address", address);
    fee = Dict{Symbol, Any}(
        Symbol("currency") => nothing,
        Symbol("cost") => nothing,
        Symbol("rate") => nothing
    );
    if functions.ccxtruthy(type_var == "withdraw")
        type_var = "withdrawal";
        address = safeString(details, "sent_to_address", address);
        feeCost = self.safeNumber(details, "fee");
        if functions.ccxtruthy(feeCost != nothing)
            if functions.ccxtruthy(amount != nothing)
                amount -= feeCost;
            end
            fee[Symbol("cost")] = feeCost;
            fee[Symbol("currency")] = code;
        end
    end
    networkId = safeString(details, "network");
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => safeString(transaction, "id"),
    Symbol("txid") => safeString(details, "crypto_transaction_hash"),
    Symbol("type") => type_var,
    Symbol("currency") => code,
    Symbol("network") => self.networkIdToCode(networkId = networkId, currencyCode = code),
    Symbol("amount") => amount,
    Symbol("status") => self.parseTransactionStatus(transaction),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("address") => address,
    Symbol("addressFrom") => nothing,
    Symbol("addressTo") => safeString(details, "crypto_address"),
    Symbol("tag") => safeString(details, "destination_tag"),
    Symbol("tagFrom") => nothing,
    Symbol("tagTo") => nothing,
    Symbol("updated") => self.parse8601(safeString(transaction, "processed_at")),
    Symbol("comment") => nothing,
    Symbol("internal") => false,
    Symbol("fee") => fee
)

end
"""
create a currency deposit address
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_postcoinbaseaccountaddresses

# Arguments
- `code`::string: unified currency code of the currency for the deposit address
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
function createDepositAddress(self::Coinbaseexchange, code; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    accounts = safeValue(self.options, "coinbaseAccounts");
    if functions.ccxtruthy(accounts == nothing)
        accounts = Base.fetch(self.privateGetCoinbaseAccounts());
        self.options[Symbol("coinbaseAccounts")] = accounts;
        self.options[Symbol("coinbaseAccountsByCurrencyId")] = indexBy(accounts, "currency");
    end
    currencyId = get(currency, Symbol("id"), nothing);
    account = safeValue(get(self.options, Symbol("coinbaseAccountsByCurrencyId"), nothing), currencyId);
    if functions.ccxtruthy(account == nothing)
        throw(InvalidAddress(string(self.id, " createDepositAddress() could not find currency code ", code, " with id = ", currencyId, " in this.options['coinbaseAccountsByCurrencyId']")));
    end
    request = Dict{Symbol, Any}(
        Symbol("id") => get(account, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privatePostCoinbaseAccountsIdAddresses(extend(request, params)));
    address = safeString(response, "address");
    tag = safeString(response, "destination_tag");
    return Dict{Symbol, Any}(
    Symbol("currency") => code,
    Symbol("address") => self.checkAddress(address = address),
    Symbol("network") => nothing,
    Symbol("tag") => tag,
    Symbol("info") => response
)

end
function sign(self::Coinbaseexchange, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    request = string("/", self.implodeParams(path, params));
    query = omit(params, self.extractParams(path));
    if functions.ccxtruthy(method == "GET")
        if functions.ccxtruthy(length(objectKeys(query)))
            request += string("?", self.urlencode(query));
        end
    end
    url = string(self.implodeHostname(get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing)), request);
    if functions.ccxtruthy(api == "private")
        self.checkRequiredCredentials();
        nonce = string(self.nonce());
        payload = "";
        if functions.ccxtruthy(method != "GET")
            if functions.ccxtruthy(length(objectKeys(query)))
                body = json(query);
                payload = body;
            end
        end
        what = string(nonce, method, request, payload);
        secret = nothing;
        try
            secret = self.base64ToBinary(self.secret);
        catch e
            throw(AuthenticationError(string(self.id, " sign() invalid base64 secret")));

        end
        signature = self.hmac(self.encode(what), secret, sha256, "base64");
        headers = Dict{Symbol, Any}(
            Symbol("CB-ACCESS-KEY") => self.apiKey,
            Symbol("CB-ACCESS-SIGN") => signature,
            Symbol("CB-ACCESS-TIMESTAMP") => nonce,
            Symbol("CB-ACCESS-PASSPHRASE") => self.password,
            Symbol("Content-Type") => "application/json"
        );
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Coinbaseexchange, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(@functions.ccxt_or((code == 400), (code == 404)))
        if functions.ccxtruthy(get(body, 1, nothing) == "{")
            message = safeString(response, "message");
            feedback = string(self.id, " ", message);
            self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), message, feedback);
            self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), message, feedback);
            throw(ExchangeError(feedback));
        end
        throw(ExchangeError(string(self.id, " ", body)));
    end
    return nothing

end
function request(self::Coinbaseexchange, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing, config=Dict())
    response = Base.fetch(self.fetch2(path, api = api, method = method, params = params, headers = headers, body = body, config = config));
    if functions.ccxtruthy(!isa(response, AbstractString))
        if functions.ccxtruthy(ccxt_in("message", response))
            throw(ExchangeError(string(self.id, " ", json(response))));
        end
    end
    return response

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Coinbaseexchange, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetCurrencies(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "currencies"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetProducts(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "products"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetProductsId(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "products/{id}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetProductsIdBook(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "products/{id}/book"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetProductsIdCandles(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "products/{id}/candles"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetProductsIdStats(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "products/{id}/stats"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetProductsIdTicker(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "products/{id}/ticker"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetProductsIdTrades(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "products/{id}/trades"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTime(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "time"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetProductsSparkLines(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "products/spark-lines"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetProductsVolumeSummary(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "products/volume-summary"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAddressBook(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "address-book"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccounts(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "accounts"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountsId(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "accounts/{id}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountsIdHolds(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "accounts/{id}/holds"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountsIdLedger(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "accounts/{id}/ledger"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountsIdTransfers(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "accounts/{id}/transfers"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetCoinbaseAccounts(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "coinbase-accounts"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetFills(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "fills"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetFunding(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "funding"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetFees(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "fees"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetMarginProfileInformation(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "margin/profile_information"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetMarginBuyingPower(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "margin/buying_power"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetMarginWithdrawalPower(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "margin/withdrawal_power"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetMarginWithdrawalPowerAll(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "margin/withdrawal_power_all"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetMarginExitPlan(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "margin/exit_plan"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetMarginLiquidationHistory(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "margin/liquidation_history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetMarginPositionRefreshAmounts(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "margin/position_refresh_amounts"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetMarginStatus(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "margin/status"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOracle(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "oracle"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrders(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "orders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrdersId(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "orders/{id}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrdersClientClientOid(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "orders/client:{client_oid}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOtcOrders(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "otc/orders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetPaymentMethods(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "payment-methods"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetPosition(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "position"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetProfiles(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "profiles"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetProfilesId(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "profiles/{id}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetReportsReportId(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "reports/{report_id}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetTransfers(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "transfers"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetTransfersTransferId(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "transfers/{transfer_id}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUsersSelfExchangeLimits(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "users/self/exchange-limits"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUsersSelfHoldBalances(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "users/self/hold-balances"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUsersSelfTrailingVolume(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "users/self/trailing-volume"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetWithdrawalsFeeEstimate(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "withdrawals/fee-estimate"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetConversionsConversionId(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "conversions/{conversion_id}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetConversions(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "conversions"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetConversionsFees(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "conversions/fees"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetLoansLendingOverview(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "loans/lending-overview"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetLoansLendingOverviewXm(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "loans/lending-overview-xm"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetLoansLoanPreview(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "loans/loan-preview"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetLoansLoanPreviewXm(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "loans/loan-preview-xm"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetLoansRepaymentPreview(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "loans/repayment-preview"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetLoansRepaymentPreviewXm(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "loans/repayment-preview-xm"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetLoansInterestLoanId(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "loans/interest/{loan_id}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetLoansInterestHistoryLoanId(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "loans/interest/history/{loan_id}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetLoansInterest(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "loans/interest"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetLoansAssets(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "loans/assets"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetLoans(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "loans"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostConversions(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "conversions"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDepositsCoinbaseAccount(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "deposits/coinbase-account"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDepositsPaymentMethod(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "deposits/payment-method"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCoinbaseAccountsIdAddresses(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "coinbase-accounts/{id}/addresses"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostFundingRepay(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "funding/repay"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrders(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "orders"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostPositionClose(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "position/close"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostProfiles(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "profiles"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostProfilesMarginTransfer(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "profiles/margin-transfer"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostProfilesTransfer(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "profiles/transfer"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostReports(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "reports"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostWithdrawalsCoinbase(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "withdrawals/coinbase"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostWithdrawalsCoinbaseAccount(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "withdrawals/coinbase-account"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostWithdrawalsCrypto(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "withdrawals/crypto"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostWithdrawalsPaymentMethod(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "withdrawals/payment-method"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostLoansOpen(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "loans/open"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostLoansRepayInterest(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "loans/repay-interest"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostLoansRepayPrincipal(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "loans/repay-principal"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteOrders(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "orders"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteOrdersClientClientOid(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "orders/client:{client_oid}"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteOrdersId(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "orders/{id}"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePutProfilesIdDeactivate(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "profiles/{id}/deactivate"; api="private", method="PUT", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePutProfilesId(self::Coinbaseexchange, params=Dict(), context=Dict())
    return request(self, "profiles/{id}"; api="private", method="PUT", params=params, headers=nothing, body=nothing, config=Dict())
end

function Coinbaseexchange(; kwargs...)
    inst = Coinbaseexchange(Exchange(), describe, fetchCurrencies, parseCurrency, fetchMarkets, fetchAccounts, parseAccount, parseBalance, fetchBalance, fetchOrderBook, parseTicker, fetchTickers, fetchTicker, parseTrade, fetchMyTrades, fetchTrades, fetchTradingFees, parseOHLCV, fetchOHLCV, fetchTime, parseOrderStatus, parseOrder, fetchOrder, fetchOrderTrades, fetchOrders, fetchOpenOrders, fetchClosedOrders, createOrder, cancelOrder, cancelAllOrders, fetchPaymentMethods, withdraw, parseLedgerEntryType, parseLedgerEntry, fetchLedger, fetchDepositsWithdrawals, fetchDeposits, fetchWithdrawals, parseTransactionStatus, parseTransaction, createDepositAddress, sign, handleErrors, request, publicGetCurrencies, publicGetProducts, publicGetProductsId, publicGetProductsIdBook, publicGetProductsIdCandles, publicGetProductsIdStats, publicGetProductsIdTicker, publicGetProductsIdTrades, publicGetTime, publicGetProductsSparkLines, publicGetProductsVolumeSummary, privateGetAddressBook, privateGetAccounts, privateGetAccountsId, privateGetAccountsIdHolds, privateGetAccountsIdLedger, privateGetAccountsIdTransfers, privateGetCoinbaseAccounts, privateGetFills, privateGetFunding, privateGetFees, privateGetMarginProfileInformation, privateGetMarginBuyingPower, privateGetMarginWithdrawalPower, privateGetMarginWithdrawalPowerAll, privateGetMarginExitPlan, privateGetMarginLiquidationHistory, privateGetMarginPositionRefreshAmounts, privateGetMarginStatus, privateGetOracle, privateGetOrders, privateGetOrdersId, privateGetOrdersClientClientOid, privateGetOtcOrders, privateGetPaymentMethods, privateGetPosition, privateGetProfiles, privateGetProfilesId, privateGetReportsReportId, privateGetTransfers, privateGetTransfersTransferId, privateGetUsersSelfExchangeLimits, privateGetUsersSelfHoldBalances, privateGetUsersSelfTrailingVolume, privateGetWithdrawalsFeeEstimate, privateGetConversionsConversionId, privateGetConversions, privateGetConversionsFees, privateGetLoansLendingOverview, privateGetLoansLendingOverviewXm, privateGetLoansLoanPreview, privateGetLoansLoanPreviewXm, privateGetLoansRepaymentPreview, privateGetLoansRepaymentPreviewXm, privateGetLoansInterestLoanId, privateGetLoansInterestHistoryLoanId, privateGetLoansInterest, privateGetLoansAssets, privateGetLoans, privatePostConversions, privatePostDepositsCoinbaseAccount, privatePostDepositsPaymentMethod, privatePostCoinbaseAccountsIdAddresses, privatePostFundingRepay, privatePostOrders, privatePostPositionClose, privatePostProfiles, privatePostProfilesMarginTransfer, privatePostProfilesTransfer, privatePostReports, privatePostWithdrawalsCoinbase, privatePostWithdrawalsCoinbaseAccount, privatePostWithdrawalsCrypto, privatePostWithdrawalsPaymentMethod, privatePostLoansOpen, privatePostLoansRepayInterest, privatePostLoansRepayPrincipal, privateDeleteOrders, privateDeleteOrdersClientClientOid, privateDeleteOrdersId, privatePutProfilesIdDeactivate, privatePutProfilesId)
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
function __ccxt_doc_Coinbaseexchange_fetchCurrencies() end
"""
fetches all available currencies on an exchange
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_getcurrencies

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
__ccxt_doc_Coinbaseexchange_fetchCurrencies

function __ccxt_doc_Coinbaseexchange_fetchMarkets() end
"""
retrieves data on all markets for coinbaseexchange
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_getproducts

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Coinbaseexchange_fetchMarkets

function __ccxt_doc_Coinbaseexchange_fetchAccounts() end
"""
fetch all the accounts associated with a profile
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_getaccounts

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [account structures]{@link https://docs.ccxt.com/?id=account-structure} indexed by the account type
"""
__ccxt_doc_Coinbaseexchange_fetchAccounts

function __ccxt_doc_Coinbaseexchange_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_getaccounts

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Coinbaseexchange_fetchBalance

function __ccxt_doc_Coinbaseexchange_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_getproductbook

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Coinbaseexchange_fetchOrderBook

function __ccxt_doc_Coinbaseexchange_fetchTickers() end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_getproduct

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Coinbaseexchange_fetchTickers

function __ccxt_doc_Coinbaseexchange_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_getproductticker

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Coinbaseexchange_fetchTicker

function __ccxt_doc_Coinbaseexchange_fetchMyTrades() end
"""
fetch all trades made by the user
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_getfills

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch trades for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Coinbaseexchange_fetchMyTrades

function __ccxt_doc_Coinbaseexchange_fetchTrades() end
"""
get the list of most recent trades for a particular symbol
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_getproducttrades

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
__ccxt_doc_Coinbaseexchange_fetchTrades

function __ccxt_doc_Coinbaseexchange_fetchTradingFees() end
"""
fetch the trading fees for multiple markets
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_getfees

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
"""
__ccxt_doc_Coinbaseexchange_fetchTradingFees

function __ccxt_doc_Coinbaseexchange_fetchOHLCV() end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_getproductcandles

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch trades for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Coinbaseexchange_fetchOHLCV

function __ccxt_doc_Coinbaseexchange_fetchTime() end
"""
fetches the current integer timestamp in milliseconds from the exchange server

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
__ccxt_doc_Coinbaseexchange_fetchTime

function __ccxt_doc_Coinbaseexchange_fetchOrder() end
"""
fetches information on an order made by the user
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_getorder

# Arguments
- `id`::string: the order id
- `symbol`::string: not used by coinbaseexchange fetchOrder
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Coinbaseexchange_fetchOrder

function __ccxt_doc_Coinbaseexchange_fetchOrderTrades() end
"""
fetch all the trades made from a single order

# Arguments
- `id`::string: order id
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Coinbaseexchange_fetchOrderTrades

function __ccxt_doc_Coinbaseexchange_fetchOrders() end
"""
fetches information on multiple orders made by the user
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_getorders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch open orders for

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Coinbaseexchange_fetchOrders

function __ccxt_doc_Coinbaseexchange_fetchOpenOrders() end
"""
fetch all unfilled currently open orders
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_getorders

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of  open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch open orders for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Coinbaseexchange_fetchOpenOrders

function __ccxt_doc_Coinbaseexchange_fetchClosedOrders() end
"""
fetches information on multiple closed orders made by the user
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_getorders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch open orders for

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Coinbaseexchange_fetchClosedOrders

function __ccxt_doc_Coinbaseexchange_createOrder() end
"""
create a trade order
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_postorders

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Coinbaseexchange_createOrder

function __ccxt_doc_Coinbaseexchange_cancelOrder() end
"""
cancels an open order
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_deleteorder

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Coinbaseexchange_cancelOrder

function __ccxt_doc_Coinbaseexchange_cancelAllOrders() end
"""
cancel all open orders
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_deleteorders

# Arguments
- `symbol`::string, optional: unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Coinbaseexchange_cancelAllOrders

function __ccxt_doc_Coinbaseexchange_withdraw() end
"""
make a withdrawal
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_postwithdrawpaymentmethod
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_postwithdrawcoinbaseaccount

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Coinbaseexchange_withdraw

function __ccxt_doc_Coinbaseexchange_fetchLedger() end
"""
fetch the history of changes, actions done by the user or operations that altered the balance of the user
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_getaccountledger

# Arguments
- `code`::string: unified currency code, default is undefined
- `since`::int, optional: timestamp in ms of the earliest ledger entry, default is undefined
- `limit`::int, optional: max number of ledger entries to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch trades for

# Returns
- a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
"""
__ccxt_doc_Coinbaseexchange_fetchLedger

function __ccxt_doc_Coinbaseexchange_fetchDepositsWithdrawals() end
"""
fetch history of deposits and withdrawals
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_gettransfers
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_getaccounttransfers

# Arguments
- `code`::string, optional: unified currency code for the currency of the deposit/withdrawals, default is undefined
- `since`::int, optional: timestamp in ms of the earliest deposit/withdrawal, default is undefined
- `limit`::int, optional: max number of deposit/withdrawals to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.id`::string, optional: account id, when defined, the endpoint used is '/accounts/{account_id}/transfers/' instead of '/transfers/'

# Returns
- a list of [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Coinbaseexchange_fetchDepositsWithdrawals

function __ccxt_doc_Coinbaseexchange_fetchDeposits() end
"""
fetch all deposits made to an account
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_gettransfers
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_getaccounttransfers

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Coinbaseexchange_fetchDeposits

function __ccxt_doc_Coinbaseexchange_fetchWithdrawals() end
"""
fetch all withdrawals made from an account
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_gettransfers
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_getaccounttransfers

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Coinbaseexchange_fetchWithdrawals

function __ccxt_doc_Coinbaseexchange_createDepositAddress() end
"""
create a currency deposit address
see: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_postcoinbaseaccountaddresses

# Arguments
- `code`::string: unified currency code of the currency for the deposit address
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
__ccxt_doc_Coinbaseexchange_createDepositAddress
