@kwdef mutable struct Luno <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    fetchMarkets::Function = fetchMarkets
    fetchAccounts::Function = fetchAccounts
    parseBalance::Function = parseBalance
    fetchBalance::Function = fetchBalance
    fetchOrderBook::Function = fetchOrderBook
    parseOrderStatus::Function = parseOrderStatus
    parseOrder::Function = parseOrder
    fetchOrder::Function = fetchOrder
    fetchOrdersByState::Function = fetchOrdersByState
    fetchOrders::Function = fetchOrders
    fetchOpenOrders::Function = fetchOpenOrders
    fetchClosedOrders::Function = fetchClosedOrders
    parseTicker::Function = parseTicker
    fetchTickers::Function = fetchTickers
    fetchTicker::Function = fetchTicker
    parseTrade::Function = parseTrade
    fetchTrades::Function = fetchTrades
    fetchOHLCV::Function = fetchOHLCV
    parseOHLCV::Function = parseOHLCV
    fetchMyTrades::Function = fetchMyTrades
    fetchTradingFee::Function = fetchTradingFee
    createOrder::Function = createOrder
    cancelOrder::Function = cancelOrder
    fetchLedgerByEntries::Function = fetchLedgerByEntries
    fetchLedger::Function = fetchLedger
    parseLedgerComment::Function = parseLedgerComment
    parseLedgerEntry::Function = parseLedgerEntry
    createDepositAddress::Function = createDepositAddress
    fetchDepositAddress::Function = fetchDepositAddress
    parseDepositAddress::Function = parseDepositAddress
    fetchDepositWithdrawFee::Function = fetchDepositWithdrawFee
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    exchangeGetMarkets::Function = exchangeGetMarkets
    exchangePrivateGetCandles::Function = exchangePrivateGetCandles
    exchangePrivateGetMove::Function = exchangePrivateGetMove
    exchangePrivateGetMoveListMoves::Function = exchangePrivateGetMoveListMoves
    exchangePrivateGetTransfers::Function = exchangePrivateGetTransfers
    exchangePrivatePostConvert::Function = exchangePrivatePostConvert
    exchangePrivatePostMove::Function = exchangePrivatePostMove
    publicGetOrderbook::Function = publicGetOrderbook
    publicGetOrderbookTop::Function = publicGetOrderbookTop
    publicGetTicker::Function = publicGetTicker
    publicGetTickers::Function = publicGetTickers
    publicGetTrades::Function = publicGetTrades
    privateGetAccountsIdPending::Function = privateGetAccountsIdPending
    privateGetAccountsIdTransactions::Function = privateGetAccountsIdTransactions
    privateGetBalance::Function = privateGetBalance
    privateGetBeneficiaries::Function = privateGetBeneficiaries
    privateGetSendNetworks::Function = privateGetSendNetworks
    privateGetFeeInfo::Function = privateGetFeeInfo
    privateGetFundingAddress::Function = privateGetFundingAddress
    privateGetListorders::Function = privateGetListorders
    privateGetListtrades::Function = privateGetListtrades
    privateGetSendFee::Function = privateGetSendFee
    privateGetOrdersId::Function = privateGetOrdersId
    privateGetWithdrawals::Function = privateGetWithdrawals
    privateGetWithdrawalsId::Function = privateGetWithdrawalsId
    privateGetTransfers::Function = privateGetTransfers
    privateGetUsersLinked::Function = privateGetUsersLinked
    privatePostAccounts::Function = privatePostAccounts
    privatePostAddressValidate::Function = privatePostAddressValidate
    privatePostPostorder::Function = privatePostPostorder
    privatePostMarketorder::Function = privatePostMarketorder
    privatePostStoporder::Function = privatePostStoporder
    privatePostFundingAddress::Function = privatePostFundingAddress
    privatePostWithdrawals::Function = privatePostWithdrawals
    privatePostSend::Function = privatePostSend
    privatePostOauth2Grant::Function = privatePostOauth2Grant
    privatePostBeneficiaries::Function = privatePostBeneficiaries
    privatePutAccountsIdName::Function = privatePutAccountsIdName
    privateDeleteWithdrawalsId::Function = privateDeleteWithdrawalsId
    privateDeleteBeneficiariesId::Function = privateDeleteBeneficiariesId

