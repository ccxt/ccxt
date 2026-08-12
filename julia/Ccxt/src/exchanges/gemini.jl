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
        Symbol("fetchOpenInterest") => true,
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
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("web") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("rest-api") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("v1/symbols") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v1/symbols/details/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v1/network/{token}") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v1/staking/rates") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v1/pubticker/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v1/feepromos") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v2/ticker/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v2/candles/{symbol}/{timeframe}") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v1/trades/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v1/auction/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v1/auction/{symbol}/history") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v1/pricefeed") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v1/fundingamount/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v1/fundingamountreport/records.xlsx") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v1/book/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v1/earn/rates") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v2/derivatives/candles/{symbol}/{time_frame}") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v2/fxrate/{symbol}/{timestamp}") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v1/riskstats/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 5
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("v1/perpetuals/fundingpaymentreport/records.xlsx") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("v1/staking/unstake") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/staking/stake") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/staking/rewards") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/staking/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/order/new") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/order/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/wrap/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/order/cancel/session") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/order/cancel/all") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/order/status") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/mytrades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/notionalvolume") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/tradevolume") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/clearing/new") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/clearing/status") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/clearing/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/clearing/confirm") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/balances") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/balances/staking") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/notionalbalances/{currency}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/transfers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/addresses/{network}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/deposit/{network}/newAddress") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/deposit/{currency}/newAddress") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/withdraw/{currency}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/account/transfer/{currency}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/payments/addbank") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/payments/methods") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/payments/sen/withdraw") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/balances/earn") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/earn/interest") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/earn/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/approvedAddresses/{network}/request") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/approvedAddresses/account/{network}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/approvedAddresses/{network}/remove") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/account") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/account/create") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/account/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/heartbeat") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/roles") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/custodyaccountfees") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/withdraw/{currencyCodeLowerCase}/feeEstimate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/payments/addbank/cad") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/transactions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/margin/account") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/margin/rates") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/margin/order/preview") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/clearing/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/clearing/broker/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/clearing/broker/new") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/clearing/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/instant/quote") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/instant/execute") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/account/rename") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/oauth/revokeByToken") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/margin") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/perpetuals/fundingPayment") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/perpetuals/fundingpaymentreport/records.json") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/positions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
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
"""
fetches all available currencies on an exchange

# Arguments
- `params`::object, optional: extra parameters specific to the endpoint

# Returns
- an associative dictionary of currencies
"""
function fetchCurrencies(self::Gemini; params=Dict())
    return Base.fetch(self.fetchCurrenciesFromWeb(params = params))

