@kwdef mutable struct Gemini <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchCurrencies::Function = fetchCurrencies
    fetchCurrenciesFromWeb::Function = fetchCurrenciesFromWeb
    parseCurrency::Function = parseCurrency
    fetchMarkets::Function = fetchMarkets
    fetchMarketsFromWeb::Function = fetchMarketsFromWeb
    parseMarketActive::Function = parseMarketActive
    fetchUSDTMarkets::Function = fetchUSDTMarkets
    fetchMarketsFromAPI::Function = fetchMarketsFromAPI
    parseMarket::Function = parseMarket
    fetchOrderBook::Function = fetchOrderBook
    fetchTickerV1::Function = fetchTickerV1
    fetchTickerV2::Function = fetchTickerV2
    fetchTickerV1AndV2::Function = fetchTickerV1AndV2
    fetchTicker::Function = fetchTicker
    parseTicker::Function = parseTicker
    fetchTickers::Function = fetchTickers
    parseTrade::Function = parseTrade
    fetchTrades::Function = fetchTrades
    parseBalance::Function = parseBalance
    fetchTradingFees::Function = fetchTradingFees
    fetchBalance::Function = fetchBalance
    parseOrder::Function = parseOrder
    fetchOrder::Function = fetchOrder
    fetchOpenOrders::Function = fetchOpenOrders
    createOrder::Function = createOrder
    cancelOrder::Function = cancelOrder
    fetchMyTrades::Function = fetchMyTrades
    withdraw::Function = withdraw
    nonce::Function = nonce
    fetchDepositsWithdrawals::Function = fetchDepositsWithdrawals
    parseTransaction::Function = parseTransaction
    parseTransactionStatus::Function = parseTransactionStatus
    parseDepositAddress::Function = parseDepositAddress
    fetchDepositAddress::Function = fetchDepositAddress
    fetchDepositAddressesByNetwork::Function = fetchDepositAddressesByNetwork
    sign::Function = sign
    handleErrors::Function = handleErrors
    createDepositAddress::Function = createDepositAddress
    fetchOHLCV::Function = fetchOHLCV
    fetchOpenInterest::Function = fetchOpenInterest
    parseOpenInterest::Function = parseOpenInterest

# Generated REST endpoint fields
    webExchangeGet::Function = webExchangeGet
    webGetRestApi::Function = webGetRestApi
    publicGetV1Symbols::Function = publicGetV1Symbols
    publicGetV1SymbolsDetailsSymbol::Function = publicGetV1SymbolsDetailsSymbol
    publicGetV1NetworkToken::Function = publicGetV1NetworkToken
    publicGetV1StakingRates::Function = publicGetV1StakingRates
    publicGetV1PubtickerSymbol::Function = publicGetV1PubtickerSymbol
    publicGetV1Feepromos::Function = publicGetV1Feepromos
    publicGetV2TickerSymbol::Function = publicGetV2TickerSymbol
    publicGetV2CandlesSymbolTimeframe::Function = publicGetV2CandlesSymbolTimeframe
    publicGetV1TradesSymbol::Function = publicGetV1TradesSymbol
    publicGetV1AuctionSymbol::Function = publicGetV1AuctionSymbol
    publicGetV1AuctionSymbolHistory::Function = publicGetV1AuctionSymbolHistory
    publicGetV1Pricefeed::Function = publicGetV1Pricefeed
    publicGetV1FundingamountSymbol::Function = publicGetV1FundingamountSymbol
    publicGetV1FundingamountreportRecordsXlsx::Function = publicGetV1FundingamountreportRecordsXlsx
    publicGetV1BookSymbol::Function = publicGetV1BookSymbol
    publicGetV1EarnRates::Function = publicGetV1EarnRates
    publicGetV2DerivativesCandlesSymbolTimeFrame::Function = publicGetV2DerivativesCandlesSymbolTimeFrame
    publicGetV2FxrateSymbolTimestamp::Function = publicGetV2FxrateSymbolTimestamp
    publicGetV1RiskstatsSymbol::Function = publicGetV1RiskstatsSymbol
    privateGetV1PerpetualsFundingpaymentreportRecordsXlsx::Function = privateGetV1PerpetualsFundingpaymentreportRecordsXlsx
    privatePostV1StakingUnstake::Function = privatePostV1StakingUnstake
    privatePostV1StakingStake::Function = privatePostV1StakingStake
    privatePostV1StakingRewards::Function = privatePostV1StakingRewards
    privatePostV1StakingHistory::Function = privatePostV1StakingHistory
    privatePostV1OrderNew::Function = privatePostV1OrderNew
    privatePostV1OrderCancel::Function = privatePostV1OrderCancel
    privatePostV1WrapSymbol::Function = privatePostV1WrapSymbol
    privatePostV1OrderCancelSession::Function = privatePostV1OrderCancelSession
    privatePostV1OrderCancelAll::Function = privatePostV1OrderCancelAll
    privatePostV1OrderStatus::Function = privatePostV1OrderStatus
    privatePostV1Orders::Function = privatePostV1Orders
    privatePostV1Mytrades::Function = privatePostV1Mytrades
    privatePostV1Notionalvolume::Function = privatePostV1Notionalvolume
    privatePostV1Tradevolume::Function = privatePostV1Tradevolume
    privatePostV1ClearingNew::Function = privatePostV1ClearingNew
    privatePostV1ClearingStatus::Function = privatePostV1ClearingStatus
    privatePostV1ClearingCancel::Function = privatePostV1ClearingCancel
    privatePostV1ClearingConfirm::Function = privatePostV1ClearingConfirm
    privatePostV1Balances::Function = privatePostV1Balances
    privatePostV1BalancesStaking::Function = privatePostV1BalancesStaking
    privatePostV1NotionalbalancesCurrency::Function = privatePostV1NotionalbalancesCurrency
    privatePostV1Transfers::Function = privatePostV1Transfers
    privatePostV1AddressesNetwork::Function = privatePostV1AddressesNetwork
    privatePostV1DepositNetworkNewAddress::Function = privatePostV1DepositNetworkNewAddress
    privatePostV1DepositCurrencyNewAddress::Function = privatePostV1DepositCurrencyNewAddress
    privatePostV1WithdrawCurrency::Function = privatePostV1WithdrawCurrency
    privatePostV1AccountTransferCurrency::Function = privatePostV1AccountTransferCurrency
    privatePostV1PaymentsAddbank::Function = privatePostV1PaymentsAddbank
    privatePostV1PaymentsMethods::Function = privatePostV1PaymentsMethods
    privatePostV1PaymentsSenWithdraw::Function = privatePostV1PaymentsSenWithdraw
    privatePostV1BalancesEarn::Function = privatePostV1BalancesEarn
    privatePostV1EarnInterest::Function = privatePostV1EarnInterest
    privatePostV1EarnHistory::Function = privatePostV1EarnHistory
    privatePostV1ApprovedAddressesNetworkRequest::Function = privatePostV1ApprovedAddressesNetworkRequest
    privatePostV1ApprovedAddressesAccountNetwork::Function = privatePostV1ApprovedAddressesAccountNetwork
    privatePostV1ApprovedAddressesNetworkRemove::Function = privatePostV1ApprovedAddressesNetworkRemove
    privatePostV1Account::Function = privatePostV1Account
    privatePostV1AccountCreate::Function = privatePostV1AccountCreate
    privatePostV1AccountList::Function = privatePostV1AccountList
    privatePostV1Heartbeat::Function = privatePostV1Heartbeat
    privatePostV1Roles::Function = privatePostV1Roles
    privatePostV1Custodyaccountfees::Function = privatePostV1Custodyaccountfees
    privatePostV1WithdrawCurrencyCodeLowerCaseFeeEstimate::Function = privatePostV1WithdrawCurrencyCodeLowerCaseFeeEstimate
    privatePostV1PaymentsAddbankCad::Function = privatePostV1PaymentsAddbankCad
    privatePostV1Transactions::Function = privatePostV1Transactions
    privatePostV1MarginAccount::Function = privatePostV1MarginAccount
    privatePostV1MarginRates::Function = privatePostV1MarginRates
    privatePostV1MarginOrderPreview::Function = privatePostV1MarginOrderPreview
    privatePostV1ClearingList::Function = privatePostV1ClearingList
    privatePostV1ClearingBrokerList::Function = privatePostV1ClearingBrokerList
    privatePostV1ClearingBrokerNew::Function = privatePostV1ClearingBrokerNew
    privatePostV1ClearingTrades::Function = privatePostV1ClearingTrades
    privatePostV1InstantQuote::Function = privatePostV1InstantQuote
    privatePostV1InstantExecute::Function = privatePostV1InstantExecute
    privatePostV1AccountRename::Function = privatePostV1AccountRename
    privatePostV1OauthRevokeByToken::Function = privatePostV1OauthRevokeByToken
    privatePostV1Margin::Function = privatePostV1Margin
    privatePostV1PerpetualsFundingPayment::Function = privatePostV1PerpetualsFundingPayment
    privatePostV1PerpetualsFundingpaymentreportRecordsJson::Function = privatePostV1PerpetualsFundingpaymentreportRecordsJson
    privatePostV1Positions::Function = privatePostV1Positions