end
function describe(self::Luno, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "luno",
    Symbol("name") => "Luno",
    Symbol("countries") => ["GB", "SG", "ZA"],
    Symbol("rateLimit") => 200,
    Symbol("version") => "1",
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
        Symbol("cancelOrder") => true,
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => false,
        Symbol("createDepositAddress") => true,
        Symbol("createOrder") => true,
        Symbol("createReduceOnlyOrder") => false,
        Symbol("fetchAccounts") => true,
        Symbol("fetchAllGreeks") => false,
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
        Symbol("fetchDepositAddress") => true,
        Symbol("fetchDepositWithdrawFee") => true,
        Symbol("fetchDepositWithdrawFees") => false,
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
        Symbol("fetchMarkPrice") => false,
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
        Symbol("fetchPositionForSymbolWs") => false,
        Symbol("fetchPositionHistory") => false,
        Symbol("fetchPositionMode") => false,
        Symbol("fetchPositions") => false,
        Symbol("fetchPositionsForSymbol") => false,
        Symbol("fetchPositionsForSymbolWs") => false,
        Symbol("fetchPositionsHistory") => false,
        Symbol("fetchPositionsRisk") => false,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchSettlementHistory") => false,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => true,
        Symbol("fetchTradingFees") => false,
        Symbol("fetchUnderlyingAssets") => false,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("reduceMargin") => false,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("setLeverage") => false,
        Symbol("setMargin") => false,
        Symbol("setMarginMode") => false,
        Symbol("setPositionMode") => false
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("referral") => "https://www.luno.com/invite/44893A",
        Symbol("logo") => "https://user-images.githubusercontent.com/1294454/27766607-8c1a69d8-5ede-11e7-930c-540b5eb9be24.jpg",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => "https://api.luno.com/api",
            Symbol("private") => "https://api.luno.com/api",
            Symbol("exchange") => "https://api.luno.com/api/exchange",
            Symbol("exchangePrivate") => "https://api.luno.com/api/exchange"
        ),
        Symbol("www") => "https://www.luno.com",
        Symbol("doc") => ["https://www.luno.com/en/developers/api", "https://npmjs.org/package/bitx", "https://github.com/bausmeier/node-bitx"]
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("exchange") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("markets") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("exchangePrivate") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("candles") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("move") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("move/list_moves") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("transfers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("convert") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("move") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("orderbook") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orderbook_top") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tickers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("accounts/{id}/pending") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("accounts/{id}/transactions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("balance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("beneficiaries") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("send/networks") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("fee_info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("funding_address") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("listorders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("listtrades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("send_fee") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("withdrawals") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("withdrawals/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("transfers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("users/linked") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("accounts") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("address/validate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("postorder") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("marketorder") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("stoporder") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("funding_address") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("withdrawals") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("send") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("oauth2/grant") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("beneficiaries") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("put") => Dict{Symbol, Any}(
                Symbol("accounts/{id}/name") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("withdrawals/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("beneficiaries/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        )
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => 60,
        Symbol("5m") => 300,
        Symbol("15m") => 900,
        Symbol("30m") => 1800,
        Symbol("1h") => 3600,
        Symbol("3h") => 10800,
        Symbol("4h") => 14400,
        Symbol("1d") => 86400,
        Symbol("3d") => 259200,
        Symbol("1w") => 604800
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("tierBased") => true,
            Symbol("percentage") => true,
            Symbol("taker") => self.parseNumber("0.006"),
            Symbol("maker") => self.parseNumber("0.004"),
            Symbol("tiers") => Dict{Symbol, Any}(
                Symbol("taker") => [[self.parseNumber("0"), self.parseNumber("0.006")], [self.parseNumber("20000"), self.parseNumber("0.005")], [self.parseNumber("200000"), self.parseNumber("0.004")], [self.parseNumber("1000000"), self.parseNumber("0.003")], [self.parseNumber("2000000"), self.parseNumber("0.002")], [self.parseNumber("5000000"), self.parseNumber("0.0015")], [self.parseNumber("10000000"), self.parseNumber("0.001")], [self.parseNumber("20000000"), self.parseNumber("0.0009")], [self.parseNumber("40000000"), self.parseNumber("0.0008")], [self.parseNumber("80000000"), self.parseNumber("0.0007")], [self.parseNumber("120000000"), self.parseNumber("0.0006")], [self.parseNumber("160000000"), self.parseNumber("0.0005")], [self.parseNumber("300000000"), self.parseNumber("0.0005")]],
                Symbol("maker") => [[self.parseNumber("0"), self.parseNumber("0.004")], [self.parseNumber("20000"), self.parseNumber("0.003")], [self.parseNumber("200000"), self.parseNumber("0.002")], [self.parseNumber("1000000"), self.parseNumber("0.001")], [self.parseNumber("2000000"), self.parseNumber("0.0008")], [self.parseNumber("5000000"), self.parseNumber("0.0006")], [self.parseNumber("10000000"), self.parseNumber("0")], [self.parseNumber("20000000"), self.parseNumber("0")], [self.parseNumber("40000000"), self.parseNumber("-0.0001")], [self.parseNumber("80000000"), self.parseNumber("-0.0001")], [self.parseNumber("120000000"), self.parseNumber("-0.0002")], [self.parseNumber("160000000"), self.parseNumber("-0.0002")], [self.parseNumber("300000000"), self.parseNumber("-0.0002")]]
            )
        )
    ),
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("ErrAccountIsMigrating") => OperationRejected,
            Symbol("ErrAccountLimit") => OperationRejected,
            Symbol("ErrAccountNotFound") => ExchangeError,
            Symbol("ErrAccountsNotDifferent") => BadRequest,
            Symbol("ErrActiveCryptoRequestExists") => OperationRejected,
            Symbol("ErrAddressCreateRateLimitReached") => RateLimitExceeded,
            Symbol("ErrAddressLimitReached") => OperationRejected,
            Symbol("ErrAmountTooBig") => BadRequest,
            Symbol("ErrAmountTooSmall") => BadRequest,
            Symbol("ErrApiKeyRevoked") => AuthenticationError,
            Symbol("ErrBeneficiaryNotFound") => ExchangeError,
            Symbol("ErrBlockedSendsCurrency") => OperationRejected,
            Symbol("ErrCannotStopUnknownOrNonPendingOrder") => InvalidOrder,
            Symbol("ErrCannotTradeWhileQuoteActive") => OperationRejected,
            Symbol("ErrConvertPairNotSupported") => BadRequest,
            Symbol("ErrConvertRateLimited") => RateLimitExceeded,
            Symbol("ErrCounterDenominationNotAllowed") => InvalidOrder,
            Symbol("ErrCreditAccountNotTransactional") => BadRequest,
            Symbol("ErrCustomRefNotAllowed") => BadRequest,
            Symbol("ErrDeadlineExceeded") => RequestTimeout,
            Symbol("ErrDebitAccountNotTransactional") => BadRequest,
            Symbol("ErrDescriptionTooLong") => BadRequest,
            Symbol("ErrDifferentCurrencies") => BadRequest,
            Symbol("ErrDisallowedTarget") => InvalidAddress,
            Symbol("ErrDuplicateClientMoveID") => OperationRejected,
            Symbol("ErrDuplicateClientOrderID") => DuplicateOrderId,
            Symbol("ErrDuplicateExternalID") => OperationRejected,
            Symbol("ErrERC20AddressAlreadyAssigned") => OperationRejected,
            Symbol("ErrERC20AssignNonDefault") => BadRequest,
            Symbol("ErrFundsMoveNotFound") => ExchangeError,
            Symbol("ErrIdempotencyKeyConflict") => OperationRejected,
            Symbol("ErrIdempotencyKeyRequestMismatch") => BadRequest,
            Symbol("ErrIncompatibleBeneficiary") => BadRequest,
            Symbol("ErrIncorrectPin") => AuthenticationError,
            Symbol("ErrInsufficientBalance") => InsufficientFunds,
            Symbol("ErrInsufficientFunds") => InsufficientFunds,
            Symbol("ErrInsufficientPerms") => PermissionDenied,
            Symbol("ErrInternal") => ExchangeNotAvailable,
            Symbol("ErrInvalidAccount") => BadRequest,
            Symbol("ErrInvalidAccountID") => BadRequest,
            Symbol("ErrInvalidAccountNumber") => BadRequest,
            Symbol("ErrInvalidAmount") => BadRequest,
            Symbol("ErrInvalidArguments") => BadRequest,
            Symbol("ErrInvalidBaseVolume") => InvalidOrder,
            Symbol("ErrInvalidBranchCode") => BadRequest,
            Symbol("ErrInvalidClientOrderId") => InvalidOrder,
            Symbol("ErrInvalidCounterVolume") => InvalidOrder,
            Symbol("ErrInvalidCurrency") => BadRequest,
            Symbol("ErrInvalidDetails") => BadRequest,
            Symbol("ErrInvalidMarketPair") => BadSymbol,
            Symbol("ErrInvalidOrderRef") => InvalidOrder,
            Symbol("ErrInvalidOrderSide") => InvalidOrder,
            Symbol("ErrInvalidParameters") => BadRequest,
            Symbol("ErrInvalidPrice") => InvalidOrder,
            Symbol("ErrInvalidRequestType") => BadRequest,
            Symbol("ErrInvalidSourceAccount") => BadRequest,
            Symbol("ErrInvalidStopDirection") => InvalidOrder,
            Symbol("ErrInvalidStopPrice") => InvalidOrder,
            Symbol("ErrInvalidVolume") => InvalidOrder,
            Symbol("ErrLimitOutOfRange") => BadRequest,
            Symbol("ErrMarketNotAllowed") => PermissionDenied,
            Symbol("ErrMarketUnavailable") => ExchangeError,
            Symbol("ErrMaxActiveFiatRequestsExists") => OperationRejected,
            Symbol("ErrMissingIdempotencyKey") => BadRequest,
            Symbol("ErrNoAddressesAssigned") => InvalidAddress,
            Symbol("ErrNoTradesToInferStopDirection") => InvalidOrder,
            Symbol("ErrNotEnoughLiquidity") => InvalidOrder,
            Symbol("ErrNotFound") => ExchangeError,
            Symbol("ErrOrderCanceled") => InvalidOrder,
            Symbol("ErrOrderNotFound") => OrderNotFound,
            Symbol("ErrPostOnlyMode") => InvalidOrder,
            Symbol("ErrPostOnlyNotAllowed") => InvalidOrder,
            Symbol("ErrPriceDenominationNotAllowed") => InvalidOrder,
            Symbol("ErrPriceTooHigh") => InvalidOrder,
            Symbol("ErrPriceTooLow") => InvalidOrder,
            Symbol("ErrRejectedBeneficiary") => OperationRejected,
            Symbol("ErrRequestTypeDoesNotSupportFastWithdrawals") => BadRequest,
            Symbol("ErrStopPriceTooHigh") => InvalidOrder,
            Symbol("ErrStopPriceTooLow") => InvalidOrder,
            Symbol("ErrTooManyRequests") => RateLimitExceeded,
            Symbol("ErrTooManyRowsRequested") => BadRequest,
            Symbol("ErrTravelRule") => ManualInteractionNeeded,
            Symbol("ErrUnauthorised") => AuthenticationError,
            Symbol("ErrUnderMaintenance") => OnMaintenance,
            Symbol("ErrUpdateRequired") => ExchangeError,
            Symbol("ErrUserBlockedForCancelWithdrawal") => PermissionDenied,
            Symbol("ErrUserNotVerifiedForCurrency") => AccountNotEnabled,
            Symbol("ErrValueTooHigh") => InvalidOrder,
            Symbol("ErrVerificationLevelTooLow") => AccountNotEnabled,
            Symbol("ErrVolumeDenominationNotAllowed") => InvalidOrder,
            Symbol("ErrVolumeTooHigh") => InvalidOrder,
            Symbol("ErrVolumeTooLow") => InvalidOrder,
            Symbol("ErrWithdrawalBlocked") => PermissionDenied,
            Symbol("ErrWithdrawalNotFound") => ExchangeError
        )
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("sandbox") => false,
            Symbol("fetchCurrencies") => Dict{Symbol, Any}(
                Symbol("private") => true
            ),
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("triggerPrice") => true,
                Symbol("triggerPriceType") => nothing,
                Symbol("triggerDirection") => true,
                Symbol("stopLossPrice") => false,
                Symbol("takeProfitPrice") => false,
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
                Symbol("marketBuyByCost") => true,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("selfTradePrevention") => false,
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
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 1000,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 1000,
                Symbol("daysBack") => 100000,
                Symbol("untilDays") => nothing,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 1000,
                Symbol("daysBack") => 100000,
                Symbol("daysBackCanceled") => 1,
                Symbol("untilDays") => nothing,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => nothing
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
    Symbol("rollingWindowSize") => 60000
))