end
"""
fetches all available currencies on an exchange

# Arguments
- `params`::object, optional: extra parameters specific to the endpoint

# Returns
- an associative dictionary of currencies
"""
function fetchCurrenciesFromWeb(self::Gemini; params=Dict())
    data = Base.fetch(self.fetchWebEndpoint("fetchCurrencies", "webExchangeGet", true, startRegex = "=\"currencyData\">", endRegex = "</script>"));
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
    precision = self.parseNumber(self.parsePrecision(precision = safeString(rawCurrency, 5)));
    networks = Dict{Symbol, Any}();
    networkId = safeString(rawCurrency, 9);
    networkCode = nothing;
    if functions.ccxtruthy(networkId != nothing)
        networkCode = self.networkIdToCode(networkId = networkId, currencyCode = code);
        if functions.ccxtruthy(networkCode != nothing)
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
"""
retrieves data on all markets for gemini
see: https://docs.gemini.com/rest-api/#symbols

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Gemini; params=Dict())
    method = safeValue(self.options, "fetchMarketsMethod", "fetch_markets_from_api");
    if functions.ccxtruthy(method == "fetch_markets_from_web")
        promises = [];
                push!(promises, self.fetchMarketsFromWeb(params = params));
                push!(promises, self.fetchUSDTMarkets(params = params));
        promisesResult = Base.fetch(asyncmap(Base.fetch, promises));
            return arrayConcat(get(promisesResult, 1, nothing), get(promisesResult, 2, nothing))
    end
    return Base.fetch(self.fetchMarketsFromAPI(params = params))

end
function fetchMarketsFromWeb(self::Gemini; params=Dict())
    data = Base.fetch(self.fetchWebEndpoint("fetchMarkets", "webGetRestApi", false, startRegex = "<h1 id=\"symbols-and-minimums\">Symbols and minimums</h1>"));
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
        quoteId = safeStringLower(pricePrecisionParts, 1, functions.ccxt_slice(marketId, startingIndex, idLength));
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
    return self.safeBool(statuses, status, defaultValue = true)

end
function fetchUSDTMarkets(self::Gemini; params=Dict())
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
function fetchMarketsFromAPI(self::Gemini; params=Dict())
    marketIdsRaw = Base.fetch(self.publicGetV1Symbols(params));
    result = [];
    options = self.safeDict(self.options, "fetchMarketsFromAPI", defaultValue = Dict{Symbol, Any}());
    brokenPairs = self.safeList(self.options, "brokenPairs", defaultValue = []);
    marketIds = [];
    allMarketIds = [];
    if functions.ccxtruthy(functions.ccxt_isArray(marketIdsRaw))
        allMarketIds = marketIdsRaw;
    end
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(allMarketIds)))
        if functions.ccxtruthy(!functions.ccxtruthy(inArray(get(allMarketIds, i + 1, nothing), brokenPairs)))
                        push!(marketIds, get(allMarketIds, i + 1, nothing));
        end
        i += 1
    end
    if functions.ccxtruthy(self.safeBool(options, "fetchDetailsForAllSymbols", defaultValue = false))
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
            tickSize = self.parseNumber(self.parsePrecision(precision = safeString(response, 1)));
            amountPrecision = self.parseNumber(self.parsePrecision(precision = safeString(response, 2)));
            minSize = self.safeNumber(response, 3);
        end
        marketIdUpper = uppercase(marketId);
        isPerp = (findfirst("PERP", marketIdUpper) !== nothing);
        marketIdWithoutPerp = replace(marketIdUpper, "PERP" => "");
        conflictingMarkets = self.safeDict(self.options, "conflictingMarkets", defaultValue = Dict{Symbol, Any}());
        lowerCaseId = lowercase(marketIdWithoutPerp);
        if functions.ccxtruthy(ccxt_in(lowerCaseId, conflictingMarkets))
            conflictingMarket = get(conflictingMarkets, Symbol(lowerCaseId), nothing);
            baseId = get(conflictingMarket, Symbol("base"), nothing);
            quoteId = get(conflictingMarket, Symbol("quote"), nothing);
            if functions.ccxtruthy(isPerp)
                settleId = get(conflictingMarket, Symbol("quote"), nothing);
            end
        else
            quoteCurrencies = self.handleOption("fetchMarketsFromAPI", "quoteCurrencies", defaultValue = []);
            i = 0
            while functions.ccxtruthy(functions.ccxt_lt(i, length(quoteCurrencies)))
                quoteCurrency = get(quoteCurrencies, i + 1, nothing);
                if functions.ccxtruthy(endswith(marketIdWithoutPerp, quoteCurrency))
                    quoteLength = self.parseToInt(-1 * length(quoteCurrency));
                    baseId = functions.ccxt_slice(marketIdWithoutPerp, 0, quoteLength);
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
))

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://docs.gemini.com/rest-api/#current-order-book

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Gemini, symbol; limit=nothing, params=Dict())
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
    return self.parseOrderBook(response, get(market, Symbol("symbol"), nothing), timestamp = nothing, bidsKey = "bids", asksKey = "asks", priceKey = "price", amountKey = "amount")

end
function fetchTickerV1(self::Gemini, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetV1PubtickerSymbol(extend(request, params)));
    return self.parseTicker(response, market = market)

end
function fetchTickerV2(self::Gemini, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetV2TickerSymbol(extend(request, params)));
    return self.parseTicker(response, market = market)

end
function fetchTickerV1AndV2(self::Gemini, symbol; params=Dict())
    tickerPromiseA = self.fetchTickerV1(symbol, params = params);
    tickerPromiseB = self.fetchTickerV2(symbol, params = params);
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
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://docs.gemini.com/rest-api/#ticker
see: https://docs.gemini.com/rest-api/#ticker-v2

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.fetchTickerMethod`::object, optional: 'fetchTickerV2', 'fetchTickerV1' or 'fetchTickerV1AndV2' - 'fetchTickerV1' for original ccxt.gemini.fetchTicker - 'fetchTickerV1AndV2' for 2 api calls to get the result of both fetchTicker methods - default = 'fetchTickerV1'

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTicker(self::Gemini, symbol; params=Dict())
    method = safeValue(self.options, "fetchTickerMethod", "fetchTickerV1");
    if functions.ccxtruthy(method == "fetchTickerV1")
            return Base.fetch(self.fetchTickerV1(symbol, params = params))
    end
    if functions.ccxtruthy(method == "fetchTickerV2")
            return Base.fetch(self.fetchTickerV2(symbol, params = params))
    end
    return Base.fetch(self.fetchTickerV1AndV2(symbol, params = params))

end
function parseTicker(self::Gemini, ticker; market=nothing)
    volume = safeValue(ticker, "volume", Dict{Symbol, Any}());
    timestamp = safeInteger(volume, "timestamp");
    symbol = nothing;
    marketId = safeStringLower(ticker, "pair");
    market = self.safeMarket(marketId = marketId, market = market);
    baseId = nothing;
    quoteId = nothing;
    base = nothing;
    quote_var = nothing;
    if functions.ccxtruthy(@functions.ccxt_and((marketId != nothing), (market == nothing)))
        idLength = length(marketId) - 0;
        if functions.ccxtruthy(idLength == 7)
            baseId = functions.ccxt_slice(marketId, 0, 4);
            quoteId = functions.ccxt_slice(marketId, 4, 7);
        else
            baseId = functions.ccxt_slice(marketId, 0, 3);
            quoteId = functions.ccxt_slice(marketId, 3, 6);
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
), market = market)

end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://docs.gemini.com/rest-api/#price-feed

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTickers(self::Gemini; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.publicGetV1Pricefeed(params));
    result = self.parseTickers(response, symbols = symbols);
    brokenPairs = self.safeList(self.options, "brokenPairs", defaultValue = []);
    return self.removeKeysFromDict(result, brokenPairs)

end
function parseTrade(self::Gemini, trade; market=nothing)
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
    symbol = self.safeSymbol(nothing, market = market);
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
), market = market)

end
"""
get the list of most recent trades for a particular symbol
see: https://docs.gemini.com/rest-api/#trade-history

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
function fetchTrades(self::Gemini, symbol; since=nothing, limit=nothing, params=Dict())
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
    return self.parseTrades(response, market = market, since = since, limit = limit)

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
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
"""
fetch the trading fees for multiple markets
see: https://docs.gemini.com/rest-api/#get-notional-volume

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
"""
function fetchTradingFees(self::Gemini; params=Dict())
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
    symbols = self.symbols;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(symbols)))
        symbol = get(symbols, i + 1, nothing);
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
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://docs.gemini.com/rest-api/#get-available-balances

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Gemini; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privatePostV1Balances(params));
    return self.parseBalance(response)