end
function describe(self::Gemini, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "gemini",
    Symbol("name") => "Gemini",
    Symbol("countries") => ["US"],
    Symbol("rateLimit") => 100,
    Symbol("version") => "v1",
    Symbol("pro") => true,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => true,
        Symbol("margin") => nothing,
        Symbol("swap") => true,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("addMargin") => false,
        Symbol("cancelOrder") => true,
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => false,
        Symbol("createDepositAddress") => true,
        Symbol("createMarketOrder") => false,
        Symbol("createOrder") => true,
        Symbol("createReduceOnlyOrder") => false,
        Symbol("fetchBalance") => true,
        Symbol("fetchBidsAsks") => false,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchClosedOrders") => false,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDepositAddress") => true,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => true,
        Symbol("fetchDepositsWithdrawals") => true,
        Symbol("fetchFundingHistory") => false,
        Symbol("fetchFundingRate") => false,
        Symbol("fetchFundingRateHistory") => false,
        Symbol("fetchFundingRates") => false,
        Symbol("fetchIndexOHLCV") => false,
        Symbol("fetchIsolatedBorrowRate") => false,
        Symbol("fetchIsolatedBorrowRates") => false,
        Symbol("fetchLeverage") => false,
        Symbol("fetchLeverageTiers") => false,
        Symbol("fetchMarginMode") => false,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => false,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterestHistory") => false,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrders") => false,
        Symbol("fetchPosition") => false,
        Symbol("fetchPositionMode") => false,
        Symbol("fetchPositions") => false,
        Symbol("fetchPositionsRisk") => false,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => false,
        Symbol("fetchTradingFees") => true,
        Symbol("fetchTransactions") => "emulated",
        Symbol("postOnly") => true,
        Symbol("reduceMargin") => false,
        Symbol("sandbox") => true,
        Symbol("setLeverage") => false,
        Symbol("setMarginMode") => false,
        Symbol("setPositionMode") => false,
        Symbol("withdraw") => true
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://user-images.githubusercontent.com/1294454/27816857-ce7be644-6096-11e7-82d6-3c257263229c.jpg",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => "https://api.gemini.com",
            Symbol("private") => "https://api.gemini.com",
            Symbol("web") => "https://docs.gemini.com",
            Symbol("webExchange") => "https://exchange.gemini.com"
        ),
        Symbol("www") => "https://gemini.com/",
        Symbol("doc") => ["https://docs.gemini.com/rest-api", "https://docs.sandbox.gemini.com"],
        Symbol("test") => Dict{Symbol, Any}(
            Symbol("public") => "https://api.sandbox.gemini.com",
            Symbol("private") => "https://api.sandbox.gemini.com",
            Symbol("web") => "https://docs.gemini.com",
            Symbol("webExchange") => "https://exchange.gemini.com"
        ),
        Symbol("fees") => ["https://gemini.com/api-fee-schedule", "https://gemini.com/trading-fees", "https://gemini.com/transfer-fees"]
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("webExchange") => Dict{Symbol, Any}(
            Symbol("get") => [""]
        ),
        Symbol("web") => Dict{Symbol, Any}(
            Symbol("get") => ["rest-api"]
        ),
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("v1/symbols") => 5,
                Symbol("v1/symbols/details/{symbol}") => 5,
                Symbol("v1/network/{token}") => 5,
                Symbol("v1/staking/rates") => 5,
                Symbol("v1/pubticker/{symbol}") => 5,
                Symbol("v1/feepromos") => 5,
                Symbol("v2/ticker/{symbol}") => 5,
                Symbol("v2/candles/{symbol}/{timeframe}") => 5,
                Symbol("v1/trades/{symbol}") => 5,
                Symbol("v1/auction/{symbol}") => 5,
                Symbol("v1/auction/{symbol}/history") => 5,
                Symbol("v1/pricefeed") => 5,
                Symbol("v1/fundingamount/{symbol}") => 5,
                Symbol("v1/fundingamountreport/records.xlsx") => 5,
                Symbol("v1/book/{symbol}") => 5,
                Symbol("v1/earn/rates") => 5,
                Symbol("v2/derivatives/candles/{symbol}/{time_frame}") => 5,
                Symbol("v2/fxrate/{symbol}/{timestamp}") => 5,
                Symbol("v1/riskstats/{symbol}") => 5
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("v1/perpetuals/fundingpaymentreport/records.xlsx") => 1
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("v1/staking/unstake") => 1,
                Symbol("v1/staking/stake") => 1,
                Symbol("v1/staking/rewards") => 1,
                Symbol("v1/staking/history") => 1,
                Symbol("v1/order/new") => 1,
                Symbol("v1/order/cancel") => 1,
                Symbol("v1/wrap/{symbol}") => 1,
                Symbol("v1/order/cancel/session") => 1,
                Symbol("v1/order/cancel/all") => 1,
                Symbol("v1/order/status") => 1,
                Symbol("v1/orders") => 1,
                Symbol("v1/mytrades") => 1,
                Symbol("v1/notionalvolume") => 1,
                Symbol("v1/tradevolume") => 1,
                Symbol("v1/clearing/new") => 1,
                Symbol("v1/clearing/status") => 1,
                Symbol("v1/clearing/cancel") => 1,
                Symbol("v1/clearing/confirm") => 1,
                Symbol("v1/balances") => 1,
                Symbol("v1/balances/staking") => 1,
                Symbol("v1/notionalbalances/{currency}") => 1,
                Symbol("v1/transfers") => 1,
                Symbol("v1/addresses/{network}") => 1,
                Symbol("v1/deposit/{network}/newAddress") => 1,
                Symbol("v1/deposit/{currency}/newAddress") => 1,
                Symbol("v1/withdraw/{currency}") => 1,
                Symbol("v1/account/transfer/{currency}") => 1,
                Symbol("v1/payments/addbank") => 1,
                Symbol("v1/payments/methods") => 1,
                Symbol("v1/payments/sen/withdraw") => 1,
                Symbol("v1/balances/earn") => 1,
                Symbol("v1/earn/interest") => 1,
                Symbol("v1/earn/history") => 1,
                Symbol("v1/approvedAddresses/{network}/request") => 1,
                Symbol("v1/approvedAddresses/account/{network}") => 1,
                Symbol("v1/approvedAddresses/{network}/remove") => 1,
                Symbol("v1/account") => 1,
                Symbol("v1/account/create") => 1,
                Symbol("v1/account/list") => 1,
                Symbol("v1/heartbeat") => 1,
                Symbol("v1/roles") => 1,
                Symbol("v1/custodyaccountfees") => 1,
                Symbol("v1/withdraw/{currencyCodeLowerCase}/feeEstimate") => 1,
                Symbol("v1/payments/addbank/cad") => 1,
                Symbol("v1/transactions") => 1,
                Symbol("v1/margin/account") => 1,
                Symbol("v1/margin/rates") => 1,
                Symbol("v1/margin/order/preview") => 1,
                Symbol("v1/clearing/list") => 1,
                Symbol("v1/clearing/broker/list") => 1,
                Symbol("v1/clearing/broker/new") => 1,
                Symbol("v1/clearing/trades") => 1,
                Symbol("v1/instant/quote") => 1,
                Symbol("v1/instant/execute") => 1,
                Symbol("v1/account/rename") => 1,
                Symbol("v1/oauth/revokeByToken") => 1,
                Symbol("v1/margin") => 1,
                Symbol("v1/perpetuals/fundingPayment") => 1,
                Symbol("v1/perpetuals/fundingpaymentreport/records.json") => 1,
                Symbol("v1/positions") => 1
            )
        )
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("taker") => 0.004,
            Symbol("maker") => 0.002
        )
    ),
    Symbol("httpExceptions") => Dict{Symbol, Any}(
        Symbol("400") => BadRequest,
        Symbol("403") => PermissionDenied,
        Symbol("404") => OrderNotFound,
        Symbol("406") => InsufficientFunds,
        Symbol("429") => RateLimitExceeded,
        Symbol("500") => ExchangeError,
        Symbol("502") => ExchangeNotAvailable,
        Symbol("503") => OnMaintenance
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "1m",
        Symbol("5m") => "5m",
        Symbol("15m") => "15m",
        Symbol("30m") => "30m",
        Symbol("1h") => "1hr",
        Symbol("6h") => "6hr",
        Symbol("1d") => "1day"
    ),
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("AuctionNotOpen") => BadRequest,
            Symbol("ClientOrderIdTooLong") => BadRequest,
            Symbol("ClientOrderIdMustBeString") => BadRequest,
            Symbol("ConflictingOptions") => BadRequest,
            Symbol("EndpointMismatch") => BadRequest,
            Symbol("EndpointNotFound") => BadRequest,
            Symbol("IneligibleTiming") => BadRequest,
            Symbol("InsufficientFunds") => InsufficientFunds,
            Symbol("InvalidJson") => BadRequest,
            Symbol("InvalidNonce") => InvalidNonce,
            Symbol("InvalidApiKey") => AuthenticationError,
            Symbol("InvalidOrderType") => InvalidOrder,
            Symbol("InvalidPrice") => InvalidOrder,
            Symbol("InvalidQuantity") => InvalidOrder,
            Symbol("InvalidSide") => InvalidOrder,
            Symbol("InvalidSignature") => AuthenticationError,
            Symbol("InvalidSymbol") => BadRequest,
            Symbol("InvalidTimestampInPayload") => BadRequest,
            Symbol("Maintenance") => OnMaintenance,
            Symbol("MarketNotOpen") => InvalidOrder,
            Symbol("MissingApikeyHeader") => AuthenticationError,
            Symbol("MissingOrderField") => InvalidOrder,
            Symbol("MissingRole") => AuthenticationError,
            Symbol("MissingPayloadHeader") => AuthenticationError,
            Symbol("MissingSignatureHeader") => AuthenticationError,
            Symbol("NoSSL") => AuthenticationError,
            Symbol("OptionsMustBeArray") => BadRequest,
            Symbol("OrderNotFound") => OrderNotFound,
            Symbol("RateLimit") => RateLimitExceeded,
            Symbol("System") => ExchangeError,
            Symbol("UnsupportedOption") => BadRequest
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("The Gemini Exchange is currently undergoing maintenance.") => OnMaintenance,
            Symbol("We are investigating technical issues with the Gemini Exchange.") => ExchangeNotAvailable,
            Symbol("Internal Server Error") => ExchangeNotAvailable
        )
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("fetchMarketsMethod") => "fetch_markets_from_api",
        Symbol("fetchMarketFromWebRetries") => 10,
        Symbol("fetchMarketsFromAPI") => Dict{Symbol, Any}(
            Symbol("fetchDetailsForAllSymbols") => false,
            Symbol("quoteCurrencies") => ["USDT", "GUSD", "USD", "DAI", "EUR", "GBP", "SGD", "BTC", "ETH", "LTC", "BCH", "SOL", "USDC"]
        ),
        Symbol("fetchMarkets") => Dict{Symbol, Any}(
            Symbol("webApiEnable") => true,
            Symbol("webApiRetries") => 10
        ),
        Symbol("fetchUsdtMarkets") => ["btcusdt", "ethusdt"],
        Symbol("fetchCurrencies") => Dict{Symbol, Any}(
            Symbol("webApiEnable") => true,
            Symbol("webApiRetries") => 5,
            Symbol("webApiMuteFailure") => true
        ),
        Symbol("fetchTickerMethod") => "fetchTickerV1",
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("BTC") => "bitcoin",
            Symbol("ERC20") => "ethereum",
            Symbol("BCH") => "bitcoincash",
            Symbol("LTC") => "litecoin",
            Symbol("ZEC") => "zcash",
            Symbol("FIL") => "filecoin",
            Symbol("DOGE") => "dogecoin",
            Symbol("XTZ") => "tezos",
            Symbol("AVAXX") => "avalanche",
            Symbol("SOL") => "solana",
            Symbol("ATOM") => "cosmos",
            Symbol("DOT") => "polkadot"
        ),
        Symbol("nonce") => "milliseconds",
        Symbol("conflictingMarkets") => Dict{Symbol, Any}(
            Symbol("paxgusd") => Dict{Symbol, Any}(
                Symbol("base") => "PAXG",
                Symbol("quote") => "USD"
            )
        ),
        Symbol("brokenPairs") => ["efilusd", "maticrlusd", "maticusdc", "eurusdc", "maticgusd", "maticusd", "efilfil", "eurusd"]
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("default") => Dict{Symbol, Any}(
            Symbol("sandbox") => true,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
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
                Symbol("limit") => 500,
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => nothing,
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
                Symbol("limit") => nothing,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => nothing,
            Symbol("fetchClosedOrders") => nothing,
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => nothing
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
function fetchCurrencies(self::Gemini, params=Dict())
    return Base.fetch(self.fetchCurrenciesFromWeb(params))

end
function fetchCurrenciesFromWeb(self::Gemini, params=Dict())
    data = Base.fetch(self.fetchWebEndpoint("fetchCurrencies", "webExchangeGet", true, "=\"currencyData\">", "</script>"));
    if functions.ccxtruthy(data == nothing)
            return Dict{Symbol, Any}()
    end
    self.options[Symbol("tradingPairs")] = self.safeList(data, "tradingPairs");
    currenciesArray = safeValue(data, "currencies", []);
    return self.parseCurrencies(currenciesArray)

end
function parseCurrency(self::Gemini, rawCurrency)
    id = safeString(rawCurrency, 0);
    code = self.safeCurrencyCode(id);
    type_var = functions.ccxtruthy(safeString(rawCurrency, 7)) ? "fiat" : "crypto";
    precision = self.parseNumber(self.parsePrecision(safeString(rawCurrency, 5)));
    networks = Dict{Symbol, Any}();
    networkId = safeString(rawCurrency, 9);
    networkCode = nothing;
    if functions.ccxtruthy(networkId != nothing)
        networkCode = self.networkIdToCode(networkId, code);
        networks[Symbol(networkCode)] = Dict{Symbol, Any}(
            Symbol("info") => rawCurrency,
            Symbol("id") => networkId,
            Symbol("network") => networkCode,
            Symbol("active") => nothing,
            Symbol("deposit") => nothing,
            Symbol("withdraw") => nothing,
            Symbol("fee") => nothing,
            Symbol("precision") => precision,
            Symbol("limits") => Dict{Symbol, Any}(
                Symbol("deposit") => Dict{Symbol, Any}(
                    Symbol("min") => nothing,
                    Symbol("max") => nothing
                ),
                Symbol("withdraw") => Dict{Symbol, Any}(
                    Symbol("min") => nothing,
                    Symbol("max") => nothing
                )
            )
        );
    end
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("info") => rawCurrency,
    Symbol("id") => id,
    Symbol("code") => code,
    Symbol("name") => safeString(rawCurrency, 1),
    Symbol("active") => nothing,
    Symbol("deposit") => nothing,
    Symbol("withdraw") => nothing,
    Symbol("fee") => nothing,
    Symbol("type") => type_var,
    Symbol("precision") => precision,
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("deposit") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    ),
    Symbol("networks") => networks
))