end
function fetchCurrencies(self::Luno, params=Dict())
    if functions.ccxtruthy(!functions.ccxtruthy(self.checkRequiredCredentials(false)))
            return Dict{Symbol, Any}()
    end
    response = Base.fetch(self.privateGetSendNetworks(params));
    currenciesData = self.safeList(response, "data", []);
    grouped = groupBy(currenciesData, "native_currency");
    values_var = objectValues(grouped);
    return self.parseCurrencies(values_var)

end
function parseCurrency(self::Luno, rawCurrency)
    id = safeString(get(rawCurrency, 1, nothing), "native_currency");
    code = self.safeCurrencyCode(id);
    networks = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(rawCurrency)))
        networkEntry = get(rawCurrency, i + 1, nothing);
        networkId = safeString(networkEntry, "name");
        networkCode = self.networkIdToCode(networkId, code);
        if functions.ccxtruthy(networkCode != nothing)
            networks[Symbol(networkCode)] = Dict{Symbol, Any}(
                Symbol("id") => networkId,
                Symbol("network") => networkCode,
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
                Symbol("active") => nothing,
                Symbol("deposit") => nothing,
                Symbol("withdraw") => nothing,
                Symbol("fee") => nothing,
                Symbol("precision") => nothing,
                Symbol("info") => networkEntry
            );
        end
        i += 1
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
    Symbol("info") => rawCurrency
))