end
function parseOrder(self::Gemini, order; market=nothing)
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
    symbol = self.safeSymbol(marketId, market = market);
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
), market = market)

end
"""
fetches information on an order made by the user
see: https://docs.gemini.com/rest-api/#order-status

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrder(self::Gemini, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("order_id") => id
    );
    response = Base.fetch(self.privatePostV1OrderStatus(extend(request, params)));
    return self.parseOrder(response)

end
"""
fetch all unfilled currently open orders
see: https://docs.gemini.com/rest-api/#get-active-orders

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of  open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Gemini; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privatePostV1Orders(params));
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    return self.parseOrders(response, market = market, since = since, limit = limit)

end
"""
create a trade order
see: https://docs.gemini.com/rest-api/#new-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: must be 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrder(self::Gemini, symbol, type_var, side, amount; price=nothing, params=Dict())
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
        postOnly = self.safeBool(params, "postOnly", defaultValue = false);
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
"""
cancels an open order
see: https://docs.gemini.com/rest-api/#cancel-order

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::Gemini, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("order_id") => id
    );
    response = Base.fetch(self.privatePostV1OrderCancel(extend(request, params)));
    return self.parseOrder(response)

end
"""
fetch all trades made by the user
see: https://docs.gemini.com/rest-api/#get-past-trades

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchMyTrades(self::Gemini; symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
    return self.parseTrades(response, market = market, since = since, limit = limit)

end
"""
make a withdrawal
see: https://docs.gemini.com/rest-api/#withdraw-crypto-funds

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function withdraw(self::Gemini, code, amount, address; tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    self.checkAddress(address = address);
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
    return self.parseTransaction(response, currency = currency)

end
function nonce(self::Gemini, )
    nonceMethod = safeString(self.options, "nonce", "milliseconds");
    if functions.ccxtruthy(nonceMethod == "milliseconds")
            return milliseconds()
    end
    return seconds()

end
"""
fetch history of deposits and withdrawals
see: https://docs.gemini.com/rest-api/#transfers

# Arguments
- `code`::string, optional: unified currency code for the currency of the deposit/withdrawals, default is undefined
- `since`::int, optional: timestamp in ms of the earliest deposit/withdrawal, default is undefined
- `limit`::int, optional: max number of deposit/withdrawals to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDepositsWithdrawals(self::Gemini; code=nothing, since=nothing, limit=nothing, params=Dict())
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
function parseTransaction(self::Gemini, transaction; currency=nothing)
    timestamp = safeInteger(transaction, "timestampms");
    currencyId = safeString(transaction, "currency");
    code = self.safeCurrencyCode(currencyId, currency = currency);
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
function parseDepositAddress(self::Gemini, depositAddress; currency=nothing)
    address = safeString(depositAddress, "address");
    code = self.safeCurrencyCode(nothing, currency = currency);
    return Dict{Symbol, Any}(
    Symbol("currency") => code,
    Symbol("network") => nothing,
    Symbol("address") => address,
    Symbol("tag") => nothing,
    Symbol("info") => depositAddress
)

end
"""
fetch the deposit address for a currency associated with this account
see: https://docs.gemini.com/rest-api/#get-deposit-addresses

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the endpoint
- `params.network`::string, optional: *required* The chain of currency

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
function fetchDepositAddress(self::Gemini, code; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    groupedByNetwork = Base.fetch(self.fetchDepositAddressesByNetwork(code, params = params));
    networkCode = nothing;
    (networkCode, params) = self.handleNetworkCodeAndParams(params);
    networkGroup = indexBy(safeValue(groupedByNetwork, networkCode), "currency");
    return safeValue(networkGroup, code)

end
"""
fetch a dictionary of addresses for a currency, indexed by network
see: https://docs.gemini.com/rest-api/#get-deposit-addresses

# Arguments
- `code`::string: unified currency code of the currency for the deposit address
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.network`::string, optional: *required* The chain of currency

# Returns
- a dictionary of [address structures]{@link https://docs.ccxt.com/?id=address-structure} indexed by the network
"""
function fetchDepositAddressesByNetwork(self::Gemini, code; params=Dict())
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
    networkId = self.networkCodeToId(networkCode, currencyCode = get(currency, Symbol("code"), nothing));
    request = Dict{Symbol, Any}(
        Symbol("network") => networkId
    );
    response = Base.fetch(self.privatePostV1AddressesNetwork(extend(request, params)));
    results = self.parseDepositAddresses(response, codes = [code], indexed = false, params = Dict{Symbol, Any}(
        Symbol("network") => networkCode,
        Symbol("currency") => code
    ));
    return groupBy(results, "network")

end
function sign(self::Gemini, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
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
"""
create a currency deposit address
see: https://docs.gemini.com/rest-api/#new-deposit-address

# Arguments
- `code`::string: unified currency code of the currency for the deposit address
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
function createDepositAddress(self::Gemini, code; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privatePostV1DepositCurrencyNewAddress(extend(request, params)));
    address = safeString(response, "address");
    self.checkAddress(address = address);
    return Dict{Symbol, Any}(
    Symbol("currency") => code,
    Symbol("address") => address,
    Symbol("tag") => nothing,
    Symbol("network") => nothing,
    Symbol("info") => response
)

end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://docs.gemini.com/rest-api/#candles

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchOHLCV(self::Gemini, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
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
    candles = [];
    if functions.ccxtruthy(functions.ccxt_isArray(response))
        candles = response;
    end
    return self.parseOHLCVs(candles, market = market, timeframe = timeframe, since = since, limit = limit)

end
"""
retrieves the open interest of a contract trading pair
see: https://docs.gemini.com/rest/derivatives#get-risk-stats

# Arguments
- `symbol`::string: unified CCXT market symbol
- `params`::object, optional: exchange specific parameters

# Returns
- an open interest structure{@link https://docs.ccxt.com/?id=open-interest-structure}
"""
function fetchOpenInterest(self::Gemini, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetV1RiskstatsSymbol(extend(request, params)));
    return self.parseOpenInterest(response, market = market)

end
function parseOpenInterest(self::Gemini, interest; market=nothing)
    return self.safeOpenInterest(Dict{Symbol, Any}(
    Symbol("info") => interest,
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("openInterestAmount") => safeString(interest, "open_interest"),
    Symbol("openInterestValue") => safeString(interest, "open_interest_notional"),
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing
), market = market)

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Gemini, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function webExchangeGet(self::Gemini, params=Dict(), context=Dict())
    return request(self, ""; api="webExchange", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function webGetRestApi(self::Gemini, params=Dict(), context=Dict())
    return request(self, "rest-api"; api="web", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV1Symbols(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/symbols"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV1SymbolsDetailsSymbol(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/symbols/details/{symbol}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV1NetworkToken(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/network/{token}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV1StakingRates(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/staking/rates"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV1PubtickerSymbol(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/pubticker/{symbol}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV1Feepromos(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/feepromos"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV2TickerSymbol(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v2/ticker/{symbol}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV2CandlesSymbolTimeframe(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v2/candles/{symbol}/{timeframe}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV1TradesSymbol(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/trades/{symbol}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV1AuctionSymbol(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/auction/{symbol}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV1AuctionSymbolHistory(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/auction/{symbol}/history"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV1Pricefeed(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/pricefeed"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV1FundingamountSymbol(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/fundingamount/{symbol}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV1FundingamountreportRecordsXlsx(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/fundingamountreport/records.xlsx"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV1BookSymbol(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/book/{symbol}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV1EarnRates(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/earn/rates"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV2DerivativesCandlesSymbolTimeFrame(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v2/derivatives/candles/{symbol}/{time_frame}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV2FxrateSymbolTimestamp(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v2/fxrate/{symbol}/{timestamp}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV1RiskstatsSymbol(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/riskstats/{symbol}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV1PerpetualsFundingpaymentreportRecordsXlsx(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/perpetuals/fundingpaymentreport/records.xlsx"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1StakingUnstake(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/staking/unstake"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1StakingStake(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/staking/stake"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1StakingRewards(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/staking/rewards"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1StakingHistory(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/staking/history"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1OrderNew(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/order/new"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1OrderCancel(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/order/cancel"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1WrapSymbol(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/wrap/{symbol}"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1OrderCancelSession(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/order/cancel/session"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1OrderCancelAll(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/order/cancel/all"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1OrderStatus(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/order/status"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1Orders(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/orders"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1Mytrades(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/mytrades"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1Notionalvolume(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/notionalvolume"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1Tradevolume(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/tradevolume"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1ClearingNew(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/clearing/new"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1ClearingStatus(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/clearing/status"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1ClearingCancel(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/clearing/cancel"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1ClearingConfirm(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/clearing/confirm"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1Balances(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/balances"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1BalancesStaking(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/balances/staking"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1NotionalbalancesCurrency(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/notionalbalances/{currency}"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1Transfers(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/transfers"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1AddressesNetwork(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/addresses/{network}"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1DepositNetworkNewAddress(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/deposit/{network}/newAddress"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1DepositCurrencyNewAddress(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/deposit/{currency}/newAddress"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1WithdrawCurrency(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/withdraw/{currency}"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1AccountTransferCurrency(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/account/transfer/{currency}"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1PaymentsAddbank(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/payments/addbank"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1PaymentsMethods(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/payments/methods"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1PaymentsSenWithdraw(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/payments/sen/withdraw"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1BalancesEarn(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/balances/earn"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1EarnInterest(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/earn/interest"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1EarnHistory(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/earn/history"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1ApprovedAddressesNetworkRequest(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/approvedAddresses/{network}/request"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1ApprovedAddressesAccountNetwork(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/approvedAddresses/account/{network}"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1ApprovedAddressesNetworkRemove(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/approvedAddresses/{network}/remove"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1Account(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/account"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1AccountCreate(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/account/create"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1AccountList(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/account/list"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1Heartbeat(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/heartbeat"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1Roles(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/roles"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1Custodyaccountfees(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/custodyaccountfees"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1WithdrawCurrencyCodeLowerCaseFeeEstimate(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/withdraw/{currencyCodeLowerCase}/feeEstimate"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1PaymentsAddbankCad(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/payments/addbank/cad"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1Transactions(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/transactions"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1MarginAccount(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/margin/account"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1MarginRates(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/margin/rates"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1MarginOrderPreview(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/margin/order/preview"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1ClearingList(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/clearing/list"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1ClearingBrokerList(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/clearing/broker/list"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1ClearingBrokerNew(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/clearing/broker/new"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1ClearingTrades(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/clearing/trades"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1InstantQuote(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/instant/quote"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1InstantExecute(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/instant/execute"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1AccountRename(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/account/rename"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1OauthRevokeByToken(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/oauth/revokeByToken"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1Margin(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/margin"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1PerpetualsFundingPayment(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/perpetuals/fundingPayment"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1PerpetualsFundingpaymentreportRecordsJson(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/perpetuals/fundingpaymentreport/records.json"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1Positions(self::Gemini, params=Dict(), context=Dict())
    return request(self, "v1/positions"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function Gemini(; kwargs...)
    inst = Gemini(Exchange(), describe, fetchCurrencies, fetchCurrenciesFromWeb, parseCurrency, fetchMarkets, fetchMarketsFromWeb, parseMarketActive, fetchUSDTMarkets, fetchMarketsFromAPI, parseMarket, fetchOrderBook, fetchTickerV1, fetchTickerV2, fetchTickerV1AndV2, fetchTicker, parseTicker, fetchTickers, parseTrade, fetchTrades, parseBalance, fetchTradingFees, fetchBalance, parseOrder, fetchOrder, fetchOpenOrders, createOrder, cancelOrder, fetchMyTrades, withdraw, nonce, fetchDepositsWithdrawals, parseTransaction, parseTransactionStatus, parseDepositAddress, fetchDepositAddress, fetchDepositAddressesByNetwork, sign, handleErrors, createDepositAddress, fetchOHLCV, fetchOpenInterest, parseOpenInterest, webExchangeGet, webGetRestApi, publicGetV1Symbols, publicGetV1SymbolsDetailsSymbol, publicGetV1NetworkToken, publicGetV1StakingRates, publicGetV1PubtickerSymbol, publicGetV1Feepromos, publicGetV2TickerSymbol, publicGetV2CandlesSymbolTimeframe, publicGetV1TradesSymbol, publicGetV1AuctionSymbol, publicGetV1AuctionSymbolHistory, publicGetV1Pricefeed, publicGetV1FundingamountSymbol, publicGetV1FundingamountreportRecordsXlsx, publicGetV1BookSymbol, publicGetV1EarnRates, publicGetV2DerivativesCandlesSymbolTimeFrame, publicGetV2FxrateSymbolTimestamp, publicGetV1RiskstatsSymbol, privateGetV1PerpetualsFundingpaymentreportRecordsXlsx, privatePostV1StakingUnstake, privatePostV1StakingStake, privatePostV1StakingRewards, privatePostV1StakingHistory, privatePostV1OrderNew, privatePostV1OrderCancel, privatePostV1WrapSymbol, privatePostV1OrderCancelSession, privatePostV1OrderCancelAll, privatePostV1OrderStatus, privatePostV1Orders, privatePostV1Mytrades, privatePostV1Notionalvolume, privatePostV1Tradevolume, privatePostV1ClearingNew, privatePostV1ClearingStatus, privatePostV1ClearingCancel, privatePostV1ClearingConfirm, privatePostV1Balances, privatePostV1BalancesStaking, privatePostV1NotionalbalancesCurrency, privatePostV1Transfers, privatePostV1AddressesNetwork, privatePostV1DepositNetworkNewAddress, privatePostV1DepositCurrencyNewAddress, privatePostV1WithdrawCurrency, privatePostV1AccountTransferCurrency, privatePostV1PaymentsAddbank, privatePostV1PaymentsMethods, privatePostV1PaymentsSenWithdraw, privatePostV1BalancesEarn, privatePostV1EarnInterest, privatePostV1EarnHistory, privatePostV1ApprovedAddressesNetworkRequest, privatePostV1ApprovedAddressesAccountNetwork, privatePostV1ApprovedAddressesNetworkRemove, privatePostV1Account, privatePostV1AccountCreate, privatePostV1AccountList, privatePostV1Heartbeat, privatePostV1Roles, privatePostV1Custodyaccountfees, privatePostV1WithdrawCurrencyCodeLowerCaseFeeEstimate, privatePostV1PaymentsAddbankCad, privatePostV1Transactions, privatePostV1MarginAccount, privatePostV1MarginRates, privatePostV1MarginOrderPreview, privatePostV1ClearingList, privatePostV1ClearingBrokerList, privatePostV1ClearingBrokerNew, privatePostV1ClearingTrades, privatePostV1InstantQuote, privatePostV1InstantExecute, privatePostV1AccountRename, privatePostV1OauthRevokeByToken, privatePostV1Margin, privatePostV1PerpetualsFundingPayment, privatePostV1PerpetualsFundingpaymentreportRecordsJson, privatePostV1Positions)
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
function __ccxt_doc_Gemini_fetchCurrencies() end
"""
fetches all available currencies on an exchange

# Arguments
- `params`::object, optional: extra parameters specific to the endpoint

# Returns
- an associative dictionary of currencies
"""
__ccxt_doc_Gemini_fetchCurrencies

function __ccxt_doc_Gemini_fetchCurrenciesFromWeb() end
"""
fetches all available currencies on an exchange

# Arguments
- `params`::object, optional: extra parameters specific to the endpoint

# Returns
- an associative dictionary of currencies
"""
__ccxt_doc_Gemini_fetchCurrenciesFromWeb

function __ccxt_doc_Gemini_fetchMarkets() end
"""
retrieves data on all markets for gemini
see: https://docs.gemini.com/rest-api/#symbols

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Gemini_fetchMarkets

function __ccxt_doc_Gemini_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://docs.gemini.com/rest-api/#current-order-book

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Gemini_fetchOrderBook

function __ccxt_doc_Gemini_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://docs.gemini.com/rest-api/#ticker
see: https://docs.gemini.com/rest-api/#ticker-v2

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.fetchTickerMethod`::object, optional: 'fetchTickerV2', 'fetchTickerV1' or 'fetchTickerV1AndV2' - 'fetchTickerV1' for original ccxt.gemini.fetchTicker - 'fetchTickerV1AndV2' for 2 api calls to get the result of both fetchTicker methods - default = 'fetchTickerV1'

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Gemini_fetchTicker

function __ccxt_doc_Gemini_fetchTickers() end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://docs.gemini.com/rest-api/#price-feed

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Gemini_fetchTickers

function __ccxt_doc_Gemini_fetchTrades() end
"""
get the list of most recent trades for a particular symbol
see: https://docs.gemini.com/rest-api/#trade-history

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
__ccxt_doc_Gemini_fetchTrades

function __ccxt_doc_Gemini_fetchTradingFees() end
"""
fetch the trading fees for multiple markets
see: https://docs.gemini.com/rest-api/#get-notional-volume

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
"""
__ccxt_doc_Gemini_fetchTradingFees

function __ccxt_doc_Gemini_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://docs.gemini.com/rest-api/#get-available-balances

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Gemini_fetchBalance

function __ccxt_doc_Gemini_fetchOrder() end
"""
fetches information on an order made by the user
see: https://docs.gemini.com/rest-api/#order-status

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Gemini_fetchOrder

function __ccxt_doc_Gemini_fetchOpenOrders() end
"""
fetch all unfilled currently open orders
see: https://docs.gemini.com/rest-api/#get-active-orders

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of  open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Gemini_fetchOpenOrders

function __ccxt_doc_Gemini_createOrder() end
"""
create a trade order
see: https://docs.gemini.com/rest-api/#new-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: must be 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Gemini_createOrder

function __ccxt_doc_Gemini_cancelOrder() end
"""
cancels an open order
see: https://docs.gemini.com/rest-api/#cancel-order

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Gemini_cancelOrder

function __ccxt_doc_Gemini_fetchMyTrades() end
"""
fetch all trades made by the user
see: https://docs.gemini.com/rest-api/#get-past-trades

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Gemini_fetchMyTrades

function __ccxt_doc_Gemini_withdraw() end
"""
make a withdrawal
see: https://docs.gemini.com/rest-api/#withdraw-crypto-funds

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Gemini_withdraw

function __ccxt_doc_Gemini_fetchDepositsWithdrawals() end
"""
fetch history of deposits and withdrawals
see: https://docs.gemini.com/rest-api/#transfers

# Arguments
- `code`::string, optional: unified currency code for the currency of the deposit/withdrawals, default is undefined
- `since`::int, optional: timestamp in ms of the earliest deposit/withdrawal, default is undefined
- `limit`::int, optional: max number of deposit/withdrawals to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Gemini_fetchDepositsWithdrawals

function __ccxt_doc_Gemini_fetchDepositAddress() end
"""
fetch the deposit address for a currency associated with this account
see: https://docs.gemini.com/rest-api/#get-deposit-addresses

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the endpoint
- `params.network`::string, optional: *required* The chain of currency

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
__ccxt_doc_Gemini_fetchDepositAddress

function __ccxt_doc_Gemini_fetchDepositAddressesByNetwork() end
"""
fetch a dictionary of addresses for a currency, indexed by network
see: https://docs.gemini.com/rest-api/#get-deposit-addresses

# Arguments
- `code`::string: unified currency code of the currency for the deposit address
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.network`::string, optional: *required* The chain of currency

# Returns
- a dictionary of [address structures]{@link https://docs.ccxt.com/?id=address-structure} indexed by the network
"""
__ccxt_doc_Gemini_fetchDepositAddressesByNetwork

function __ccxt_doc_Gemini_createDepositAddress() end
"""
create a currency deposit address
see: https://docs.gemini.com/rest-api/#new-deposit-address

# Arguments
- `code`::string: unified currency code of the currency for the deposit address
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
__ccxt_doc_Gemini_createDepositAddress

function __ccxt_doc_Gemini_fetchOHLCV() end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://docs.gemini.com/rest-api/#candles

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Gemini_fetchOHLCV

function __ccxt_doc_Gemini_fetchOpenInterest() end
"""
retrieves the open interest of a contract trading pair
see: https://docs.gemini.com/rest/derivatives#get-risk-stats

# Arguments
- `symbol`::string: unified CCXT market symbol
- `params`::object, optional: exchange specific parameters

# Returns
- an open interest structure{@link https://docs.ccxt.com/?id=open-interest-structure}
"""
__ccxt_doc_Gemini_fetchOpenInterest