end
function fetchMarkets(self::Gemini, params=Dict())
    method = safeValue(self.options, "fetchMarketsMethod", "fetch_markets_from_api");
    if functions.ccxtruthy(method == "fetch_markets_from_web")
        promises = [];
                push!(promises, self.fetchMarketsFromWeb(params));
                push!(promises, self.fetchUSDTMarkets(params));
        promisesResult = Base.fetch(asyncmap(Base.fetch, promises));
            return arrayConcat(get(promisesResult, 1, nothing), get(promisesResult, 2, nothing))
    end
    return Base.fetch(self.fetchMarketsFromAPI(params))

end
function fetchMarketsFromWeb(self::Gemini, params=Dict())
    data = Base.fetch(self.fetchWebEndpoint("fetchMarkets", "webGetRestApi", false, "<h1 id=\"symbols-and-minimums\">Symbols and minimums</h1>"));
    error = string(self.id, " fetchMarketsFromWeb() the API doc HTML markup has changed, breaking the parser of order limits and precision info for markets.");
    tables = split(data, "tbody>");
    numTables = length(tables);
    if functions.ccxtruthy(functions.ccxt_lt(numTables, 2))
        throw(NotSupported(error));
    end
    rows = split(get(tables, 2, nothing), "\n<tr>\n");
    numRows = length(rows);
    if functions.ccxtruthy(functions.ccxt_lt(numRows, 2))
        throw(NotSupported(error));
    end
    result = [];
    i = 1
    while functions.ccxtruthy(functions.ccxt_lt(i, numRows))
        row = get(rows, i + 1, nothing);
        cells = split(row, "</td>\n");
        numCells = length(cells);
        if functions.ccxtruthy(functions.ccxt_lt(numCells, 5))
            throw(NotSupported(error));
        end
        marketId = replace(get(cells, 1, nothing), "<td>" => "");
        marketId = replace(marketId, "*" => "");
        minAmountString = replace(get(cells, 2, nothing), "<td>" => "");
        minAmountParts = split(minAmountString, " ");
        minAmount = self.safeNumber(minAmountParts, 0);
        amountPrecisionString = replace(get(cells, 3, nothing), "<td>" => "");
        amountPrecisionParts = split(amountPrecisionString, " ");
        idLength = length(marketId) - 0;
        startingIndex = idLength - 3;
        pricePrecisionString = replace(get(cells, 4, nothing), "<td>" => "");
        pricePrecisionParts = split(pricePrecisionString, " ");
        quoteId = safeStringLower(pricePrecisionParts, 1, marketId[startingIndex + 1:idLength]);
        baseId = safeStringLower(amountPrecisionParts, 1, replace(marketId, quoteId => ""));
        base = self.safeCurrencyCode(baseId);
        quote_var = self.safeCurrencyCode(quoteId);
        push!(result, Dict{Symbol, Any}(
    Symbol("id") => marketId,
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
    Symbol("active") => nothing,
    Symbol("contract") => false,
    Symbol("linear") => nothing,
    Symbol("inverse") => nothing,
    Symbol("contractSize") => nothing,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.safeNumber(amountPrecisionParts, 0),
        Symbol("price") => self.safeNumber(pricePrecisionParts, 0)
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
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
            Symbol("max") => nothing
        )
    ),
    Symbol("created") => nothing,
    Symbol("info") => row
));
        i += 1
    end
    return result