end
function fetchMarkets(self::Luno, params=Dict())
    response = Base.fetch(self.exchangeGetMarkets(params));
    result = [];
    markets = safeValue(response, "markets", []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(markets)))
        market = get(markets, i + 1, nothing);
        id = safeString(market, "market_id");
        baseId = safeString(market, "base_currency");
        quoteId = safeString(market, "counter_currency");
        base = self.safeCurrencyCode(baseId);
        quote_var = self.safeCurrencyCode(quoteId);
        status = safeString(market, "trading_status");
        fiats = ["ZAR"];
        unverifiedQuotes = ["MYR", "NGN", "IDR", "KES", "UGX", "AUD", "GBP", "EUR", "USD", "ZARU"];
        stablecoins = ["USDT", "USDC"];
        taker = nothing;
        maker = nothing;
        if functions.ccxtruthy(inArray(quote_var, fiats))
            if functions.ccxtruthy(inArray(base, stablecoins))
                taker = self.parseNumber("0.002");
                maker = self.parseNumber("-0.0001");
            else
                taker = self.parseNumber("0.006");
                maker = self.parseNumber("0.004");
            end
        elseif functions.ccxtruthy(!functions.ccxtruthy(inArray(quote_var, unverifiedQuotes)))
            taker = self.parseNumber("0.001");
            maker = self.parseNumber("0.0008");
        end
        push!(result, Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("symbol") => string(base, "/", quote_var),
    Symbol("taker") => taker,
    Symbol("maker") => maker,
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
    Symbol("active") => (status == "ACTIVE"),
    Symbol("contract") => false,
    Symbol("linear") => nothing,
    Symbol("inverse") => nothing,
    Symbol("contractSize") => nothing,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.parseNumber(self.parsePrecision(safeString(market, "volume_scale"))),
        Symbol("price") => self.parseNumber(self.parsePrecision(safeString(market, "price_scale")))
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "min_volume"),
            Symbol("max") => self.safeNumber(market, "max_volume")
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "min_price"),
            Symbol("max") => self.safeNumber(market, "max_price")
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
function fetchAccounts(self::Luno, params=Dict())
    response = Base.fetch(self.privateGetBalance(params));
    wallets = safeValue(response, "balance", []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(wallets)))
        account = get(wallets, i + 1, nothing);
        accountId = safeString(account, "account_id");
        currencyId = safeString(account, "asset");
        code = self.safeCurrencyCode(currencyId);
        push!(result, Dict{Symbol, Any}(
    Symbol("id") => accountId,
    Symbol("type") => nothing,
    Symbol("code") => code,
    Symbol("info") => account
));
        i += 1
    end
    return result

end
function parseBalance(self::Luno, response)
    wallets = safeValue(response, "balance", []);
    result = Dict{Symbol, Any}(
        Symbol("info") => response,
        Symbol("timestamp") => nothing,
        Symbol("datetime") => nothing
    );
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(wallets)))
        wallet = get(wallets, i + 1, nothing);
        currencyId = safeString(wallet, "asset");
        code = self.safeCurrencyCode(currencyId);
        reserved = safeString(wallet, "reserved");
        unconfirmed = safeString(wallet, "unconfirmed");
        balance = safeString(wallet, "balance");
        reservedUnconfirmed = stringAdd(reserved, unconfirmed);
        balanceUnconfirmed = stringAdd(balance, unconfirmed);
        if functions.ccxtruthy(@functions.ccxt_and((code != nothing), (ccxt_in(code, result))))
            result[Symbol(code)][Symbol("used")] = stringAdd(get(get(result, Symbol(code), nothing), Symbol("used"), nothing), reservedUnconfirmed);
            result[Symbol(code)][Symbol("total")] = stringAdd(get(get(result, Symbol(code), nothing), Symbol("total"), nothing), balanceUnconfirmed);
        elseif functions.ccxtruthy(code != nothing)
            account = self.account();
            account[Symbol("used")] = reservedUnconfirmed;
            account[Symbol("total")] = balanceUnconfirmed;
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
function fetchBalance(self::Luno, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetBalance(params));
    return self.parseBalance(response)

end
function fetchOrderBook(self::Luno, symbol, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    response = nothing;
    if functions.ccxtruthy(@functions.ccxt_and(limit != nothing, functions.ccxt_le(limit, 100)))
        response = Base.fetch(self.publicGetOrderbookTop(extend(request, params)));
    else
        response = Base.fetch(self.publicGetOrderbook(extend(request, params)));
    end
    timestamp = safeInteger(response, "timestamp");
    return self.parseOrderBook(response, get(market, Symbol("symbol"), nothing), timestamp, "bids", "asks", "price", "volume")

end
function parseOrderStatus(self::Luno, status)
    statuses = Dict{Symbol, Any}(
        Symbol("PENDING") => "open"
    );
    return safeString(statuses, status, status)

end
function parseOrder(self::Luno, order, market=nothing)
    timestamp = safeInteger(order, "creation_timestamp");
    status = self.parseOrderStatus(safeString(order, "state"));
    status = functions.ccxtruthy((status == "open")) ? status : status;
    side = nothing;
    orderType = safeString(order, "type");
    if functions.ccxtruthy(@functions.ccxt_or((orderType == "ASK"), (orderType == "SELL")))
        side = "sell";
    elseif functions.ccxtruthy(@functions.ccxt_or((orderType == "BID"), (orderType == "BUY")))
        side = "buy";
    end
    marketId = safeString(order, "pair");
    market = self.safeMarket(marketId, market);
    price = safeString(order, "limit_price");
    amount = safeString(order, "limit_volume");
    quoteFee = self.safeNumber(order, "fee_counter");
    baseFee = self.safeNumber(order, "fee_base");
    filled = safeString(order, "base");
    cost = safeString(order, "counter");
    fee = nothing;
    if functions.ccxtruthy(quoteFee != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("cost") => quoteFee,
            Symbol("currency") => get(market, Symbol("quote"), nothing)
        );
    elseif functions.ccxtruthy(baseFee != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("cost") => baseFee,
            Symbol("currency") => get(market, Symbol("base"), nothing)
        );
    end
    id = safeString(order, "order_id");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("clientOrderId") => nothing,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("timestamp") => timestamp,
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("status") => status,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("type") => nothing,
    Symbol("timeInForce") => nothing,
    Symbol("postOnly") => nothing,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("triggerPrice") => nothing,
    Symbol("amount") => amount,
    Symbol("filled") => filled,
    Symbol("cost") => cost,
    Symbol("remaining") => nothing,
    Symbol("trades") => nothing,
    Symbol("fee") => fee,
    Symbol("info") => order,
    Symbol("average") => nothing
), market)