end
function parseMarketActive(self::Gemini, status)
    statuses = Dict{Symbol, Any}(
        Symbol("open") => true,
        Symbol("closed") => false,
        Symbol("cancel_only") => true,
        Symbol("post_only") => true,
        Symbol("limit_only") => true
    );
    if functions.ccxtruthy(status == nothing)
            return true
    end
    return self.safeBool(statuses, status, true)

end
function fetchUSDTMarkets(self::Gemini, params=Dict())
    if functions.ccxtruthy(ccxt_in("test", self.urls))
            return []
    end
    fetchUsdtMarkets = safeValue(self.options, "fetchUsdtMarkets", []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(fetchUsdtMarkets)))
        marketId = get(fetchUsdtMarkets, i + 1, nothing);
        request = Dict{Symbol, Any}(
            Symbol("symbol") => marketId
        );
        rawResponse = Base.fetch(self.publicGetV1SymbolsDetailsSymbol(extend(request, params)));
        push!(result, self.parseMarket(rawResponse));
        i += 1
    end
    return result

end
function fetchMarketsFromAPI(self::Gemini, params=Dict())
    marketIdsRaw = Base.fetch(self.publicGetV1Symbols(params));
    result = [];
    options = self.safeDict(self.options, "fetchMarketsFromAPI", Dict{Symbol, Any}());
    brokenPairs = self.safeList(self.options, "brokenPairs", []);
    marketIds = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(marketIdsRaw)))
        if functions.ccxtruthy(!functions.ccxtruthy(inArray(get(marketIdsRaw, i + 1, nothing), brokenPairs)))
                        push!(marketIds, get(marketIdsRaw, i + 1, nothing));
        end
        i += 1
    end
    if functions.ccxtruthy(self.safeBool(options, "fetchDetailsForAllSymbols", false))
        promises = [];
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(marketIds)))
            marketId = get(marketIds, i + 1, nothing);
            request = Dict{Symbol, Any}(
                Symbol("symbol") => marketId
            );
            push!(promises, self.publicGetV1SymbolsDetailsSymbol(extend(request, params)));
            i += 1
        end

        responses = Base.fetch(asyncmap(Base.fetch, promises));
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(responses)))
            push!(result, self.parseMarket(get(responses, i + 1, nothing)));
            i += 1
        end

    else
        tradingPairs = self.safeList(self.options, "tradingPairs");
        if functions.ccxtruthy(tradingPairs != nothing)
            indexedTradingPairs = indexBy(tradingPairs, 0);
            i = 0
            while functions.ccxtruthy(functions.ccxt_lt(i, length(marketIds)))
                marketId = get(marketIds, i + 1, nothing);
                pairInfo = self.safeList(indexedTradingPairs, uppercase(marketId));
                if functions.ccxtruthy(@functions.ccxt_and(pairInfo != nothing, !functions.ccxtruthy(inArray(marketId, brokenPairs))))
                                        push!(result, self.parseMarket(pairInfo));
                end
                i += 1
            end

        else
            i = 0
            while functions.ccxtruthy(functions.ccxt_lt(i, length(marketIds)))
                if functions.ccxtruthy(!functions.ccxtruthy(inArray(get(marketIds, i + 1, nothing), brokenPairs)))
                                        push!(result, self.parseMarket(get(marketIds, i + 1, nothing)));
                end
                i += 1
            end
        end
    end
    return result

end
function parseMarket(self::Gemini, response)
    marketId = nothing;
    baseId = nothing;
    quoteId = nothing;
    settleId = nothing;
    tickSize = nothing;
    amountPrecision = nothing;
    minSize = nothing;
    status = nothing;
    swap = false;
    contractSize = nothing;
    linear = nothing;
    inverse = nothing;
    isString = (isa(response, AbstractString));
    isArray = (functions.ccxt_isArray(response));
    if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy(isString), !functions.ccxtruthy(isArray)))
        marketId = safeStringLower(response, "symbol");
        amountPrecision = self.safeNumber(response, "tick_size");
        tickSize = self.safeNumber(response, "quote_increment");
        minSize = self.safeNumber(response, "min_order_size");
        status = self.parseMarketActive(safeString(response, "status"));
        baseId = safeString(response, "base_currency");
        quoteId = safeString(response, "quote_currency");
        settleId = safeString(response, "contract_price_currency");
    else
        if functions.ccxtruthy(isString)
            marketId = response;
        else
            marketId = safeStringLower(response, 0);
            tickSize = self.parseNumber(self.parsePrecision(safeString(response, 1)));
            amountPrecision = self.parseNumber(self.parsePrecision(safeString(response, 2)));
            minSize = self.safeNumber(response, 3);
        end
        marketIdUpper = uppercase(marketId);
        isPerp = (findfirst("PERP", marketIdUpper) !== nothing);
        marketIdWithoutPerp = replace(marketIdUpper, "PERP" => "");
        conflictingMarkets = self.safeDict(self.options, "conflictingMarkets", Dict{Symbol, Any}());
        lowerCaseId = lowercase(marketIdWithoutPerp);
        if functions.ccxtruthy(ccxt_in(lowerCaseId, conflictingMarkets))
            conflictingMarket = get(conflictingMarkets, Symbol(lowerCaseId), nothing);
            baseId = get(conflictingMarket, Symbol("base"), nothing);
            quoteId = get(conflictingMarket, Symbol("quote"), nothing);
            if functions.ccxtruthy(isPerp)
                settleId = get(conflictingMarket, Symbol("quote"), nothing);
            end
        else
            quoteCurrencies = self.handleOption("fetchMarketsFromAPI", "quoteCurrencies", []);
            i = 0
            while functions.ccxtruthy(functions.ccxt_lt(i, length(quoteCurrencies)))
                quoteCurrency = get(quoteCurrencies, i + 1, nothing);
                if functions.ccxtruthy(endswith(marketIdWithoutPerp, quoteCurrency))
                    quoteLength = self.parseToInt(-1 * length(quoteCurrency));
                    baseId = marketIdWithoutPerp[0 + 1:quoteLength];
                    quoteId = quoteCurrency;
                    if functions.ccxtruthy(isPerp)
                        settleId = quoteCurrency;
                    end
                    break
                end
                i += 1
            end
        end
    end
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    settle = self.safeCurrencyCode(settleId);
    symbol = string(base, "/", quote_var);
    if functions.ccxtruthy(settleId != nothing)
        symbol = string(symbol, ":", settle);
        swap = true;
        contractSize = tickSize;
        linear = true;
        inverse = false;
    end
    type_var = functions.ccxtruthy(swap) ? "swap" : "spot";
    isSpot = !functions.ccxtruthy(swap);
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
    Symbol("swap") => swap,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => status,
    Symbol("contract") => swap,
    Symbol("linear") => linear,
    Symbol("inverse") => inverse,
    Symbol("contractSize") => contractSize,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("price") => tickSize,
        Symbol("amount") => amountPrecision
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => minSize,
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
    Symbol("info") => response
)

end
function fetchOrderBook(self::Gemini, symbol, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit_bids")] = limit;
        request[Symbol("limit_asks")] = limit;
    end
    response = Base.fetch(self.publicGetV1BookSymbol(extend(request, params)));
    return self.parseOrderBook(response, get(market, Symbol("symbol"), nothing), nothing, "bids", "asks", "price", "amount")

end
function fetchTickerV1(self::Gemini, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetV1PubtickerSymbol(extend(request, params)));
    return self.parseTicker(response, market)

end
function fetchTickerV2(self::Gemini, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetV2TickerSymbol(extend(request, params)));
    return self.parseTicker(response, market)

end
function fetchTickerV1AndV2(self::Gemini, symbol, params=Dict())
    tickerPromiseA = self.fetchTickerV1(symbol, params);
    tickerPromiseB = self.fetchTickerV2(symbol, params);
    (tickerA, tickerB) = (Base.fetch(asyncmap(Base.fetch, [tickerPromiseA, tickerPromiseB])));
    return deepExtend(tickerA, Dict{Symbol, Any}(
    Symbol("open") => get(tickerB, Symbol("open"), nothing),
    Symbol("high") => get(tickerB, Symbol("high"), nothing),
    Symbol("low") => get(tickerB, Symbol("low"), nothing),
    Symbol("change") => get(tickerB, Symbol("change"), nothing),
    Symbol("percentage") => get(tickerB, Symbol("percentage"), nothing),
    Symbol("average") => get(tickerB, Symbol("average"), nothing),
    Symbol("info") => get(tickerB, Symbol("info"), nothing)
))

end
function fetchTicker(self::Gemini, symbol, params=Dict())
    method = safeValue(self.options, "fetchTickerMethod", "fetchTickerV1");
    if functions.ccxtruthy(method == "fetchTickerV1")
            return Base.fetch(self.fetchTickerV1(symbol, params))
    end
    if functions.ccxtruthy(method == "fetchTickerV2")
            return Base.fetch(self.fetchTickerV2(symbol, params))
    end
    return Base.fetch(self.fetchTickerV1AndV2(symbol, params))

end
function parseTicker(self::Gemini, ticker, market=nothing)
    volume = safeValue(ticker, "volume", Dict{Symbol, Any}());
    timestamp = safeInteger(volume, "timestamp");
    symbol = nothing;
    marketId = safeStringLower(ticker, "pair");
    market = self.safeMarket(marketId, market);
    baseId = nothing;
    quoteId = nothing;
    base = nothing;
    quote_var = nothing;
    if functions.ccxtruthy(@functions.ccxt_and((marketId != nothing), (market == nothing)))
        idLength = length(marketId) - 0;
        if functions.ccxtruthy(idLength == 7)
            baseId = marketId[0 + 1:4];
            quoteId = marketId[4 + 1:7];
        else
            baseId = marketId[0 + 1:3];
            quoteId = marketId[3 + 1:6];
        end
        base = self.safeCurrencyCode(baseId);
        quote_var = self.safeCurrencyCode(quoteId);
        symbol = string(base, "/", quote_var);
    end
    if functions.ccxtruthy(@functions.ccxt_and((symbol == nothing), (market != nothing)))
        symbol = get(market, Symbol("symbol"), nothing);
        baseId = safeStringUpper(market, "baseId");
        quoteId = safeStringUpper(market, "quoteId");
    end
    price = safeString(ticker, "price");
    last_var = safeString2(ticker, "last", "close", price);
    percentage = safeString(ticker, "percentChange24h");
    open = safeString(ticker, "open");
    baseVolume = safeString(volume, baseId);
    quoteVolume = safeString(volume, quoteId);
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => safeString(ticker, "high"),
    Symbol("low") => safeString(ticker, "low"),
    Symbol("bid") => safeString(ticker, "bid"),
    Symbol("bidVolume") => nothing,
    Symbol("ask") => safeString(ticker, "ask"),
    Symbol("askVolume") => nothing,
    Symbol("vwap") => nothing,
    Symbol("open") => open,
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => percentage,
    Symbol("average") => nothing,
    Symbol("baseVolume") => baseVolume,
    Symbol("quoteVolume") => quoteVolume,
    Symbol("info") => ticker
), market)

end
function fetchTickers(self::Gemini, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.publicGetV1Pricefeed(params));
    result = self.parseTickers(response, symbols);
    brokenPairs = self.safeList(self.options, "brokenPairs", []);
    return self.removeKeysFromDict(result, brokenPairs)