end
function fetchOrder(self::Luno, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("id") => id
    );
    response = Base.fetch(self.privateGetOrdersId(extend(request, params)));
    return self.parseOrder(response)

end
function fetchOrdersByState(self::Luno, state, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(state != nothing)
        request[Symbol("state")] = state;
    end
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("pair")] = get(market, Symbol("id"), nothing);
    end
    response = Base.fetch(self.privateGetListorders(extend(request, params)));
    orders = self.safeList(response, "orders", []);
    return self.parseOrders(orders, market, since, limit)

end
function fetchOrders(self::Luno, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchOrdersByState(nothing, symbol, since, limit, params))

end
function fetchOpenOrders(self::Luno, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchOrdersByState("PENDING", symbol, since, limit, params))

end
function fetchClosedOrders(self::Luno, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchOrdersByState("COMPLETE", symbol, since, limit, params))

end
function parseTicker(self::Luno, ticker, market=nothing)
    timestamp = safeInteger(ticker, "timestamp");
    marketId = safeString(ticker, "pair");
    symbol = self.safeSymbol(marketId, market);
    last_var = safeString(ticker, "last_trade");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => nothing,
    Symbol("low") => nothing,
    Symbol("bid") => safeString(ticker, "bid"),
    Symbol("bidVolume") => nothing,
    Symbol("ask") => safeString(ticker, "ask"),
    Symbol("askVolume") => nothing,
    Symbol("vwap") => nothing,
    Symbol("open") => nothing,
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => nothing,
    Symbol("average") => nothing,
    Symbol("baseVolume") => safeString(ticker, "rolling_24_hour_volume"),
    Symbol("quoteVolume") => nothing,
    Symbol("info") => ticker
), market)

end
function fetchTickers(self::Luno, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols);
    response = Base.fetch(self.publicGetTickers(params));
    rawTickers = self.safeList(response, "tickers", []);
    tickers = indexBy(rawTickers, "pair");
    ids = objectKeys(tickers);
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(ids)))
        id = get(ids, i + 1, nothing);
        market = self.safeMarket(id);
        symbol = get(market, Symbol("symbol"), nothing);
        ticker = get(tickers, Symbol(id), nothing);
        result[Symbol(symbol)] = self.parseTicker(ticker, market);
        i += 1
    end
    return self.filterByArrayTickers(result, "symbol", symbols)

end
function fetchTicker(self::Luno, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetTicker(extend(request, params)));
    return self.parseTicker(response, market)

end
function parseTrade(self::Luno, trade, market=nothing)
    orderId = safeString(trade, "order_id");
    id = safeString(trade, "sequence");
    takerOrMaker = nothing;
    side = nothing;
    if functions.ccxtruthy(orderId != nothing)
        type_var = safeString(trade, "type");
        if functions.ccxtruthy(@functions.ccxt_or((type_var == "ASK"), (type_var == "SELL")))
            side = "sell";
        elseif functions.ccxtruthy(@functions.ccxt_or((type_var == "BID"), (type_var == "BUY")))
            side = "buy";
        end
        if functions.ccxtruthy(@functions.ccxt_and(side == "sell", get(trade, Symbol("is_buy"), nothing)))
            takerOrMaker = "maker";
        elseif functions.ccxtruthy(@functions.ccxt_and(side == "buy", !functions.ccxtruthy(get(trade, Symbol("is_buy"), nothing))))
            takerOrMaker = "maker";
        else
            takerOrMaker = "taker";
        end
    else
        side = functions.ccxtruthy(get(trade, Symbol("is_buy"), nothing)) ? "buy" : "sell";
    end
    feeBaseString = safeString(trade, "fee_base");
    feeCounterString = safeString(trade, "fee_counter");
    feeCurrency = nothing;
    feeCost = nothing;
    if functions.ccxtruthy(feeBaseString != nothing)
        if functions.ccxtruthy(!functions.ccxtruthy(stringEquals(feeBaseString, "0.0")))
            feeCurrency = safeString(market, "base");
            feeCost = feeBaseString;
        end
    elseif functions.ccxtruthy(feeCounterString != nothing)
        if functions.ccxtruthy(!functions.ccxtruthy(stringEquals(feeCounterString, "0.0")))
            feeCurrency = safeString(market, "quote");
            feeCost = feeCounterString;
        end
    end
    timestamp = safeInteger(trade, "timestamp");
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("id") => id,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("order") => orderId,
    Symbol("type") => nothing,
    Symbol("side") => side,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("price") => safeString(trade, "price"),
    Symbol("amount") => safeString2(trade, "volume", "base"),
    Symbol("cost") => safeString(trade, "counter"),
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("cost") => feeCost,
        Symbol("currency") => feeCurrency
    )
), market)

end
function fetchTrades(self::Luno, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("since")] = since;
    end
    response = Base.fetch(self.publicGetTrades(extend(request, params)));
    trades = self.safeList(response, "trades", []);
    return self.parseTrades(trades, market, since, limit)