end
function parseTrade(self::Gemini, trade, market=nothing)
    timestamp = safeInteger(trade, "timestampms");
    id = safeString(trade, "tid");
    orderId = safeString(trade, "order_id");
    feeCurrencyId = safeString(trade, "fee_currency");
    feeCurrencyCode = self.safeCurrencyCode(feeCurrencyId);
    fee = Dict{Symbol, Any}(
        Symbol("cost") => safeString(trade, "fee_amount"),
        Symbol("currency") => feeCurrencyCode
    );
    priceString = safeString(trade, "price");
    amountString = safeString(trade, "amount");
    side = safeStringLower(trade, "type");
    symbol = self.safeSymbol(nothing, market);
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("order") => orderId,
    Symbol("info") => trade,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => symbol,
    Symbol("type") => nothing,
    Symbol("side") => side,
    Symbol("takerOrMaker") => nothing,
    Symbol("price") => priceString,
    Symbol("cost") => nothing,
    Symbol("amount") => amountString,
    Symbol("fee") => fee
), market)

end
function fetchTrades(self::Gemini, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit_trades")] = min(limit, 500);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("timestamp")] = since;
    end
    response = Base.fetch(self.publicGetV1TradesSymbol(extend(request, params)));
    return self.parseTrades(response, market, since, limit)

end
function parseBalance(self::Gemini, response)
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
        account[Symbol("total")] = safeString(balance, "amount");
        result[Symbol(code)] = account;
        i += 1
    end
    return self.safeBalance(result)

end
function fetchTradingFees(self::Gemini, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privatePostV1Notionalvolume(params));
    makerBps = safeString(response, "api_maker_fee_bps");
    takerBps = safeString(response, "api_taker_fee_bps");
    makerString = stringDiv(makerBps, "10000");
    takerString = stringDiv(takerBps, "10000");
    maker = self.parseNumber(makerString);
    taker = self.parseNumber(takerString);
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
function fetchBalance(self::Gemini, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privatePostV1Balances(params));
    return self.parseBalance(response)

end
function parseOrder(self::Gemini, order, market=nothing)
    timestamp = safeInteger(order, "timestampms");
    amount = safeString(order, "original_amount");
    remaining = safeString(order, "remaining_amount");
    filled = safeString(order, "executed_amount");
    status = "closed";
    if functions.ccxtruthy(get(order, Symbol("is_live"), nothing))
        status = "open";
    end
    if functions.ccxtruthy(get(order, Symbol("is_cancelled"), nothing))
        status = "canceled";
    end
    price = safeString(order, "price");
    average = safeString(order, "avg_execution_price");
    type_var = safeString(order, "type");
    if functions.ccxtruthy(type_var == "exchange limit")
        type_var = "limit";
    elseif functions.ccxtruthy(@functions.ccxt_or(type_var == "market buy", type_var == "market sell"))
        type_var = "market";
    else
        type_var = get(order, Symbol("type"), nothing);
    end
    fee = nothing;
    marketId = safeString(order, "symbol");
    symbol = self.safeSymbol(marketId, market);
    id = safeString(order, "order_id");
    side = safeStringLower(order, "side");
    clientOrderId = safeString(order, "client_order_id");
    optionsArray = safeValue(order, "options", []);
    option = safeString(optionsArray, 0);
    timeInForce = "GTC";
    postOnly = false;
    if functions.ccxtruthy(option != nothing)
        if functions.ccxtruthy(option == "immediate-or-cancel")
            timeInForce = "IOC";
        elseif functions.ccxtruthy(option == "fill-or-kill")
            timeInForce = "FOK";
        else
            if functions.ccxtruthy(option == "maker-or-cancel")
                timeInForce = "PO";
                postOnly = true;
            end

        end
    end
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("clientOrderId") => clientOrderId,
    Symbol("info") => order,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("status") => status,
    Symbol("symbol") => symbol,
    Symbol("type") => type_var,
    Symbol("timeInForce") => timeInForce,
    Symbol("postOnly") => postOnly,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("triggerPrice") => nothing,
    Symbol("average") => average,
    Symbol("cost") => nothing,
    Symbol("amount") => amount,
    Symbol("filled") => filled,
    Symbol("remaining") => remaining,
    Symbol("fee") => fee,
    Symbol("trades") => nothing
), market)

end
function fetchOrder(self::Gemini, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("order_id") => id
    );
    response = Base.fetch(self.privatePostV1OrderStatus(extend(request, params)));
    return self.parseOrder(response)

end
function fetchOpenOrders(self::Gemini, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privatePostV1Orders(params));
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    return self.parseOrders(response, market, since, limit)