end
function fetchOHLCV(self::Luno, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("duration") => safeValue(self.timeframes, timeframe, timeframe),
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("since")] = self.parseToInt(since);
    else
        duration = 1000 * 1000 * self.parseTimeframe(timeframe);
        request[Symbol("since")] = milliseconds() - duration;
    end
    response = Base.fetch(self.exchangePrivateGetCandles(extend(request, params)));
    ohlcvs = self.safeList(response, "candles", []);
    return self.parseOHLCVs(ohlcvs, market, timeframe, since, limit)

end
function parseOHLCV(self::Luno, ohlcv, market=nothing)
    return [safeInteger(ohlcv, "timestamp"), self.safeNumber(ohlcv, "open"), self.safeNumber(ohlcv, "high"), self.safeNumber(ohlcv, "low"), self.safeNumber(ohlcv, "close"), self.safeNumber(ohlcv, "volume")]

end
function fetchMyTrades(self::Luno, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchMyTrades() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("since")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateGetListtrades(extend(request, params)));
    trades = self.safeList(response, "trades", []);
    return self.parseTrades(trades, market, since, limit)

end
function fetchTradingFee(self::Luno, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateGetFeeInfo(extend(request, params)));
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("symbol") => symbol,
    Symbol("maker") => self.safeNumber(response, "maker_fee"),
    Symbol("taker") => self.safeNumber(response, "taker_fee"),
    Symbol("percentage") => nothing,
    Symbol("tierBased") => nothing
)

end
function createOrder(self::Luno, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    response = nothing;
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " createOrder() requires a side argument")));
    end
    if functions.ccxtruthy(type_var == "market")
        request[Symbol("type")] =         uppercase(side);
        if functions.ccxtruthy(side == "buy")
            request[Symbol("counter_volume")] = self.amountToPrecision(get(market, Symbol("symbol"), nothing), amount);
        else
            request[Symbol("base_volume")] = self.amountToPrecision(get(market, Symbol("symbol"), nothing), amount);
        end
        response = Base.fetch(self.privatePostMarketorder(extend(request, params)));
    else
        request[Symbol("volume")] = self.amountToPrecision(get(market, Symbol("symbol"), nothing), amount);
        request[Symbol("price")] = self.priceToPrecision(get(market, Symbol("symbol"), nothing), price);
        request[Symbol("type")] = functions.ccxtruthy((side == "buy")) ? "BID" : "ASK";
        response = Base.fetch(self.privatePostPostorder(extend(request, params)));
    end
    if functions.ccxtruthy(response == nothing)
        throw(NullResponse(string(self.id, " createOrder() returned empty response")));
    end
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("id") => get(response, Symbol("order_id"), nothing)
), market)

end
function cancelOrder(self::Luno, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("order_id") => id
    );
    response = Base.fetch(self.privatePostStoporder(extend(request, params)));
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response
))