end
function createOrder(self::Gemini, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(type_var != "limit")
        throw(ExchangeError(string(self.id, " createOrder() allows limit orders only")));
    end
    clientOrderId = safeString2(params, "clientOrderId", "client_order_id");
    params = omit(params, ["clientOrderId", "client_order_id"]);
    if functions.ccxtruthy(clientOrderId == nothing)
        clientOrderId = string(milliseconds());
    end
    market = self.market(symbol);
    amountString = self.amountToPrecision(symbol, amount);
    priceString = self.priceToPrecision(symbol, price);
    request = Dict{Symbol, Any}(
        Symbol("client_order_id") => clientOrderId,
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("amount") => amountString,
        Symbol("price") => priceString,
        Symbol("side") => side,
        Symbol("type") => "exchange limit"
    );
    type_var = safeString(params, "type", type_var);
    params = omit(params, "type");
    triggerPrice = safeStringN(params, ["triggerPrice", "stop_price", "stopPrice"]);
    params = omit(params, ["triggerPrice", "stop_price", "stopPrice", "type"]);
    if functions.ccxtruthy(type_var == "stopLimit")
        throw(ArgumentsRequired(string(self.id, " createOrder() requires a triggerPrice parameter or a stop_price parameter for ", type_var, " orders")));
    end
    if functions.ccxtruthy(triggerPrice != nothing)
        request[Symbol("stop_price")] = self.priceToPrecision(symbol, triggerPrice);
        request[Symbol("type")] = "exchange stop limit";
    else
        timeInForce = safeString(params, "timeInForce");
        params = omit(params, "timeInForce");
        if functions.ccxtruthy(timeInForce != nothing)
            if functions.ccxtruthy(@functions.ccxt_or((timeInForce == "IOC"), (timeInForce == "immediate-or-cancel")))
                request[Symbol("options")] = ["immediate-or-cancel"];
            elseif functions.ccxtruthy(@functions.ccxt_or((timeInForce == "FOK"), (timeInForce == "fill-or-kill")))
                request[Symbol("options")] = ["fill-or-kill"];
            else
                if functions.ccxtruthy(timeInForce == "PO")
                    request[Symbol("options")] = ["maker-or-cancel"];
                end

            end
        end
        postOnly = self.safeBool(params, "postOnly", false);
        params = omit(params, "postOnly");
        if functions.ccxtruthy(postOnly)
            request[Symbol("options")] = ["maker-or-cancel"];
        end
        options = safeString(params, "options");
        if functions.ccxtruthy(options != nothing)
            request[Symbol("options")] = [options];
        end
    end
    response = Base.fetch(self.privatePostV1OrderNew(extend(request, params)));
    return self.parseOrder(response)

end
function cancelOrder(self::Gemini, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("order_id") => id
    );
    response = Base.fetch(self.privatePostV1OrderCancel(extend(request, params)));
    return self.parseOrder(response)

end
function fetchMyTrades(self::Gemini, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchMyTrades() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit_trades")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("timestamp")] = self.parseToInt(since / 1000);
    end
    response = Base.fetch(self.privatePostV1Mytrades(extend(request, params)));
    return self.parseTrades(response, market, since, limit)

end
function withdraw(self::Gemini, code, amount, address, tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    self.checkAddress(address);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => amount,
        Symbol("address") => address
    );
    response = Base.fetch(self.privatePostV1WithdrawCurrency(extend(request, params)));
    result = safeString(response, "result");
    if functions.ccxtruthy(result == "error")
        throw(ExchangeError(string(self.id, " withdraw() failed: ", json(response))));
    end
    return self.parseTransaction(response, currency)

end
function nonce(self::Gemini, )
    nonceMethod = safeString(self.options, "nonce", "milliseconds");
    if functions.ccxtruthy(nonceMethod == "milliseconds")
            return milliseconds()
    end
    return seconds()

end
function fetchDepositsWithdrawals(self::Gemini, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit_transfers")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("timestamp")] = since;
    end
    response = Base.fetch(self.privatePostV1Transfers(extend(request, params)));
    return self.parseTransactions(response)

end
function parseTransaction(self::Gemini, transaction, currency=nothing)
    timestamp = safeInteger(transaction, "timestampms");
    currencyId = safeString(transaction, "currency");
    code = self.safeCurrencyCode(currencyId, currency);
    address = safeString(transaction, "destination");
    type_var = safeStringLower(transaction, "type");
    statusRaw = safeString(transaction, "status");
    fee = nothing;
    feeAmount = self.safeNumber(transaction, "feeAmount");
    if functions.ccxtruthy(feeAmount != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeAmount,
            Symbol("currency") => code
        );
    end
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => safeString2(transaction, "eid", "withdrawalId"),
    Symbol("txid") => safeString(transaction, "txHash"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("network") => nothing,
    Symbol("address") => address,
    Symbol("addressTo") => nothing,
    Symbol("addressFrom") => nothing,
    Symbol("tag") => nothing,
    Symbol("tagTo") => nothing,
    Symbol("tagFrom") => nothing,
    Symbol("type") => type_var,
    Symbol("amount") => self.safeNumber(transaction, "amount"),
    Symbol("currency") => code,
    Symbol("status") => self.parseTransactionStatus(statusRaw),
    Symbol("updated") => nothing,
    Symbol("internal") => nothing,
    Symbol("comment") => safeString(transaction, "message"),
    Symbol("fee") => fee
)

end
function parseTransactionStatus(self::Gemini, status)
    statuses = Dict{Symbol, Any}(
        Symbol("Advanced") => "ok",
        Symbol("Complete") => "ok"
    );
    return safeString(statuses, status, status)

end
function parseDepositAddress(self::Gemini, depositAddress, currency=nothing)
    address = safeString(depositAddress, "address");
    code = self.safeCurrencyCode(nothing, currency);
    return Dict{Symbol, Any}(
    Symbol("currency") => code,
    Symbol("network") => nothing,
    Symbol("address") => address,
    Symbol("tag") => nothing,
    Symbol("info") => depositAddress
)

end
function fetchDepositAddress(self::Gemini, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    groupedByNetwork = Base.fetch(self.fetchDepositAddressesByNetwork(code, params));
    networkCode = nothing;
    (networkCode, params) = self.handleNetworkCodeAndParams(params);
    networkGroup = indexBy(safeValue(groupedByNetwork, networkCode), "currency");
    return safeValue(networkGroup, code)

end
function fetchDepositAddressesByNetwork(self::Gemini, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    code = get(currency, Symbol("code"), nothing);
    networkCode = nothing;
    (networkCode, params) = self.handleNetworkCodeAndParams(params);
    if functions.ccxtruthy(networkCode == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchDepositAddresses() requires a network parameter")));
    end
    networkId = self.networkCodeToId(networkCode, get(currency, Symbol("code"), nothing));
    request = Dict{Symbol, Any}(
        Symbol("network") => networkId
    );
    response = Base.fetch(self.privatePostV1AddressesNetwork(extend(request, params)));
    results = self.parseDepositAddresses(response, [code], false, Dict{Symbol, Any}(
        Symbol("network") => networkCode,
        Symbol("currency") => code
    ));
    return groupBy(results, "network")

end
function sign(self::Gemini, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    url = string("/", self.implodeParams(path, params));
    query = omit(params, self.extractParams(path));
    if functions.ccxtruthy(api == "private")
        self.checkRequiredCredentials();
        apiKey = self.apiKey;
        if functions.ccxtruthy(findfirst("account", apiKey) === nothing)
            throw(AuthenticationError(string(self.id, " sign() requires an account-key, master-keys are not-supported")));
        end
        nonce = string(self.nonce());
        finalUrl = url;
        request = extend(Dict{Symbol, Any}(
            Symbol("request") => finalUrl,
            Symbol("nonce") => nonce
        ), query);
        payload = json(request);
        payload = self.stringToBase64(payload);
        signature = self.hmac(self.encode(payload), self.encode(self.secret), sha384);
        headers = Dict{Symbol, Any}(
            Symbol("Content-Type") => "text/plain",
            Symbol("X-GEMINI-APIKEY") => self.apiKey,
            Symbol("X-GEMINI-PAYLOAD") => payload,
            Symbol("X-GEMINI-SIGNATURE") => signature
        );
    else
        if functions.ccxtruthy(length(objectKeys(query)))
            url += string("?", self.urlencode(query));
        end
    end
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing), url);
    if functions.ccxtruthy(@functions.ccxt_or((method == "POST"), (method == "DELETE")))
        body = json(query);
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Gemini, httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
        if functions.ccxtruthy(isa(body, AbstractString))
            feedback = string(self.id, " ", body);
            self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), body, feedback);
        end
            return nothing
    end
    result = safeString(response, "result");
    if functions.ccxtruthy(result == "error")
        reasonInner = safeString(response, "reason");
        message = safeString(response, "message");
        feedback = string(self.id, " ", message);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), reasonInner, feedback);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), message, feedback);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), message, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end
function createDepositAddress(self::Gemini, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privatePostV1DepositCurrencyNewAddress(extend(request, params)));
    address = safeString(response, "address");
    self.checkAddress(address);
    return Dict{Symbol, Any}(
    Symbol("currency") => code,
    Symbol("address") => address,
    Symbol("tag") => nothing,
    Symbol("network") => nothing,
    Symbol("info") => response
)

end
function fetchOHLCV(self::Gemini, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    timeframeId = safeString(self.timeframes, timeframe, timeframe);
    request = Dict{Symbol, Any}(
        Symbol("timeframe") => timeframeId,
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetV2CandlesSymbolTimeframe(extend(request, params)));
    return self.parseOHLCVs(response, market, timeframe, since, limit)

end
function fetchOpenInterest(self::Gemini, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetV1RiskstatsSymbol(extend(request, params)));
    return self.parseOpenInterest(response, market)

end
function parseOpenInterest(self::Gemini, interest, market=nothing)
    return self.safeOpenInterest(Dict{Symbol, Any}(
    Symbol("info") => interest,
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("openInterestAmount") => safeString(interest, "open_interest"),
    Symbol("openInterestValue") => safeString(interest, "open_interest_notional"),
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing
), market)

end

# Property resolution is shared by every generated exchange; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Gemini, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function webExchangeGet(self::Gemini, params=Dict(), context=Dict())
    return request(self, "", "webExchange", "GET", params, nothing, nothing, Dict())
end

function webGetRestApi(self::Gemini, params=Dict(), context=Dict())
    return request(self, "rest-api", "web", "GET", params, nothing, nothing, Dict())
end

function publicGetV1Symbols(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/symbols", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV1SymbolsDetailsSymbol(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/symbols/details/{symbol}", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV1NetworkToken(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/network/{token}", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV1StakingRates(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/staking/rates", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV1PubtickerSymbol(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/pubticker/{symbol}", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV1Feepromos(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/feepromos", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV2TickerSymbol(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v2/ticker/{symbol}", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV2CandlesSymbolTimeframe(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v2/candles/{symbol}/{timeframe}", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV1TradesSymbol(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/trades/{symbol}", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV1AuctionSymbol(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/auction/{symbol}", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV1AuctionSymbolHistory(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/auction/{symbol}/history", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV1Pricefeed(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/pricefeed", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV1FundingamountSymbol(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/fundingamount/{symbol}", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV1FundingamountreportRecordsXlsx(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/fundingamountreport/records.xlsx", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV1BookSymbol(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/book/{symbol}", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV1EarnRates(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/earn/rates", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV2DerivativesCandlesSymbolTimeFrame(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v2/derivatives/candles/{symbol}/{time_frame}", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV2FxrateSymbolTimestamp(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v2/fxrate/{symbol}/{timestamp}", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV1RiskstatsSymbol(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/riskstats/{symbol}", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV1PerpetualsFundingpaymentreportRecordsXlsx(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/perpetuals/fundingpaymentreport/records.xlsx", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1StakingUnstake(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/staking/unstake", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1StakingStake(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/staking/stake", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1StakingRewards(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/staking/rewards", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1StakingHistory(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/staking/history", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1OrderNew(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/order/new", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1OrderCancel(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/order/cancel", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1WrapSymbol(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/wrap/{symbol}", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1OrderCancelSession(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/order/cancel/session", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1OrderCancelAll(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/order/cancel/all", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1OrderStatus(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/order/status", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1Orders(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/orders", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1Mytrades(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/mytrades", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1Notionalvolume(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/notionalvolume", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1Tradevolume(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/tradevolume", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1ClearingNew(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/clearing/new", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1ClearingStatus(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/clearing/status", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1ClearingCancel(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/clearing/cancel", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1ClearingConfirm(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/clearing/confirm", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1Balances(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/balances", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1BalancesStaking(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/balances/staking", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1NotionalbalancesCurrency(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/notionalbalances/{currency}", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1Transfers(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/transfers", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1AddressesNetwork(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/addresses/{network}", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1DepositNetworkNewAddress(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/deposit/{network}/newAddress", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1DepositCurrencyNewAddress(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/deposit/{currency}/newAddress", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1WithdrawCurrency(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/withdraw/{currency}", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1AccountTransferCurrency(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/account/transfer/{currency}", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1PaymentsAddbank(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/payments/addbank", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1PaymentsMethods(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/payments/methods", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1PaymentsSenWithdraw(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/payments/sen/withdraw", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1BalancesEarn(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/balances/earn", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1EarnInterest(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/earn/interest", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1EarnHistory(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/earn/history", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1ApprovedAddressesNetworkRequest(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/approvedAddresses/{network}/request", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1ApprovedAddressesAccountNetwork(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/approvedAddresses/account/{network}", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1ApprovedAddressesNetworkRemove(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/approvedAddresses/{network}/remove", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1Account(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/account", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1AccountCreate(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/account/create", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1AccountList(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/account/list", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1Heartbeat(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/heartbeat", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1Roles(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/roles", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1Custodyaccountfees(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/custodyaccountfees", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1WithdrawCurrencyCodeLowerCaseFeeEstimate(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/withdraw/{currencyCodeLowerCase}/feeEstimate", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1PaymentsAddbankCad(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/payments/addbank/cad", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1Transactions(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/transactions", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1MarginAccount(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/margin/account", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1MarginRates(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/margin/rates", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1MarginOrderPreview(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/margin/order/preview", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1ClearingList(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/clearing/list", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1ClearingBrokerList(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/clearing/broker/list", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1ClearingBrokerNew(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/clearing/broker/new", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1ClearingTrades(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/clearing/trades", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1InstantQuote(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/instant/quote", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1InstantExecute(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/instant/execute", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1AccountRename(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/account/rename", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1OauthRevokeByToken(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/oauth/revokeByToken", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1Margin(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/margin", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1PerpetualsFundingPayment(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/perpetuals/fundingPayment", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1PerpetualsFundingpaymentreportRecordsJson(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/perpetuals/fundingpaymentreport/records.json", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1Positions(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/positions", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function Gemini(; kwargs...)
    inst = Gemini(Exchange(), describe, fetchCurrencies, fetchCurrenciesFromWeb, parseCurrency, fetchMarkets, fetchMarketsFromWeb, parseMarketActive, fetchUSDTMarkets, fetchMarketsFromAPI, parseMarket, fetchOrderBook, fetchTickerV1, fetchTickerV2, fetchTickerV1AndV2, fetchTicker, parseTicker, fetchTickers, parseTrade, fetchTrades, parseBalance, fetchTradingFees, fetchBalance, parseOrder, fetchOrder, fetchOpenOrders, createOrder, cancelOrder, fetchMyTrades, withdraw, nonce, fetchDepositsWithdrawals, parseTransaction, parseTransactionStatus, parseDepositAddress, fetchDepositAddress, fetchDepositAddressesByNetwork, sign, handleErrors, createDepositAddress, fetchOHLCV, fetchOpenInterest, parseOpenInterest, webExchangeGet, webGetRestApi, publicGetV1Symbols, publicGetV1SymbolsDetailsSymbol, publicGetV1NetworkToken, publicGetV1StakingRates, publicGetV1PubtickerSymbol, publicGetV1Feepromos, publicGetV2TickerSymbol, publicGetV2CandlesSymbolTimeframe, publicGetV1TradesSymbol, publicGetV1AuctionSymbol, publicGetV1AuctionSymbolHistory, publicGetV1Pricefeed, publicGetV1FundingamountSymbol, publicGetV1FundingamountreportRecordsXlsx, publicGetV1BookSymbol, publicGetV1EarnRates, publicGetV2DerivativesCandlesSymbolTimeFrame, publicGetV2FxrateSymbolTimestamp, publicGetV1RiskstatsSymbol, privateGetV1PerpetualsFundingpaymentreportRecordsXlsx, privatePostV1StakingUnstake, privatePostV1StakingStake, privatePostV1StakingRewards, privatePostV1StakingHistory, privatePostV1OrderNew, privatePostV1OrderCancel, privatePostV1WrapSymbol, privatePostV1OrderCancelSession, privatePostV1OrderCancelAll, privatePostV1OrderStatus, privatePostV1Orders, privatePostV1Mytrades, privatePostV1Notionalvolume, privatePostV1Tradevolume, privatePostV1ClearingNew, privatePostV1ClearingStatus, privatePostV1ClearingCancel, privatePostV1ClearingConfirm, privatePostV1Balances, privatePostV1BalancesStaking, privatePostV1NotionalbalancesCurrency, privatePostV1Transfers, privatePostV1AddressesNetwork, privatePostV1DepositNetworkNewAddress, privatePostV1DepositCurrencyNewAddress, privatePostV1WithdrawCurrency, privatePostV1AccountTransferCurrency, privatePostV1PaymentsAddbank, privatePostV1PaymentsMethods, privatePostV1PaymentsSenWithdraw, privatePostV1BalancesEarn, privatePostV1EarnInterest, privatePostV1EarnHistory, privatePostV1ApprovedAddressesNetworkRequest, privatePostV1ApprovedAddressesAccountNetwork, privatePostV1ApprovedAddressesNetworkRemove, privatePostV1Account, privatePostV1AccountCreate, privatePostV1AccountList, privatePostV1Heartbeat, privatePostV1Roles, privatePostV1Custodyaccountfees, privatePostV1WithdrawCurrencyCodeLowerCaseFeeEstimate, privatePostV1PaymentsAddbankCad, privatePostV1Transactions, privatePostV1MarginAccount, privatePostV1MarginRates, privatePostV1MarginOrderPreview, privatePostV1ClearingList, privatePostV1ClearingBrokerList, privatePostV1ClearingBrokerNew, privatePostV1ClearingTrades, privatePostV1InstantQuote, privatePostV1InstantExecute, privatePostV1AccountRename, privatePostV1OauthRevokeByToken, privatePostV1Margin, privatePostV1PerpetualsFundingPayment, privatePostV1PerpetualsFundingpaymentreportRecordsJson, privatePostV1Positions)
    desc = inst.describe()
    for (k, v) in desc
        inst[Symbol(k)] = v
    end
    return inst
end