end
function fetchLedgerByEntries(self::Luno, code=nothing, entry=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(entry == nothing)
        entry = -1;
    end
    if functions.ccxtruthy(limit == nothing)
        limit = 1;
    end
    since = nothing;
    request = Dict{Symbol, Any}(
        Symbol("min_row") => entry,
        Symbol("max_row") => self.sum(entry, limit)
    );
    return Base.fetch(self.fetchLedger(code, since, limit, extend(request, params)))

end
function fetchLedger(self::Luno, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.loadAccounts());
    currency = nothing;
    id = safeString(params, "id");
    min_row = safeValue(params, "min_row");
    max_row = safeValue(params, "max_row");
    if functions.ccxtruthy(id == nothing)
        if functions.ccxtruthy(code == nothing)
            throw(ArgumentsRequired(string(self.id, " fetchLedger() requires a currency code argument if no account id specified in params")));
        end
        currency = self.currency(code);
        accountsByCurrencyCode = indexBy(self.accounts, "currency");
        account = safeValue(accountsByCurrencyCode, code);
        if functions.ccxtruthy(account == nothing)
            throw(ExchangeError(string(self.id, " fetchLedger() could not find account id for ", code)));
        end
        id = get(account, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(@functions.ccxt_and(min_row == nothing, max_row == nothing))
        max_row = 0;
        min_row = -1000;
    elseif functions.ccxtruthy(@functions.ccxt_or(min_row == nothing, max_row == nothing))
        throw(ExchangeError(string(self.id, " fetchLedger() require both params 'max_row' and 'min_row' or neither to be defined")));
    end
    if functions.ccxtruthy(@functions.ccxt_and(limit != nothing, functions.ccxt_gt(max_row - min_row, limit)))
        if functions.ccxtruthy(functions.ccxt_le(max_row, 0))
            min_row = max_row - limit;
        elseif functions.ccxtruthy(functions.ccxt_gt(min_row, 0))
            max_row = min_row + limit;
        end
    end
    if functions.ccxtruthy(functions.ccxt_gt(max_row - min_row, 1000))
        throw(ExchangeError(string(self.id, " fetchLedger() requires the params 'max_row' - 'min_row' <= 1000")));
    end
    request = Dict{Symbol, Any}(
        Symbol("id") => id,
        Symbol("min_row") => min_row,
        Symbol("max_row") => max_row
    );
    response = Base.fetch(self.privateGetAccountsIdTransactions(extend(params, request)));
    entries = safeValue(response, "transactions", []);
    return self.parseLedger(entries, currency, since, limit)

end
function parseLedgerComment(self::Luno, comment)
    words = split(comment, " ");
    types = Dict{Symbol, Any}(
        Symbol("Withdrawal") => "fee",
        Symbol("Trading") => "fee",
        Symbol("Payment") => "transaction",
        Symbol("Sent") => "transaction",
        Symbol("Deposit") => "transaction",
        Symbol("Received") => "transaction",
        Symbol("Released") => "released",
        Symbol("Reserved") => "reserved",
        Symbol("Sold") => "trade",
        Symbol("Bought") => "trade",
        Symbol("Failure") => "failed"
    );
    referenceId = nothing;
    firstWord = safeString(words, 0);
    thirdWord = safeString(words, 2);
    fourthWord = safeString(words, 3);
    type_var = safeString(types, firstWord);
    if functions.ccxtruthy(@functions.ccxt_and((type_var == nothing), (thirdWord == "fee")))
        type_var = "fee";
    end
    if functions.ccxtruthy(@functions.ccxt_and((type_var == "reserved"), (fourthWord == "order")))
        referenceId = safeString(words, 4);
    end
    return Dict{Symbol, Any}(
    Symbol("type") => type_var,
    Symbol("referenceId") => referenceId
)

end
function parseLedgerEntry(self::Luno, entry, currency=nothing)
    id = safeString(entry, "row_index");
    account_id = safeString(entry, "account_id");
    timestamp = safeInteger(entry, "timestamp");
    currencyId = safeString(entry, "currency");
    code = self.safeCurrencyCode(currencyId, currency);
    currency = self.safeCurrency(currencyId, currency);
    available_delta = safeString(entry, "available_delta");
    balance_delta = safeString(entry, "balance_delta");
    after = safeString(entry, "balance");
    comment = safeString(entry, "description");
    before = after;
    amount = "0.0";
    result = self.parseLedgerComment(comment);
    type_var = get(result, Symbol("type"), nothing);
    referenceId = get(result, Symbol("referenceId"), nothing);
    direction = nothing;
    status = nothing;
    if functions.ccxtruthy(!functions.ccxtruthy(stringEquals(balance_delta, "0.0")))
        before = stringSub(after, balance_delta);
        status = "ok";
        amount = stringAbs(balance_delta);
    elseif functions.ccxtruthy(stringLt(available_delta, "0.0"))
        status = "pending";
        amount = stringAbs(available_delta);
    else
        if functions.ccxtruthy(stringGt(available_delta, "0.0"))
            status = "canceled";
            amount = stringAbs(available_delta);
        end

    end
    if functions.ccxtruthy(@functions.ccxt_or(stringGt(balance_delta, "0"), stringGt(available_delta, "0")))
        direction = "in";
    elseif functions.ccxtruthy(@functions.ccxt_or(stringLt(balance_delta, "0"), stringLt(available_delta, "0")))
        direction = "out";
    end
    return self.safeLedgerEntry(Dict{Symbol, Any}(
    Symbol("info") => entry,
    Symbol("id") => id,
    Symbol("direction") => direction,
    Symbol("account") => account_id,
    Symbol("referenceId") => referenceId,
    Symbol("referenceAccount") => nothing,
    Symbol("type") => type_var,
    Symbol("currency") => code,
    Symbol("amount") => self.parseToNumeric(amount),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("before") => self.parseToNumeric(before),
    Symbol("after") => self.parseToNumeric(after),
    Symbol("status") => status,
    Symbol("fee") => nothing
), currency)

end
function createDepositAddress(self::Luno, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("asset") => get(currency, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privatePostFundingAddress(extend(request, params)));
    return self.parseDepositAddress(response, currency)

end
function fetchDepositAddress(self::Luno, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("asset") => get(currency, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateGetFundingAddress(extend(request, params)));
    return self.parseDepositAddress(response, currency)

end
function parseDepositAddress(self::Luno, depositAddress, currency=nothing)
    currencyId = safeStringUpper(depositAddress, "currency");
    code = self.safeCurrencyCode(currencyId, currency);
    return Dict{Symbol, Any}(
    Symbol("info") => depositAddress,
    Symbol("currency") => code,
    Symbol("network") => nothing,
    Symbol("address") => safeString(depositAddress, "address"),
    Symbol("tag") => safeString(depositAddress, "name")
)

end
function fetchDepositWithdrawFee(self::Luno, code, params=Dict())
    address = safeString(params, "address");
    if functions.ccxtruthy(address == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchDepositWithdrawFee() requires an \"address\" parameter - luno quotes the send fee per destination address")));
    end
    Base.fetch(self.loadMarkets());
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateGetSendFee(extend(request, params)));
    result = self.depositWithdrawFee(response);
    result[Symbol("withdraw")][Symbol("fee")] = self.safeNumber(response, "fee");
    result[Symbol("withdraw")][Symbol("percentage")] = false;
    return self.assignDefaultDepositWithdrawFees(result, currency)

end
function sign(self::Luno, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing), "/", self.version, "/", self.implodeParams(path, params));
    query = omit(params, self.extractParams(path));
    if functions.ccxtruthy(length(objectKeys(query)))
        url += string("?", self.urlencode(query));
    end
    if functions.ccxtruthy(@functions.ccxt_or((api == "private"), (api == "exchangePrivate")))
        self.checkRequiredCredentials();
        auth = self.stringToBase64(string(self.apiKey, ":", self.secret));
        headers = Dict{Symbol, Any}(
            Symbol("Authorization") => string("Basic ", auth)
        );
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Luno, httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    error = safeValue(response, "error");
    if functions.ccxtruthy(error != nothing)
        feedback = string(self.id, " ", json(response));
        errorCode = safeString(response, "error_code");
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), errorCode, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Luno, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function exchangeGetMarkets(self::Luno, params=Dict(), context=Dict())
    return request(self, "markets", "exchange", "GET", params, nothing, nothing, Dict())
end

function exchangePrivateGetCandles(self::Luno, params=Dict(), context=Dict())
    return request(self, "candles", "exchangePrivate", "GET", params, nothing, nothing, Dict())
end

function exchangePrivateGetMove(self::Luno, params=Dict(), context=Dict())
    return request(self, "move", "exchangePrivate", "GET", params, nothing, nothing, Dict())
end

function exchangePrivateGetMoveListMoves(self::Luno, params=Dict(), context=Dict())
    return request(self, "move/list_moves", "exchangePrivate", "GET", params, nothing, nothing, Dict())
end

function exchangePrivateGetTransfers(self::Luno, params=Dict(), context=Dict())
    return request(self, "transfers", "exchangePrivate", "GET", params, nothing, nothing, Dict())
end

function exchangePrivatePostConvert(self::Luno, params=Dict(), context=Dict())
    return request(self, "convert", "exchangePrivate", "POST", params, nothing, nothing, Dict())
end

function exchangePrivatePostMove(self::Luno, params=Dict(), context=Dict())
    return request(self, "move", "exchangePrivate", "POST", params, nothing, nothing, Dict())
end

function publicGetOrderbook(self::Luno, params=Dict(), context=Dict())
    return request(self, "orderbook", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetOrderbookTop(self::Luno, params=Dict(), context=Dict())
    return request(self, "orderbook_top", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTicker(self::Luno, params=Dict(), context=Dict())
    return request(self, "ticker", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTickers(self::Luno, params=Dict(), context=Dict())
    return request(self, "tickers", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTrades(self::Luno, params=Dict(), context=Dict())
    return request(self, "trades", "public", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountsIdPending(self::Luno, params=Dict(), context=Dict())
    return request(self, "accounts/{id}/pending", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountsIdTransactions(self::Luno, params=Dict(), context=Dict())
    return request(self, "accounts/{id}/transactions", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetBalance(self::Luno, params=Dict(), context=Dict())
    return request(self, "balance", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetBeneficiaries(self::Luno, params=Dict(), context=Dict())
    return request(self, "beneficiaries", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetSendNetworks(self::Luno, params=Dict(), context=Dict())
    return request(self, "send/networks", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetFeeInfo(self::Luno, params=Dict(), context=Dict())
    return request(self, "fee_info", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetFundingAddress(self::Luno, params=Dict(), context=Dict())
    return request(self, "funding_address", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetListorders(self::Luno, params=Dict(), context=Dict())
    return request(self, "listorders", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetListtrades(self::Luno, params=Dict(), context=Dict())
    return request(self, "listtrades", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetSendFee(self::Luno, params=Dict(), context=Dict())
    return request(self, "send_fee", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetOrdersId(self::Luno, params=Dict(), context=Dict())
    return request(self, "orders/{id}", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetWithdrawals(self::Luno, params=Dict(), context=Dict())
    return request(self, "withdrawals", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetWithdrawalsId(self::Luno, params=Dict(), context=Dict())
    return request(self, "withdrawals/{id}", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTransfers(self::Luno, params=Dict(), context=Dict())
    return request(self, "transfers", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetUsersLinked(self::Luno, params=Dict(), context=Dict())
    return request(self, "users/linked", "private", "GET", params, nothing, nothing, Dict())
end

function privatePostAccounts(self::Luno, params=Dict(), context=Dict())
    return request(self, "accounts", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAddressValidate(self::Luno, params=Dict(), context=Dict())
    return request(self, "address/validate", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostPostorder(self::Luno, params=Dict(), context=Dict())
    return request(self, "postorder", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostMarketorder(self::Luno, params=Dict(), context=Dict())
    return request(self, "marketorder", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostStoporder(self::Luno, params=Dict(), context=Dict())
    return request(self, "stoporder", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostFundingAddress(self::Luno, params=Dict(), context=Dict())
    return request(self, "funding_address", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostWithdrawals(self::Luno, params=Dict(), context=Dict())
    return request(self, "withdrawals", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostSend(self::Luno, params=Dict(), context=Dict())
    return request(self, "send", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOauth2Grant(self::Luno, params=Dict(), context=Dict())
    return request(self, "oauth2/grant", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostBeneficiaries(self::Luno, params=Dict(), context=Dict())
    return request(self, "beneficiaries", "private", "POST", params, nothing, nothing, Dict())
end

function privatePutAccountsIdName(self::Luno, params=Dict(), context=Dict())
    return request(self, "accounts/{id}/name", "private", "PUT", params, nothing, nothing, Dict())
end

function privateDeleteWithdrawalsId(self::Luno, params=Dict(), context=Dict())
    return request(self, "withdrawals/{id}", "private", "DELETE", params, nothing, nothing, Dict())
end

function privateDeleteBeneficiariesId(self::Luno, params=Dict(), context=Dict())
    return request(self, "beneficiaries/{id}", "private", "DELETE", params, nothing, nothing, Dict())
end

function Luno(; kwargs...)
    inst = Luno(Exchange(), describe, fetchCurrencies, parseCurrency, fetchMarkets, fetchAccounts, parseBalance, fetchBalance, fetchOrderBook, parseOrderStatus, parseOrder, fetchOrder, fetchOrdersByState, fetchOrders, fetchOpenOrders, fetchClosedOrders, parseTicker, fetchTickers, fetchTicker, parseTrade, fetchTrades, fetchOHLCV, parseOHLCV, fetchMyTrades, fetchTradingFee, createOrder, cancelOrder, fetchLedgerByEntries, fetchLedger, parseLedgerComment, parseLedgerEntry, createDepositAddress, fetchDepositAddress, parseDepositAddress, fetchDepositWithdrawFee, sign, handleErrors, exchangeGetMarkets, exchangePrivateGetCandles, exchangePrivateGetMove, exchangePrivateGetMoveListMoves, exchangePrivateGetTransfers, exchangePrivatePostConvert, exchangePrivatePostMove, publicGetOrderbook, publicGetOrderbookTop, publicGetTicker, publicGetTickers, publicGetTrades, privateGetAccountsIdPending, privateGetAccountsIdTransactions, privateGetBalance, privateGetBeneficiaries, privateGetSendNetworks, privateGetFeeInfo, privateGetFundingAddress, privateGetListorders, privateGetListtrades, privateGetSendFee, privateGetOrdersId, privateGetWithdrawals, privateGetWithdrawalsId, privateGetTransfers, privateGetUsersLinked, privatePostAccounts, privatePostAddressValidate, privatePostPostorder, privatePostMarketorder, privatePostStoporder, privatePostFundingAddress, privatePostWithdrawals, privatePostSend, privatePostOauth2Grant, privatePostBeneficiaries, privatePutAccountsIdName, privateDeleteWithdrawalsId, privateDeleteBeneficiariesId)
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
