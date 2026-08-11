@kwdef mutable struct Hitbtc <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    nonce::Function = nonce
    fetchMarkets::Function = fetchMarkets
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    createDepositAddress::Function = createDepositAddress
    fetchDepositAddress::Function = fetchDepositAddress
    parseBalance::Function = parseBalance
    fetchBalance::Function = fetchBalance
    fetchTicker::Function = fetchTicker
    fetchTickers::Function = fetchTickers
    parseTicker::Function = parseTicker
    fetchTrades::Function = fetchTrades
    fetchMyTrades::Function = fetchMyTrades
    parseTrade::Function = parseTrade
    fetchTransactionsHelper::Function = fetchTransactionsHelper
    parseTransactionStatus::Function = parseTransactionStatus
    parseTransactionType::Function = parseTransactionType
    parseTransaction::Function = parseTransaction
    fetchDepositsWithdrawals::Function = fetchDepositsWithdrawals
    fetchDeposits::Function = fetchDeposits
    fetchWithdrawals::Function = fetchWithdrawals
    fetchOrderBooks::Function = fetchOrderBooks
    fetchOrderBook::Function = fetchOrderBook
    parseTradingFee::Function = parseTradingFee
    fetchTradingFee::Function = fetchTradingFee
    fetchTradingFees::Function = fetchTradingFees
    fetchOHLCV::Function = fetchOHLCV
    parseOHLCV::Function = parseOHLCV
    fetchClosedOrders::Function = fetchClosedOrders
    fetchOrder::Function = fetchOrder
    fetchOrderTrades::Function = fetchOrderTrades
    fetchOpenOrders::Function = fetchOpenOrders
    fetchOpenOrder::Function = fetchOpenOrder
    cancelAllOrders::Function = cancelAllOrders
    cancelOrder::Function = cancelOrder
    editOrder::Function = editOrder
    createOrder::Function = createOrder
    createOrderRequest::Function = createOrderRequest
    parseOrderStatus::Function = parseOrderStatus
    parseOrder::Function = parseOrder
    fetchMarginModes::Function = fetchMarginModes
    parseMarginMode::Function = parseMarginMode
    transfer::Function = transfer
    parseTransfer::Function = parseTransfer
    convertCurrencyNetwork::Function = convertCurrencyNetwork
    withdraw::Function = withdraw
    fetchFundingRates::Function = fetchFundingRates
    fetchFundingRateHistory::Function = fetchFundingRateHistory
    fetchPositions::Function = fetchPositions
    fetchPosition::Function = fetchPosition
    parsePosition::Function = parsePosition
    parseOpenInterest::Function = parseOpenInterest
    fetchOpenInterests::Function = fetchOpenInterests
    fetchOpenInterest::Function = fetchOpenInterest
    fetchFundingRate::Function = fetchFundingRate
    parseFundingRate::Function = parseFundingRate
    modifyMarginHelper::Function = modifyMarginHelper
    parseMarginModification::Function = parseMarginModification
    reduceMargin::Function = reduceMargin
    addMargin::Function = addMargin
    fetchLeverage::Function = fetchLeverage
    parseLeverage::Function = parseLeverage
    setLeverage::Function = setLeverage
    fetchDepositWithdrawFees::Function = fetchDepositWithdrawFees
    parseDepositWithdrawFee::Function = parseDepositWithdrawFee
    closePosition::Function = closePosition
    handleMarginModeAndParams::Function = handleMarginModeAndParams
    handleErrors::Function = handleErrors
    sign::Function = sign

# Generated REST endpoint fields
    publicGetPublicCurrency::Function = publicGetPublicCurrency
    publicGetPublicCurrencyCurrency::Function = publicGetPublicCurrencyCurrency
    publicGetPublicSymbol::Function = publicGetPublicSymbol
    publicGetPublicSymbolSymbol::Function = publicGetPublicSymbolSymbol
    publicGetPublicTicker::Function = publicGetPublicTicker
    publicGetPublicTickerSymbol::Function = publicGetPublicTickerSymbol
    publicGetPublicPriceRate::Function = publicGetPublicPriceRate
    publicGetPublicPriceHistory::Function = publicGetPublicPriceHistory
    publicGetPublicPriceTicker::Function = publicGetPublicPriceTicker
    publicGetPublicPriceTickerSymbol::Function = publicGetPublicPriceTickerSymbol
    publicGetPublicTrades::Function = publicGetPublicTrades
    publicGetPublicTradesSymbol::Function = publicGetPublicTradesSymbol
    publicGetPublicOrderbook::Function = publicGetPublicOrderbook
    publicGetPublicOrderbookSymbol::Function = publicGetPublicOrderbookSymbol
    publicGetPublicCandles::Function = publicGetPublicCandles
    publicGetPublicCandlesSymbol::Function = publicGetPublicCandlesSymbol
    publicGetPublicConvertedCandles::Function = publicGetPublicConvertedCandles
    publicGetPublicConvertedCandlesSymbol::Function = publicGetPublicConvertedCandlesSymbol
    publicGetPublicFuturesInfo::Function = publicGetPublicFuturesInfo
    publicGetPublicFuturesInfoSymbol::Function = publicGetPublicFuturesInfoSymbol
    publicGetPublicFuturesHistoryFunding::Function = publicGetPublicFuturesHistoryFunding
    publicGetPublicFuturesHistoryFundingSymbol::Function = publicGetPublicFuturesHistoryFundingSymbol
    publicGetPublicFuturesCandlesIndexPrice::Function = publicGetPublicFuturesCandlesIndexPrice
    publicGetPublicFuturesCandlesIndexPriceSymbol::Function = publicGetPublicFuturesCandlesIndexPriceSymbol
    publicGetPublicFuturesCandlesMarkPrice::Function = publicGetPublicFuturesCandlesMarkPrice
    publicGetPublicFuturesCandlesMarkPriceSymbol::Function = publicGetPublicFuturesCandlesMarkPriceSymbol
    publicGetPublicFuturesCandlesPremiumIndex::Function = publicGetPublicFuturesCandlesPremiumIndex
    publicGetPublicFuturesCandlesPremiumIndexSymbol::Function = publicGetPublicFuturesCandlesPremiumIndexSymbol
    publicGetPublicFuturesCandlesOpenInterest::Function = publicGetPublicFuturesCandlesOpenInterest
    publicGetPublicFuturesCandlesOpenInterestSymbol::Function = publicGetPublicFuturesCandlesOpenInterestSymbol
    privateGetSpotBalance::Function = privateGetSpotBalance
    privateGetSpotBalanceCurrency::Function = privateGetSpotBalanceCurrency
    privateGetSpotOrder::Function = privateGetSpotOrder
    privateGetSpotOrderClientOrderId::Function = privateGetSpotOrderClientOrderId
    privateGetSpotFee::Function = privateGetSpotFee
    privateGetSpotFeeSymbol::Function = privateGetSpotFeeSymbol
    privateGetSpotHistoryOrder::Function = privateGetSpotHistoryOrder
    privateGetSpotHistoryTrade::Function = privateGetSpotHistoryTrade
    privateGetMarginAccount::Function = privateGetMarginAccount
    privateGetMarginAccountIsolatedSymbol::Function = privateGetMarginAccountIsolatedSymbol
    privateGetMarginAccountCrossCurrency::Function = privateGetMarginAccountCrossCurrency
    privateGetMarginOrder::Function = privateGetMarginOrder
    privateGetMarginOrderClientOrderId::Function = privateGetMarginOrderClientOrderId
    privateGetMarginConfig::Function = privateGetMarginConfig
    privateGetMarginHistoryOrder::Function = privateGetMarginHistoryOrder
    privateGetMarginHistoryTrade::Function = privateGetMarginHistoryTrade
    privateGetMarginHistoryPositions::Function = privateGetMarginHistoryPositions
    privateGetMarginHistoryClearing::Function = privateGetMarginHistoryClearing
    privateGetFuturesBalance::Function = privateGetFuturesBalance
    privateGetFuturesBalanceCurrency::Function = privateGetFuturesBalanceCurrency
    privateGetFuturesAccount::Function = privateGetFuturesAccount
    privateGetFuturesAccountIsolatedSymbol::Function = privateGetFuturesAccountIsolatedSymbol
    privateGetFuturesOrder::Function = privateGetFuturesOrder
    privateGetFuturesOrderClientOrderId::Function = privateGetFuturesOrderClientOrderId
    privateGetFuturesConfig::Function = privateGetFuturesConfig
    privateGetFuturesFee::Function = privateGetFuturesFee
    privateGetFuturesFeeSymbol::Function = privateGetFuturesFeeSymbol
    privateGetFuturesHistoryOrder::Function = privateGetFuturesHistoryOrder
    privateGetFuturesHistoryTrade::Function = privateGetFuturesHistoryTrade
    privateGetFuturesHistoryPositions::Function = privateGetFuturesHistoryPositions
    privateGetFuturesHistoryClearing::Function = privateGetFuturesHistoryClearing
    privateGetWalletBalance::Function = privateGetWalletBalance
    privateGetWalletBalanceCurrency::Function = privateGetWalletBalanceCurrency
    privateGetWalletCryptoAddress::Function = privateGetWalletCryptoAddress
    privateGetWalletCryptoAddressRecentDeposit::Function = privateGetWalletCryptoAddressRecentDeposit
    privateGetWalletCryptoAddressRecentWithdraw::Function = privateGetWalletCryptoAddressRecentWithdraw
    privateGetWalletCryptoAddressCheckMine::Function = privateGetWalletCryptoAddressCheckMine
    privateGetWalletTransactions::Function = privateGetWalletTransactions
    privateGetWalletTransactionsTxId::Function = privateGetWalletTransactionsTxId
    privateGetWalletCryptoFeeEstimate::Function = privateGetWalletCryptoFeeEstimate
    privateGetWalletAirdrops::Function = privateGetWalletAirdrops
    privateGetWalletAmountLocks::Function = privateGetWalletAmountLocks
    privateGetSubAccount::Function = privateGetSubAccount
    privateGetSubAccountAcl::Function = privateGetSubAccountAcl
    privateGetSubAccountBalanceSubAccID::Function = privateGetSubAccountBalanceSubAccID
    privateGetSubAccountCryptoAddressSubAccIDCurrency::Function = privateGetSubAccountCryptoAddressSubAccIDCurrency
    privatePostSpotOrder::Function = privatePostSpotOrder
    privatePostSpotOrderList::Function = privatePostSpotOrderList
    privatePostMarginOrder::Function = privatePostMarginOrder
    privatePostMarginOrderList::Function = privatePostMarginOrderList
    privatePostFuturesOrder::Function = privatePostFuturesOrder
    privatePostFuturesOrderList::Function = privatePostFuturesOrderList
    privatePostWalletCryptoAddress::Function = privatePostWalletCryptoAddress
    privatePostWalletCryptoWithdraw::Function = privatePostWalletCryptoWithdraw
    privatePostWalletConvert::Function = privatePostWalletConvert
    privatePostWalletTransfer::Function = privatePostWalletTransfer
    privatePostWalletInternalWithdraw::Function = privatePostWalletInternalWithdraw
    privatePostWalletCryptoCheckOffchainAvailable::Function = privatePostWalletCryptoCheckOffchainAvailable
    privatePostWalletCryptoFeesEstimate::Function = privatePostWalletCryptoFeesEstimate
    privatePostWalletAirdropsIdClaim::Function = privatePostWalletAirdropsIdClaim
    privatePostSubAccountFreeze::Function = privatePostSubAccountFreeze
    privatePostSubAccountActivate::Function = privatePostSubAccountActivate
    privatePostSubAccountTransfer::Function = privatePostSubAccountTransfer
    privatePostSubAccountAcl::Function = privatePostSubAccountAcl
    privatePatchSpotOrderClientOrderId::Function = privatePatchSpotOrderClientOrderId
    privatePatchMarginOrderClientOrderId::Function = privatePatchMarginOrderClientOrderId
    privatePatchFuturesOrderClientOrderId::Function = privatePatchFuturesOrderClientOrderId
    privateDeleteSpotOrder::Function = privateDeleteSpotOrder
    privateDeleteSpotOrderClientOrderId::Function = privateDeleteSpotOrderClientOrderId
    privateDeleteMarginPosition::Function = privateDeleteMarginPosition
    privateDeleteMarginPositionIsolatedSymbol::Function = privateDeleteMarginPositionIsolatedSymbol
    privateDeleteMarginOrder::Function = privateDeleteMarginOrder
    privateDeleteMarginOrderClientOrderId::Function = privateDeleteMarginOrderClientOrderId
    privateDeleteFuturesPosition::Function = privateDeleteFuturesPosition
    privateDeleteFuturesPositionMarginModeSymbol::Function = privateDeleteFuturesPositionMarginModeSymbol
    privateDeleteFuturesOrder::Function = privateDeleteFuturesOrder
    privateDeleteFuturesOrderClientOrderId::Function = privateDeleteFuturesOrderClientOrderId
    privateDeleteWalletCryptoWithdrawId::Function = privateDeleteWalletCryptoWithdrawId
    privatePutMarginAccountIsolatedSymbol::Function = privatePutMarginAccountIsolatedSymbol
    privatePutFuturesAccountIsolatedSymbol::Function = privatePutFuturesAccountIsolatedSymbol
    privatePutWalletCryptoWithdrawId::Function = privatePutWalletCryptoWithdrawId

end
function describe(self::Hitbtc, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "hitbtc",
    Symbol("name") => "HitBTC",
    Symbol("countries") => ["HK"],
    Symbol("rateLimit") => 3.333,
    Symbol("version") => "3",
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => false,
        Symbol("spot") => true,
        Symbol("margin") => true,
        Symbol("swap") => true,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("addMargin") => true,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelOrder") => true,
        Symbol("closePosition") => true,
        Symbol("createDepositAddress") => true,
        Symbol("createOrder") => true,
        Symbol("createPostOnlyOrder") => true,
        Symbol("createReduceOnlyOrder") => true,
        Symbol("createStopLimitOrder") => true,
        Symbol("createStopMarketOrder") => true,
        Symbol("createStopOrder") => true,
        Symbol("editOrder") => true,
        Symbol("fetchAccounts") => false,
        Symbol("fetchBalance") => true,
        Symbol("fetchBorrowRateHistories") => nothing,
        Symbol("fetchBorrowRateHistory") => nothing,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDepositAddress") => true,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => false,
        Symbol("fetchDeposits") => true,
        Symbol("fetchDepositsWithdrawals") => true,
        Symbol("fetchDepositWithdrawFee") => "emulated",
        Symbol("fetchDepositWithdrawFees") => true,
        Symbol("fetchFundingHistory") => nothing,
        Symbol("fetchFundingRate") => true,
        Symbol("fetchFundingRateHistory") => true,
        Symbol("fetchFundingRates") => true,
        Symbol("fetchGreeks") => false,
        Symbol("fetchIndexOHLCV") => true,
        Symbol("fetchIsolatedBorrowRate") => false,
        Symbol("fetchIsolatedBorrowRates") => false,
        Symbol("fetchLeverage") => true,
        Symbol("fetchLeverageTiers") => nothing,
        Symbol("fetchLiquidations") => false,
        Symbol("fetchMarginMode") => "emulated",
        Symbol("fetchMarginModes") => true,
        Symbol("fetchMarketLeverageTiers") => false,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => true,
        Symbol("fetchMyLiquidations") => false,
        Symbol("fetchMySettlementHistory") => false,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterest") => true,
        Symbol("fetchOpenInterestHistory") => false,
        Symbol("fetchOpenInterests") => true,
        Symbol("fetchOpenOrder") => true,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOption") => false,
        Symbol("fetchOptionChain") => false,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrderBooks") => true,
        Symbol("fetchOrders") => false,
        Symbol("fetchOrderTrades") => true,
        Symbol("fetchPosition") => true,
        Symbol("fetchPositions") => true,
        Symbol("fetchPremiumIndexOHLCV") => true,
        Symbol("fetchSettlementHistory") => false,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => true,
        Symbol("fetchTradingFees") => true,
        Symbol("fetchTransactions") => "emulated",
        Symbol("fetchVolatilityHistory") => false,
        Symbol("fetchWithdrawals") => true,
        Symbol("reduceMargin") => true,
        Symbol("sandbox") => true,
        Symbol("setLeverage") => true,
        Symbol("setMargin") => false,
        Symbol("setMarginMode") => false,
        Symbol("setPositionMode") => false,
        Symbol("transfer") => true,
        Symbol("withdraw") => true
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://user-images.githubusercontent.com/1294454/27766555-8eaec20e-5edc-11e7-9c5b-6dc69fc42f5e.jpg",
        Symbol("test") => Dict{Symbol, Any}(
            Symbol("public") => "https://api.demo.hitbtc.com/api/3",
            Symbol("private") => "https://api.demo.hitbtc.com/api/3"
        ),
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => "https://api.hitbtc.com/api/3",
            Symbol("private") => "https://api.hitbtc.com/api/3"
        ),
        Symbol("www") => "https://hitbtc.com",
        Symbol("referral") => "https://hitbtc.com/?ref_id=5a5d39a65d466",
        Symbol("doc") => ["https://api.hitbtc.com", "https://github.com/hitbtc-com/hitbtc-api/blob/master/APIv2.md"],
        Symbol("fees") => ["https://hitbtc.com/fees-and-limits", "https://support.hitbtc.com/hc/en-us/articles/115005148605-Fees-and-limits"]
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("public/currency") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("public/currency/{currency}") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("public/symbol") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("public/symbol/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("public/ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("public/ticker/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("public/price/rate") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("public/price/history") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("public/price/ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("public/price/ticker/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("public/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("public/trades/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("public/orderbook") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("public/orderbook/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("public/candles") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("public/candles/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("public/converted/candles") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("public/converted/candles/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("public/futures/info") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("public/futures/info/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("public/futures/history/funding") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("public/futures/history/funding/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("public/futures/candles/index_price") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("public/futures/candles/index_price/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("public/futures/candles/mark_price") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("public/futures/candles/mark_price/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("public/futures/candles/premium_index") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("public/futures/candles/premium_index/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("public/futures/candles/open_interest") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("public/futures/candles/open_interest/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 10
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("spot/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("spot/balance/{currency}") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("spot/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("spot/order/{client_order_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("spot/fee") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("spot/fee/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("spot/history/order") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("spot/history/trade") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("margin/account") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/account/isolated/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/account/cross/{currency}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/order/{client_order_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/config") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("margin/history/order") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("margin/history/trade") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("margin/history/positions") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("margin/history/clearing") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("futures/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("futures/balance/{currency}") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("futures/account") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("futures/account/isolated/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("futures/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("futures/order/{client_order_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("futures/config") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("futures/fee") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("futures/fee/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("futures/history/order") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("futures/history/trade") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("futures/history/positions") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("futures/history/clearing") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("wallet/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("wallet/balance/{currency}") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("wallet/crypto/address") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("wallet/crypto/address/recent-deposit") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("wallet/crypto/address/recent-withdraw") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("wallet/crypto/address/check-mine") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("wallet/transactions") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("wallet/transactions/{tx_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("wallet/crypto/fee/estimate") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("wallet/airdrops") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("wallet/amount-locks") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("sub-account") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("sub-account/acl") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("sub-account/balance/{subAccID}") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("sub-account/crypto/address/{subAccID}/{currency}") => Dict{Symbol, Any}(
    Symbol("cost") => 15
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("spot/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("spot/order/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/order/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("futures/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("futures/order/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("wallet/crypto/address") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("wallet/crypto/withdraw") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("wallet/convert") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("wallet/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("wallet/internal/withdraw") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("wallet/crypto/check-offchain-available") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("wallet/crypto/fees/estimate") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("wallet/airdrops/{id}/claim") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("sub-account/freeze") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("sub-account/activate") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("sub-account/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("sub-account/acl") => Dict{Symbol, Any}(
    Symbol("cost") => 15
)
            ),
            Symbol("patch") => Dict{Symbol, Any}(
                Symbol("spot/order/{client_order_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/order/{client_order_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("futures/order/{client_order_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("spot/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("spot/order/{client_order_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/position") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/position/isolated/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/order/{client_order_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("futures/position") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("futures/position/{margin_mode}/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("futures/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("futures/order/{client_order_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("wallet/crypto/withdraw/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 30
)
            ),
            Symbol("put") => Dict{Symbol, Any}(
                Symbol("margin/account/isolated/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("futures/account/isolated/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("wallet/crypto/withdraw/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 30
)
            )
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("tierBased") => true,
            Symbol("percentage") => true,
            Symbol("taker") => self.parseNumber("0.0009"),
            Symbol("maker") => self.parseNumber("0.0009"),
            Symbol("tiers") => Dict{Symbol, Any}(
                Symbol("maker") => [[self.parseNumber("0"), self.parseNumber("0.0009")], [self.parseNumber("10"), self.parseNumber("0.0007")], [self.parseNumber("100"), self.parseNumber("0.0006")], [self.parseNumber("500"), self.parseNumber("0.0005")], [self.parseNumber("1000"), self.parseNumber("0.0003")], [self.parseNumber("5000"), self.parseNumber("0.0002")], [self.parseNumber("10000"), self.parseNumber("0.0001")], [self.parseNumber("20000"), self.parseNumber("0")], [self.parseNumber("50000"), self.parseNumber("-0.0001")], [self.parseNumber("100000"), self.parseNumber("-0.0001")]],
                Symbol("taker") => [[self.parseNumber("0"), self.parseNumber("0.0009")], [self.parseNumber("10"), self.parseNumber("0.0008")], [self.parseNumber("100"), self.parseNumber("0.0007")], [self.parseNumber("500"), self.parseNumber("0.0007")], [self.parseNumber("1000"), self.parseNumber("0.0006")], [self.parseNumber("5000"), self.parseNumber("0.0006")], [self.parseNumber("10000"), self.parseNumber("0.0005")], [self.parseNumber("20000"), self.parseNumber("0.0004")], [self.parseNumber("50000"), self.parseNumber("0.0003")], [self.parseNumber("100000"), self.parseNumber("0.0002")]]
            )
        )
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
                    Symbol("GTD") => true
                ),
                Symbol("hedged") => false,
                Symbol("selfTradePrevention") => false,
                Symbol("trailing") => false,
                Symbol("leverage") => false,
                Symbol("marketBuyByCost") => false,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("iceberg") => true
            ),
            Symbol("createOrders") => nothing,
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("limit") => 1000,
                Symbol("daysBack") => 100000,
                Symbol("untilDays") => 100000,
                Symbol("symbolRequired") => false,
                Symbol("marketType") => true
            ),
            Symbol("fetchOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false,
                Symbol("marketType") => true
            ),
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("limit") => 1000,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false,
                Symbol("marketType") => true
            ),
            Symbol("fetchOrders") => nothing,
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("limit") => 1000,
                Symbol("daysBack") => 100000,
                Symbol("daysBackCanceled") => 1,
                Symbol("untilDays") => 100000,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false,
                Symbol("marketType") => true
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 1000
            )
        ),
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("extends") => "default"
        ),
        Symbol("forDerivatives") => Dict{Symbol, Any}(
            Symbol("extends") => "default",
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => true
            ),
            Symbol("fetchOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false
            ),
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false
            ),
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false
            ),
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false
            )
        ),
        Symbol("swap") => Dict{Symbol, Any}(
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("extends") => "forDerivatives"
            ),
            Symbol("inverse") => Dict{Symbol, Any}(
                Symbol("extends") => "forDerivatives"
            )
        ),
        Symbol("future") => Dict{Symbol, Any}(
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("extends") => "forDerivatives"
            ),
            Symbol("inverse") => Dict{Symbol, Any}(
                Symbol("extends") => "forDerivatives"
            )
        )
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "M1",
        Symbol("3m") => "M3",
        Symbol("5m") => "M5",
        Symbol("15m") => "M15",
        Symbol("30m") => "M30",
        Symbol("1h") => "H1",
        Symbol("4h") => "H4",
        Symbol("1d") => "D1",
        Symbol("1w") => "D7",
        Symbol("1M") => "1M"
    ),
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("429") => RateLimitExceeded,
            Symbol("500") => ExchangeError,
            Symbol("503") => ExchangeNotAvailable,
            Symbol("504") => ExchangeNotAvailable,
            Symbol("600") => PermissionDenied,
            Symbol("800") => ExchangeError,
            Symbol("1002") => AuthenticationError,
            Symbol("1003") => PermissionDenied,
            Symbol("1004") => AuthenticationError,
            Symbol("1005") => AuthenticationError,
            Symbol("2001") => BadSymbol,
            Symbol("2002") => BadRequest,
            Symbol("2003") => BadRequest,
            Symbol("2010") => BadRequest,
            Symbol("2011") => BadRequest,
            Symbol("2012") => BadRequest,
            Symbol("2020") => BadRequest,
            Symbol("2022") => BadRequest,
            Symbol("2024") => InvalidOrder,
            Symbol("10001") => BadRequest,
            Symbol("10021") => AccountSuspended,
            Symbol("10022") => BadRequest,
            Symbol("20001") => InsufficientFunds,
            Symbol("20002") => OrderNotFound,
            Symbol("20003") => ExchangeError,
            Symbol("20004") => ExchangeError,
            Symbol("20005") => ExchangeError,
            Symbol("20006") => ExchangeError,
            Symbol("20007") => ExchangeError,
            Symbol("20008") => InvalidOrder,
            Symbol("20009") => InvalidOrder,
            Symbol("20010") => OnMaintenance,
            Symbol("20011") => ExchangeError,
            Symbol("20012") => ExchangeError,
            Symbol("20014") => ExchangeError,
            Symbol("20016") => ExchangeError,
            Symbol("20018") => ExchangeError,
            Symbol("20031") => ExchangeError,
            Symbol("20032") => ExchangeError,
            Symbol("20033") => ExchangeError,
            Symbol("20034") => ExchangeError,
            Symbol("20040") => ExchangeError,
            Symbol("20041") => ExchangeError,
            Symbol("20042") => ExchangeError,
            Symbol("20043") => ExchangeError,
            Symbol("20044") => PermissionDenied,
            Symbol("20045") => InvalidOrder,
            Symbol("20047") => InvalidOrder,
            Symbol("20048") => InvalidOrder,
            Symbol("20049") => InvalidOrder,
            Symbol("20080") => ExchangeError,
            Symbol("21001") => ExchangeError,
            Symbol("21003") => AccountSuspended,
            Symbol("21004") => AccountSuspended,
            Symbol("22004") => ExchangeError,
            Symbol("22008") => ExchangeError
        ),
        Symbol("broad") => Dict{Symbol, Any}()
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("defaultNetwork") => "ERC20",
        Symbol("defaultNetworks") => Dict{Symbol, Any}(
            Symbol("ETH") => "ETH",
            Symbol("USDT") => "TRC20"
        ),
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("BTC") => "btc",
            Symbol("OMNI") => "BTC",
            Symbol("ETH") => "eth",
            Symbol("ERC20") => "ETH",
            Symbol("ETC") => "ETC",
            Symbol("BEP20") => "BSC",
            Symbol("TRC20") => "TRX",
            Symbol("NEAR") => "NEAR",
            Symbol("DGB") => "DGB",
            Symbol("AE") => "AE",
            Symbol("AR") => "AR",
            Symbol("ADA") => "ADA",
            Symbol("CHZ") => "CHZ",
            Symbol("ABBC") => "ABBC",
            Symbol("ALGO") => "ALGO",
            Symbol("APT") => "APT",
            Symbol("ATOM") => "ATOM",
            Symbol("AVAXC") => "AVAC",
            Symbol("AVAXX") => "AVAX",
            Symbol("BSV") => "BCHSV",
            Symbol("BEP2") => "BNB",
            Symbol("CELO") => "CELO",
            Symbol("CKB") => "CKB",
            Symbol("CTXC") => "CTXC",
            Symbol("DASH") => "DASH",
            Symbol("DCR") => "DCR",
            Symbol("DOGE") => "doge",
            Symbol("EGLD") => "EGLD",
            Symbol("EOS") => "EOS",
            Symbol("ETHW") => "ETHW",
            Symbol("EVER") => "EVER",
            Symbol("FET") => "FET",
            Symbol("FIL") => "FIL",
            Symbol("FLOW") => "FLOW",
            Symbol("GLMR") => "GLMR",
            Symbol("GRIN") => "GRIN",
            Symbol("HBAR") => "HBAR",
            Symbol("HIVE") => "HIVE",
            Symbol("HYDRA") => "HYDRA",
            Symbol("ICP") => "ICP",
            Symbol("ICX") => "ICX",
            Symbol("IOST") => "IOST",
            Symbol("IOTA") => "IOTA",
            Symbol("IOTX") => "IOTX",
            Symbol("KAVA") => "KAVA",
            Symbol("KLAY") => "KIM",
            Symbol("KOMODO") => "KMD",
            Symbol("KSM") => "KSM",
            Symbol("LSK") => "LSK",
            Symbol("LTC") => "ltc",
            Symbol("MINA") => "MINA",
            Symbol("MOVR") => "MOVR",
            Symbol("NANO") => "NANO",
            Symbol("NEO") => "NEO",
            Symbol("ONE") => "ONE",
            Symbol("ONT") => "ONT",
            Symbol("OPTIMISM") => "OP",
            Symbol("PLCU") => "PLCU",
            Symbol("MATIC") => "POLYGON",
            Symbol("QTUM") => "QTUM",
            Symbol("REI") => "REI",
            Symbol("OASIS") => "ROSE",
            Symbol("RVN") => "RVN",
            Symbol("SC") => "SC",
            Symbol("SCRT") => "SCRT",
            Symbol("SOL") => "SOL",
            Symbol("STEEM") => "STEEM",
            Symbol("THETA") => "Theta",
            Symbol("TRUE") => "TRUE",
            Symbol("VET") => "VET",
            Symbol("VSYS") => "VSYS",
            Symbol("WAVES") => "WAVES",
            Symbol("WAX") => "WAX",
            Symbol("XCH") => "XCH",
            Symbol("XEC") => "XEC",
            Symbol("NEM") => "XEM",
            Symbol("XLM") => "XLM",
            Symbol("XMR") => "xmr",
            Symbol("XRD") => "XRD",
            Symbol("XRP") => "XRP",
            Symbol("XTZ") => "XTZ",
            Symbol("XVG") => "XVG",
            Symbol("XYM") => "XYM",
            Symbol("ZEC") => "ZEC",
            Symbol("ZEN") => "ZEN",
            Symbol("ZIL") => "ZIL"
        ),
        Symbol("accountsByType") => Dict{Symbol, Any}(
            Symbol("spot") => "spot",
            Symbol("funding") => "wallet",
            Symbol("swap") => "derivatives",
            Symbol("future") => "derivatives"
        ),
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("includeFee") => false
        )
    ),
    Symbol("commonCurrencies") => Dict{Symbol, Any}(
        Symbol("AUTO") => "Cube",
        Symbol("BCC") => "BCC",
        Symbol("BDP") => "BidiPass",
        Symbol("BET") => "DAO.Casino",
        Symbol("BIT") => "BitRewards",
        Symbol("BOX") => "BOX Token",
        Symbol("CPT") => "Cryptaur",
        Symbol("GET") => "Themis",
        Symbol("GMT") => "GMT Token",
        Symbol("HSR") => "HC",
        Symbol("IQ") => "IQ.Cash",
        Symbol("LNC") => "LinkerCoin",
        Symbol("PLA") => "PlayChip",
        Symbol("PNT") => "Penta",
        Symbol("SBTC") => "Super Bitcoin",
        Symbol("STEPN") => "GMT",
        Symbol("STX") => "STOX",
        Symbol("TV") => "Tokenville",
        Symbol("XMT") => "MTL",
        Symbol("XPNT") => "PNT"
    ),
    Symbol("rollingWindowSize") => 1000
))

end
function nonce(self::Hitbtc, )
    return milliseconds()

end
function fetchMarkets(self::Hitbtc, params=Dict())
    response = Base.fetch(self.publicGetPublicSymbol(params));
    result = [];
    ids = objectKeys(response);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(ids)))
        id = get(ids, i + 1, nothing);
        if functions.ccxtruthy(endswith(id, "_BQX"))
            i += 1; continue
        end
        market = safeValue(response, id);
        marketType = safeString(market, "type");
        expiry = safeInteger(market, "expiry");
        contract = (marketType == "futures");
        spot = (marketType == "spot");
        marginTrading = self.safeBool(market, "margin_trading", false);
        margin = @functions.ccxt_and(spot, marginTrading);
        future = (expiry != nothing);
        swap = (@functions.ccxt_and(contract, !functions.ccxtruthy(future)));
        option = false;
        baseId = safeString2(market, "base_currency", "underlying");
        quoteId = safeString(market, "quote_currency");
        feeCurrencyId = safeString(market, "fee_currency");
        base = self.safeCurrencyCode(baseId);
        quote_var = self.safeCurrencyCode(quoteId);
        feeCurrency = self.safeCurrencyCode(feeCurrencyId);
        settleId = nothing;
        settle = nothing;
        symbol = string(base, "/", quote_var);
        type_var = "spot";
        contractSize = nothing;
        linear = nothing;
        inverse = nothing;
        if functions.ccxtruthy(contract)
            contractSize = self.parseNumber("1");
            settleId = feeCurrencyId;
            settle = self.safeCurrencyCode(settleId);
            linear = (@functions.ccxt_and((quote_var != nothing), (quote_var == settle)));
            inverse = !functions.ccxtruthy(linear);
            symbol = string(symbol, ":", settle);
            if functions.ccxtruthy(future)
                symbol = string(symbol, "-", expiry);
                type_var = "future";
            else
                type_var = "swap";
            end
        end
        lotString = safeString(market, "quantity_increment");
        stepString = safeString(market, "tick_size");
        lot = self.parseNumber(lotString);
        step = self.parseNumber(stepString);
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
    Symbol("spot") => spot,
    Symbol("margin") => margin,
    Symbol("swap") => swap,
    Symbol("future") => future,
    Symbol("option") => option,
    Symbol("active") => true,
    Symbol("contract") => contract,
    Symbol("linear") => linear,
    Symbol("inverse") => inverse,
    Symbol("taker") => self.safeNumber(market, "take_rate"),
    Symbol("maker") => self.safeNumber(market, "make_rate"),
    Symbol("contractSize") => contractSize,
    Symbol("expiry") => expiry,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("feeCurrency") => feeCurrency,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => lot,
        Symbol("price") => step
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => self.parseNumber("1"),
            Symbol("max") => self.safeNumber(market, "max_initial_leverage", 1)
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => lot,
            Symbol("max") => nothing
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => step,
            Symbol("max") => nothing
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => self.parseNumber(stringMul(lotString, stepString)),
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
function fetchCurrencies(self::Hitbtc, params=Dict())
    response = Base.fetch(self.publicGetPublicCurrency(params));
    enhancedArray = self.addKeyInArrayItems(response, "_coin_id");
    return self.parseCurrencies(enhancedArray)

end
function parseCurrency(self::Hitbtc, currency)
    currencyId = get(currency, Symbol("_coin_id"), nothing);
    code = self.safeCurrencyCode(currencyId);
    entry = currency;
    rawNetworks = self.safeList(entry, "networks", []);
    networks = Dict{Symbol, Any}();
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(rawNetworks)))
        rawNetwork = get(rawNetworks, j + 1, nothing);
        networkId = safeString2(rawNetwork, "protocol", "network");
        networkCode = self.networkIdToCode(networkId, code);
        networkCode = functions.ccxtruthy((networkCode != nothing)) ? uppercase(networkCode) : code;
        if functions.ccxtruthy(networkCode != nothing)
            networks[Symbol(networkCode)] = Dict{Symbol, Any}(
                Symbol("info") => rawNetwork,
                Symbol("id") => networkId,
                Symbol("network") => networkCode,
                Symbol("active") => nothing,
                Symbol("fee") => self.safeNumber(rawNetwork, "payout_fee"),
                Symbol("deposit") => self.safeBool(rawNetwork, "payin_enabled"),
                Symbol("withdraw") => self.safeBool(rawNetwork, "payout_enabled"),
                Symbol("precision") => self.safeNumber(rawNetwork, "precision_payout"),
                Symbol("limits") => Dict{Symbol, Any}(
                    Symbol("withdraw") => Dict{Symbol, Any}(
                        Symbol("min") => nothing,
                        Symbol("max") => nothing
                    )
                )
            );
        end
        j += 1
    end
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("info") => entry,
    Symbol("code") => code,
    Symbol("id") => currencyId,
    Symbol("precision") => self.safeNumber(entry, "precision_transfer"),
    Symbol("name") => safeString(entry, "full_name"),
    Symbol("active") => !functions.ccxtruthy(self.safeBool(entry, "delisted")),
    Symbol("deposit") => self.safeBool(entry, "payin_enabled"),
    Symbol("withdraw") => self.safeBool(entry, "payout_enabled"),
    Symbol("networks") => networks,
    Symbol("fee") => nothing,
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    ),
    Symbol("type") => nothing
))

end
function createDepositAddress(self::Hitbtc, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing)
    );
    network = safeStringUpper(params, "network");
    if functions.ccxtruthy(@functions.ccxt_and((network != nothing), (code == "USDT")))
        networks = safeValue(self.options, "networks");
        parsedNetwork = safeString(networks, network);
        if functions.ccxtruthy(parsedNetwork != nothing)
            request[Symbol("currency")] = parsedNetwork;
        end
        params = omit(params, "network");
    end
    response = Base.fetch(self.privatePostWalletCryptoAddress(extend(request, params)));
    currencyId = safeString(response, "currency");
    return Dict{Symbol, Any}(
    Symbol("currency") => self.safeCurrencyCode(currencyId),
    Symbol("address") => safeString(response, "address"),
    Symbol("tag") => safeString(response, "payment_id"),
    Symbol("network") => nothing,
    Symbol("info") => response
)

end
function fetchDepositAddress(self::Hitbtc, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing)
    );
    network = safeStringUpper(params, "network");
    if functions.ccxtruthy(@functions.ccxt_and((network != nothing), (code == "USDT")))
        networks = safeValue(self.options, "networks");
        parsedNetwork = safeString(networks, network);
        if functions.ccxtruthy(parsedNetwork != nothing)
            request[Symbol("currency")] = parsedNetwork;
        end
        params = omit(params, "network");
    end
    response = Base.fetch(self.privateGetWalletCryptoAddress(extend(request, params)));
    firstAddress = safeValue(response, 0);
    address = safeString(firstAddress, "address");
    currencyId = safeString(firstAddress, "currency");
    tag = safeString(firstAddress, "payment_id");
    parsedCode = self.safeCurrencyCode(currencyId);
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("currency") => parsedCode,
    Symbol("network") => nothing,
    Symbol("address") => address,
    Symbol("tag") => tag
)

end
function parseBalance(self::Hitbtc, response)
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        entry = get(response, i + 1, nothing);
        currencyId = safeString(entry, "currency");
        code = self.safeCurrencyCode(currencyId);
        account = self.account();
        account[Symbol("free")] = safeString(entry, "available");
        account[Symbol("used")] = safeString(entry, "reserved");
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
function fetchBalance(self::Hitbtc, params=Dict())
    type_var = safeStringLower(params, "type", "spot");
    params = omit(params, ["type"]);
    accountsByType = safeValue(self.options, "accountsByType", Dict{Symbol, Any}());
    account = functions.ccxtruthy((type_var == nothing)) ? nothing : safeString(accountsByType, type_var, type_var);
    if functions.ccxtruthy(account == "wallet")
        response = Base.fetch(self.privateGetWalletBalance(params));
    elseif functions.ccxtruthy(account == "spot")
        response = Base.fetch(self.privateGetSpotBalance(params));
    else
        if functions.ccxtruthy(account == "derivatives")
            response = Base.fetch(self.privateGetFuturesBalance(params));
        else
            keys_var = objectKeys(accountsByType);
            throw(BadRequest(string(self.id, " fetchBalance() type parameter must be one of ", join(keys_var, ", "))));
        end

    end
    return self.parseBalance(response)

end
function fetchTicker(self::Hitbtc, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetPublicTickerSymbol(extend(request, params)));
    return self.parseTicker(response, market)

end
function fetchTickers(self::Hitbtc, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols);
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbols != nothing)
        marketIds = self.marketIds(symbols);
        delimited = join(marketIds, ",");
        request[Symbol("symbols")] = delimited;
    end
    response = Base.fetch(self.publicGetPublicTicker(extend(request, params)));
    result = Dict{Symbol, Any}();
    keys_var = objectKeys(response);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
        marketId = get(keys_var, i + 1, nothing);
        market = self.safeMarket(marketId);
        symbol = get(market, Symbol("symbol"), nothing);
        entry = self.safeDict(response, marketId, Dict{Symbol, Any}());
        result[Symbol(symbol)] = self.parseTicker(entry, market);
        i += 1
    end
    return self.filterByArrayTickers(result, "symbol", symbols)

end
function parseTicker(self::Hitbtc, ticker, market=nothing)
    timestamp = self.parse8601(get(ticker, Symbol("timestamp"), nothing));
    symbol = self.safeSymbol(nothing, market);
    baseVolume = safeString(ticker, "volume");
    quoteVolume = safeString(ticker, "volume_quote");
    open = safeString(ticker, "open");
    last_var = safeString(ticker, "last");
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
    Symbol("percentage") => nothing,
    Symbol("average") => nothing,
    Symbol("baseVolume") => baseVolume,
    Symbol("quoteVolume") => quoteVolume,
    Symbol("info") => ticker
), market)

end
function fetchTrades(self::Hitbtc, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 1000);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("from")] = since;
    end
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        responseInner = Base.fetch(self.publicGetPublicTradesSymbol(extend(request, params)));
            return self.parseTrades(responseInner, market)
    end
    response = Base.fetch(self.publicGetPublicTrades(extend(request, params)));
    trades = [];
    marketIds = objectKeys(response);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(marketIds)))
        marketId = get(marketIds, i + 1, nothing);
        marketInner = self.market(marketId);
        rawTrades = self.safeList(response, marketId, []);
        parsed = self.parseTrades(rawTrades, marketInner);
        trades = arrayConcat(trades, parsed);
        i += 1
    end
    return trades

end
function fetchMyTrades(self::Hitbtc, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("from")] = since;
    end
    marketType = nothing;
    marginMode = nothing;
    response = [];
    (marketType, params) = self.handleMarketTypeAndParams("fetchMyTrades", market, params);
    (marginMode, params) = self.handleMarginModeAndParams("fetchMyTrades", params);
    params = omit(params, ["marginMode", "margin"]);
    if functions.ccxtruthy(marginMode != nothing)
        response = Base.fetch(self.privateGetMarginHistoryTrade(extend(request, params)));
    else
        if functions.ccxtruthy(marketType == "spot")
            response = Base.fetch(self.privateGetSpotHistoryTrade(extend(request, params)));
        elseif functions.ccxtruthy(marketType == "swap")
            response = Base.fetch(self.privateGetFuturesHistoryTrade(extend(request, params)));
        else
            if functions.ccxtruthy(marketType == "margin")
                response = Base.fetch(self.privateGetMarginHistoryTrade(extend(request, params)));
            else
                throw(NotSupported(string(self.id, " fetchMyTrades() not support this market type")));
            end

        end
    end
    return self.parseTrades(response, market, since, limit)

end
function parseTrade(self::Hitbtc, trade, market=nothing)
    timestamp = self.parse8601(get(trade, Symbol("timestamp"), nothing));
    marketId = safeString(trade, "symbol");
    market = self.safeMarket(marketId, market);
    symbol = get(market, Symbol("symbol"), nothing);
    fee = nothing;
    feeCostString = safeString(trade, "fee");
    taker = safeValue(trade, "taker");
    if functions.ccxtruthy(taker != nothing)
        takerOrMaker = functions.ccxtruthy(taker) ? "taker" : "maker";
    else
        takerOrMaker = "taker";
    end
    if functions.ccxtruthy(feeCostString != nothing)
        info = safeValue(market, "info", Dict{Symbol, Any}());
        feeCurrency = safeString(info, "fee_currency");
        feeCurrencyCode = self.safeCurrencyCode(feeCurrency);
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCostString,
            Symbol("currency") => feeCurrencyCode
        );
    end
    orderId = safeString2(trade, "clientOrderId", "client_order_id");
    priceString = safeString(trade, "price");
    amountString = safeString2(trade, "quantity", "qty");
    side = safeString(trade, "side");
    id = safeString(trade, "id");
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("id") => id,
    Symbol("order") => orderId,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => symbol,
    Symbol("type") => nothing,
    Symbol("side") => side,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("price") => priceString,
    Symbol("amount") => amountString,
    Symbol("cost") => nothing,
    Symbol("fee") => fee
), market)

end
function fetchTransactionsHelper(self::Hitbtc, types, code, since, limit, params)
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("types") => types
    );
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("currencies")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("from")] = self.iso8601(since);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateGetWalletTransactions(extend(request, params)));
    return self.parseTransactions(response, currency, since, limit, params)

end
function parseTransactionStatus(self::Hitbtc, status)
    statuses = Dict{Symbol, Any}(
        Symbol("CREATED") => "pending",
        Symbol("PENDING") => "pending",
        Symbol("FAILED") => "failed",
        Symbol("ROLLED_BACK") => "failed",
        Symbol("SUCCESS") => "ok"
    );
    if functions.ccxtruthy(status == nothing)
            return nothing
    end
    return safeString(statuses, status, status)

end
function parseTransactionType(self::Hitbtc, type_var)
    types = Dict{Symbol, Any}(
        Symbol("DEPOSIT") => "deposit",
        Symbol("WITHDRAW") => "withdrawal"
    );
    return safeString(types, type_var, type_var)

end
function parseTransaction(self::Hitbtc, transaction, currency=nothing)
    id = safeString2(transaction, "operation_id", "id");
    timestamp = self.parse8601(safeString(transaction, "created_at"));
    updated = self.parse8601(safeString(transaction, "updated_at"));
    type_var = self.parseTransactionType(safeString(transaction, "type"));
    status = self.parseTransactionStatus(safeString(transaction, "status"));
    native = safeValue(transaction, "native", Dict{Symbol, Any}());
    currencyId = safeString(native, "currency");
    code = self.safeCurrencyCode(currencyId);
    txhash = safeString(native, "hash");
    address = safeString(native, "address");
    addressTo = address;
    tag = safeString(native, "payment_id");
    tagTo = tag;
    sender = safeValue(native, "senders");
    addressFrom = safeString(sender, 0);
    amount = self.safeNumber(native, "amount");
    subType = safeString(transaction, "subtype");
    internal = subType == "OFFCHAIN";
    fee = Dict{Symbol, Any}(
        Symbol("currency") => nothing,
        Symbol("cost") => nothing,
        Symbol("rate") => nothing
    );
    feeCost = self.safeNumber(native, "fee");
    if functions.ccxtruthy(feeCost != nothing)
        fee[Symbol("currency")] = code;
        fee[Symbol("cost")] = feeCost;
    end
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => id,
    Symbol("txid") => txhash,
    Symbol("type") => type_var,
    Symbol("currency") => code,
    Symbol("network") => nothing,
    Symbol("amount") => amount,
    Symbol("status") => status,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("address") => address,
    Symbol("addressFrom") => addressFrom,
    Symbol("addressTo") => addressTo,
    Symbol("tag") => tag,
    Symbol("tagFrom") => nothing,
    Symbol("tagTo") => tagTo,
    Symbol("updated") => updated,
    Symbol("comment") => nothing,
    Symbol("internal") => internal,
    Symbol("fee") => fee
)

end
function fetchDepositsWithdrawals(self::Hitbtc, code=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchTransactionsHelper("DEPOSIT,WITHDRAW", code, since, limit, params))

end
function fetchDeposits(self::Hitbtc, code=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchTransactionsHelper("DEPOSIT", code, since, limit, params))

end
function fetchWithdrawals(self::Hitbtc, code=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchTransactionsHelper("WITHDRAW", code, since, limit, params))

end
function fetchOrderBooks(self::Hitbtc, symbols=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbols != nothing)
        marketIdsInner = self.marketIds(symbols);
        request[Symbol("symbols")] =         join(marketIdsInner, ",");
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("depth")] = limit;
    end
    response = Base.fetch(self.publicGetPublicOrderbook(extend(request, params)));
    result = Dict{Symbol, Any}();
    marketIds = objectKeys(response);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(marketIds)))
        marketId = get(marketIds, i + 1, nothing);
        orderbook = self.safeDict(response, marketId, Dict{Symbol, Any}());
        symbol = self.safeSymbol(marketId);
        timestamp = self.parse8601(safeString(orderbook, "timestamp"));
        result[Symbol(symbol)] = self.parseOrderBook(orderbook, symbol, timestamp, "bid", "ask");
        i += 1
    end
    return result

end
function fetchOrderBook(self::Hitbtc, symbol, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("depth")] = limit;
    end
    response = Base.fetch(self.publicGetPublicOrderbookSymbol(extend(request, params)));
    timestamp = self.parse8601(safeString(response, "timestamp"));
    return self.parseOrderBook(response, symbol, timestamp, "bid", "ask")

end
function parseTradingFee(self::Hitbtc, fee, market=nothing)
    taker = self.safeNumber(fee, "take_rate");
    maker = self.safeNumber(fee, "make_rate");
    marketId = safeString(fee, "symbol");
    symbol = self.safeSymbol(marketId, market);
    return Dict{Symbol, Any}(
    Symbol("info") => fee,
    Symbol("symbol") => symbol,
    Symbol("taker") => taker,
    Symbol("maker") => maker,
    Symbol("percentage") => nothing,
    Symbol("tierBased") => nothing
)

end
function fetchTradingFee(self::Hitbtc, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(get(market, Symbol("type"), nothing) == "spot")
        response = Base.fetch(self.privateGetSpotFeeSymbol(extend(request, params)));
    elseif functions.ccxtruthy(get(market, Symbol("type"), nothing) == "swap")
        response = Base.fetch(self.privateGetFuturesFeeSymbol(extend(request, params)));
    else
        throw(NotSupported(string(self.id, " fetchTradingFee() not support this market type")));
    end
    return self.parseTradingFee(response, market)

end
function fetchTradingFees(self::Hitbtc, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    (marketType, query) = self.handleMarketTypeAndParams("fetchTradingFees", nothing, params);
    if functions.ccxtruthy(marketType == "spot")
        response = Base.fetch(self.privateGetSpotFee(query));
    elseif functions.ccxtruthy(marketType == "swap")
        response = Base.fetch(self.privateGetFuturesFee(query));
    else
        throw(NotSupported(string(self.id, " fetchTradingFees() not support this market type")));
    end
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        fee = self.parseTradingFee(get(response, i + 1, nothing));
        symbol = get(fee, Symbol("symbol"), nothing);
        if functions.ccxtruthy(symbol != nothing)
            result[Symbol(symbol)] = fee;
        end
        i += 1
    end
    return result

end
function fetchOHLCV(self::Hitbtc, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOHLCV", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchOHLCV", symbol, since, limit, timeframe, params, 1000))
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("period") => safeString(self.timeframes, timeframe, timeframe)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("from")] = self.iso8601(since);
    end
    (request, params) = self.handleUntilOption("until", request, params);
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 1000);
    end
    price = safeString(params, "price");
    params = omit(params, "price");
    response = [];
    if functions.ccxtruthy(price == "mark")
        response = Base.fetch(self.publicGetPublicFuturesCandlesMarkPriceSymbol(extend(request, params)));
    elseif functions.ccxtruthy(price == "index")
        response = Base.fetch(self.publicGetPublicFuturesCandlesIndexPriceSymbol(extend(request, params)));
    else
        if functions.ccxtruthy(price == "premiumIndex")
            response = Base.fetch(self.publicGetPublicFuturesCandlesPremiumIndexSymbol(extend(request, params)));
        else
            response = Base.fetch(self.publicGetPublicCandlesSymbol(extend(request, params)));
        end

    end
    ohlcvs = toArray(response);
    return self.parseOHLCVs(ohlcvs, market, timeframe, since, limit)

end
function parseOHLCV(self::Hitbtc, ohlcv, market=nothing)
    return [self.parse8601(safeString(ohlcv, "timestamp")), self.safeNumber(ohlcv, "open"), self.safeNumber(ohlcv, "max"), self.safeNumber(ohlcv, "min"), self.safeNumber(ohlcv, "close"), self.safeNumber(ohlcv, "volume")]

end
function fetchClosedOrders(self::Hitbtc, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("from")] = self.iso8601(since);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    marketType = nothing;
    marginMode = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchClosedOrders", market, params);
    (marginMode, params) = self.handleMarginModeAndParams("fetchClosedOrders", params);
    params = omit(params, ["marginMode", "margin"]);
    if functions.ccxtruthy(marginMode != nothing)
        response = Base.fetch(self.privateGetMarginHistoryOrder(extend(request, params)));
    else
        if functions.ccxtruthy(marketType == "spot")
            response = Base.fetch(self.privateGetSpotHistoryOrder(extend(request, params)));
        elseif functions.ccxtruthy(marketType == "swap")
            response = Base.fetch(self.privateGetFuturesHistoryOrder(extend(request, params)));
        else
            if functions.ccxtruthy(marketType == "margin")
                response = Base.fetch(self.privateGetMarginHistoryOrder(extend(request, params)));
            else
                throw(NotSupported(string(self.id, " fetchClosedOrders() not support this market type")));
            end

        end
    end
    parsed = self.parseOrders(response, market, since, limit);
    return self.filterByArray(parsed, "status", ["closed", "canceled"], false)

end
function fetchOrder(self::Hitbtc, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    request = Dict{Symbol, Any}(
        Symbol("client_order_id") => id
    );
    marketType = nothing;
    marginMode = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchOrder", market, params);
    (marginMode, params) = self.handleMarginModeAndParams("fetchOrder", params);
    params = omit(params, ["marginMode", "margin"]);
    if functions.ccxtruthy(marginMode != nothing)
        response = Base.fetch(self.privateGetMarginHistoryOrder(extend(request, params)));
    else
        if functions.ccxtruthy(marketType == "spot")
            response = Base.fetch(self.privateGetSpotHistoryOrder(extend(request, params)));
        elseif functions.ccxtruthy(marketType == "swap")
            response = Base.fetch(self.privateGetFuturesHistoryOrder(extend(request, params)));
        else
            if functions.ccxtruthy(marketType == "margin")
                response = Base.fetch(self.privateGetMarginHistoryOrder(extend(request, params)));
            else
                throw(NotSupported(string(self.id, " fetchOrder() not support this market type")));
            end

        end
    end
    order = self.safeDict(response, 0, Dict{Symbol, Any}());
    return self.parseOrder(order, market)

end
function fetchOrderTrades(self::Hitbtc, id, symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
    marketType = nothing;
    marginMode = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchOrderTrades", market, params);
    (marginMode, params) = self.handleMarginModeAndParams("fetchOrderTrades", params);
    params = omit(params, ["marginMode", "margin"]);
    response = [];
    if functions.ccxtruthy(marginMode != nothing)
        response = Base.fetch(self.privateGetMarginHistoryTrade(extend(request, params)));
    else
        if functions.ccxtruthy(marketType == "spot")
            response = Base.fetch(self.privateGetSpotHistoryTrade(extend(request, params)));
        elseif functions.ccxtruthy(marketType == "swap")
            response = Base.fetch(self.privateGetFuturesHistoryTrade(extend(request, params)));
        else
            if functions.ccxtruthy(marketType == "margin")
                response = Base.fetch(self.privateGetMarginHistoryTrade(extend(request, params)));
            else
                throw(NotSupported(string(self.id, " fetchOrderTrades() not support this market type")));
            end

        end
    end
    return self.parseTrades(response, market, since, limit)

end
function fetchOpenOrders(self::Hitbtc, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    marketType = nothing;
    marginMode = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchOpenOrders", market, params);
    (marginMode, params) = self.handleMarginModeAndParams("fetchOpenOrders", params);
    params = omit(params, ["marginMode", "margin"]);
    if functions.ccxtruthy(marginMode != nothing)
        response = Base.fetch(self.privateGetMarginOrder(extend(request, params)));
    else
        if functions.ccxtruthy(marketType == "spot")
            response = Base.fetch(self.privateGetSpotOrder(extend(request, params)));
        elseif functions.ccxtruthy(marketType == "swap")
            response = Base.fetch(self.privateGetFuturesOrder(extend(request, params)));
        else
            if functions.ccxtruthy(marketType == "margin")
                response = Base.fetch(self.privateGetMarginOrder(extend(request, params)));
            else
                throw(NotSupported(string(self.id, " fetchOpenOrders() not support this market type")));
            end

        end
    end
    return self.parseOrders(response, market, since, limit)

end
function fetchOpenOrder(self::Hitbtc, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    request = Dict{Symbol, Any}(
        Symbol("client_order_id") => id
    );
    marketType = nothing;
    marginMode = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchOpenOrder", market, params);
    (marginMode, params) = self.handleMarginModeAndParams("fetchOpenOrder", params);
    params = omit(params, ["marginMode", "margin"]);
    if functions.ccxtruthy(marginMode != nothing)
        response = Base.fetch(self.privateGetMarginOrderClientOrderId(extend(request, params)));
    else
        if functions.ccxtruthy(marketType == "spot")
            response = Base.fetch(self.privateGetSpotOrderClientOrderId(extend(request, params)));
        elseif functions.ccxtruthy(marketType == "swap")
            response = Base.fetch(self.privateGetFuturesOrderClientOrderId(extend(request, params)));
        else
            if functions.ccxtruthy(marketType == "margin")
                response = Base.fetch(self.privateGetMarginOrderClientOrderId(extend(request, params)));
            else
                throw(NotSupported(string(self.id, " fetchOpenOrder() not support this market type")));
            end

        end
    end
    return self.parseOrder(response, market)

end
function cancelAllOrders(self::Hitbtc, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    marketType = nothing;
    marginMode = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("cancelAllOrders", market, params);
    (marginMode, params) = self.handleMarginModeAndParams("cancelAllOrders", params);
    params = omit(params, ["marginMode", "margin"]);
    if functions.ccxtruthy(marginMode != nothing)
        response = Base.fetch(self.privateDeleteMarginOrder(extend(request, params)));
    else
        if functions.ccxtruthy(marketType == "spot")
            response = Base.fetch(self.privateDeleteSpotOrder(extend(request, params)));
        elseif functions.ccxtruthy(marketType == "swap")
            response = Base.fetch(self.privateDeleteFuturesOrder(extend(request, params)));
        else
            if functions.ccxtruthy(marketType == "margin")
                response = Base.fetch(self.privateDeleteMarginOrder(extend(request, params)));
            else
                throw(NotSupported(string(self.id, " cancelAllOrders() not support this market type")));
            end

        end
    end
    return self.parseOrders(response, market)

end
function cancelOrder(self::Hitbtc, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    request = Dict{Symbol, Any}(
        Symbol("client_order_id") => id
    );
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    marketType = nothing;
    marginMode = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("cancelOrder", market, params);
    (marginMode, params) = self.handleMarginModeAndParams("cancelOrder", params);
    params = omit(params, ["marginMode", "margin"]);
    if functions.ccxtruthy(marginMode != nothing)
        response = Base.fetch(self.privateDeleteMarginOrderClientOrderId(extend(request, params)));
    else
        if functions.ccxtruthy(marketType == "spot")
            response = Base.fetch(self.privateDeleteSpotOrderClientOrderId(extend(request, params)));
        elseif functions.ccxtruthy(marketType == "swap")
            response = Base.fetch(self.privateDeleteFuturesOrderClientOrderId(extend(request, params)));
        else
            if functions.ccxtruthy(marketType == "margin")
                response = Base.fetch(self.privateDeleteMarginOrderClientOrderId(extend(request, params)));
            else
                throw(NotSupported(string(self.id, " cancelOrder() not support this market type")));
            end

        end
    end
    return self.parseOrder(response, market)

end
function editOrder(self::Hitbtc, id, symbol, type_var, side, amount=nothing, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    request = Dict{Symbol, Any}(
        Symbol("client_order_id") => id,
        Symbol("quantity") => self.amountToPrecision(symbol, amount)
    );
    if functions.ccxtruthy(@functions.ccxt_or((type_var == "limit"), (type_var == "stopLimit")))
        if functions.ccxtruthy(price == nothing)
            throw(ExchangeError(string(self.id, " editOrder() limit order requires price")));
        end
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    marketType = nothing;
    marginMode = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("editOrder", market, params);
    (marginMode, params) = self.handleMarginModeAndParams("editOrder", params);
    params = omit(params, ["marginMode", "margin"]);
    if functions.ccxtruthy(marginMode != nothing)
        response = Base.fetch(self.privatePatchMarginOrderClientOrderId(extend(request, params)));
    else
        if functions.ccxtruthy(marketType == "spot")
            response = Base.fetch(self.privatePatchSpotOrderClientOrderId(extend(request, params)));
        elseif functions.ccxtruthy(marketType == "swap")
            response = Base.fetch(self.privatePatchFuturesOrderClientOrderId(extend(request, params)));
        else
            if functions.ccxtruthy(marketType == "margin")
                response = Base.fetch(self.privatePatchMarginOrderClientOrderId(extend(request, params)));
            else
                throw(NotSupported(string(self.id, " editOrder() not support this market type")));
            end

        end
    end
    return self.parseOrder(response, market)

end
function createOrder(self::Hitbtc, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("createOrder", market, params);
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("createOrder", params);
    (request, params) = self.createOrderRequest(market, marketType, type_var, side, amount, price, marginMode, params);
    if functions.ccxtruthy(marketType == "swap")
        response = Base.fetch(self.privatePostFuturesOrder(extend(request, params)));
    elseif functions.ccxtruthy(@functions.ccxt_or((marketType == "margin"), (marginMode != nothing)))
        response = Base.fetch(self.privatePostMarginOrder(extend(request, params)));
    else
        response = Base.fetch(self.privatePostSpotOrder(extend(request, params)));
    end
    return self.parseOrder(response, market)

end
function createOrderRequest(self::Hitbtc, market, marketType, type_var, side, amount, price=nothing, marginMode=nothing, params=Dict())
    isLimit = (type_var == "limit");
    reduceOnly = safeValue(params, "reduceOnly");
    timeInForce = safeString(params, "timeInForce");
    triggerPrice = self.safeNumberN(params, ["triggerPrice", "stopPrice", "stop_price"]);
    isPostOnly = self.isPostOnly(type_var == "market", nothing, params);
    request = Dict{Symbol, Any}(
        Symbol("type") => type_var,
        Symbol("side") => side,
        Symbol("quantity") => self.amountToPrecision(get(market, Symbol("symbol"), nothing), amount),
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(reduceOnly != nothing)
        if functions.ccxtruthy(@functions.ccxt_and((get(market, Symbol("type"), nothing) != "swap"), (get(market, Symbol("type"), nothing) != "margin")))
            throw(InvalidOrder(string(self.id, " createOrder() does not support reduce_only for ", get(market, Symbol("type"), nothing), " orders, reduce_only orders are supported for swap and margin markets only")));
        end
    end
    if functions.ccxtruthy(reduceOnly)
        request[Symbol("reduce_only")] = reduceOnly;
    end
    if functions.ccxtruthy(isPostOnly)
        request[Symbol("post_only")] = true;
    end
    if functions.ccxtruthy(timeInForce != nothing)
        request[Symbol("time_in_force")] = timeInForce;
    end
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(isLimit, (type_var == "stopLimit")), (type_var == "takeProfitLimit")))
        if functions.ccxtruthy(price == nothing)
            throw(ExchangeError(string(self.id, " createOrder() requires a price argument for limit orders")));
        end
        request[Symbol("price")] = self.priceToPrecision(get(market, Symbol("symbol"), nothing), price);
    end
    if functions.ccxtruthy((timeInForce == "GTD"))
        expireTime = safeString(params, "expire_time");
        if functions.ccxtruthy(expireTime == nothing)
            throw(ExchangeError(string(self.id, " createOrder() requires an expire_time parameter for a GTD order")));
        end
    end
    if functions.ccxtruthy(triggerPrice != nothing)
        request[Symbol("stop_price")] = self.priceToPrecision(get(market, Symbol("symbol"), nothing), triggerPrice);
        if functions.ccxtruthy(isLimit)
            request[Symbol("type")] = "stopLimit";
        elseif functions.ccxtruthy(type_var == "market")
            request[Symbol("type")] = "stopMarket";
        end
    elseif functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or((type_var == "stopLimit"), (type_var == "stopMarket")), (type_var == "takeProfitLimit")), (type_var == "takeProfitMarket")))
        throw(ExchangeError(string(self.id, " createOrder() requires a triggerPrice parameter for stop-loss and take-profit orders")));
    end
    params = omit(params, ["triggerPrice", "timeInForce", "stopPrice", "stop_price", "reduceOnly", "postOnly"]);
    if functions.ccxtruthy(marketType == "swap")
        if functions.ccxtruthy(marginMode == nothing)
            marginMode = "cross";
        end
        request[Symbol("margin_mode")] = marginMode;
    end
    return [request, params]

end
function parseOrderStatus(self::Hitbtc, status)
    statuses = Dict{Symbol, Any}(
        Symbol("new") => "open",
        Symbol("suspended") => "open",
        Symbol("partiallyFilled") => "open",
        Symbol("filled") => "closed",
        Symbol("canceled") => "canceled",
        Symbol("expired") => "failed"
    );
    if functions.ccxtruthy(status == nothing)
            return nothing
    end
    return safeString(statuses, status, status)

end
function parseOrder(self::Hitbtc, order, market=nothing)
    id = safeString(order, "client_order_id");
    side = safeString(order, "side");
    type_var = safeString(order, "type");
    amount = safeString(order, "quantity");
    price = safeString(order, "price");
    average = safeString(order, "price_average");
    created = safeString(order, "created_at");
    timestamp = self.parse8601(created);
    updated = safeString(order, "updated_at");
    lastTradeTimestamp = nothing;
    if functions.ccxtruthy(updated != created)
        lastTradeTimestamp = self.parse8601(updated);
    end
    filled = safeString(order, "quantity_cumulative");
    status = self.parseOrderStatus(safeString(order, "status"));
    marketId = safeString(order, "symbol");
    market = self.safeMarket(marketId, market);
    symbol = get(market, Symbol("symbol"), nothing);
    postOnly = safeValue(order, "post_only");
    timeInForce = safeString(order, "time_in_force");
    rawTrades = safeValue(order, "trades");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => id,
    Symbol("clientOrderId") => id,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => lastTradeTimestamp,
    Symbol("lastUpdateTimestamp") => lastTradeTimestamp,
    Symbol("symbol") => symbol,
    Symbol("price") => price,
    Symbol("amount") => amount,
    Symbol("type") => type_var,
    Symbol("side") => side,
    Symbol("timeInForce") => timeInForce,
    Symbol("postOnly") => postOnly,
    Symbol("reduceOnly") => safeValue(order, "reduce_only"),
    Symbol("filled") => filled,
    Symbol("remaining") => nothing,
    Symbol("cost") => nothing,
    Symbol("status") => status,
    Symbol("average") => average,
    Symbol("trades") => rawTrades,
    Symbol("fee") => nothing,
    Symbol("triggerPrice") => safeString(order, "stop_price"),
    Symbol("takeProfitPrice") => nothing,
    Symbol("stopLossPrice") => nothing
), market)

end
function fetchMarginModes(self::Hitbtc, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbols != nothing)
        symbols = self.marketSymbols(symbols);
        market = self.market(get(symbols, 1, nothing));
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchMarginMode", market, params);
    if functions.ccxtruthy(marketType == "margin")
        response = Base.fetch(self.privateGetMarginConfig(params));
    elseif functions.ccxtruthy(marketType == "swap")
        response = Base.fetch(self.privateGetFuturesConfig(params));
    else
        throw(BadSymbol(string(self.id, " fetchMarginModes () supports swap contracts and margin only")));
    end
    config = self.safeList(response, "config", []);
    return self.parseMarginModes(config, symbols, "symbol")

end
function parseMarginMode(self::Hitbtc, marginMode, market=nothing)
    marketId = safeString(marginMode, "symbol");
    return Dict{Symbol, Any}(
    Symbol("info") => marginMode,
    Symbol("symbol") => self.safeSymbol(marketId, market),
    Symbol("marginMode") => safeStringLower(marginMode, "margin_mode")
)

end
function transfer(self::Hitbtc, code, amount, fromAccount, toAccount, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    requestAmount = self.currencyToPrecision(code, amount);
    accountsByType = safeValue(self.options, "accountsByType", Dict{Symbol, Any}());
    fromAccount = lowercase(fromAccount);
    toAccount = lowercase(toAccount);
    fromId = safeString(accountsByType, fromAccount, fromAccount);
    toId = safeString(accountsByType, toAccount, toAccount);
    if functions.ccxtruthy(fromId == toId)
        throw(BadRequest(string(self.id, " transfer() fromAccount and toAccount arguments cannot be the same account")));
    end
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => requestAmount,
        Symbol("source") => fromId,
        Symbol("destination") => toId
    );
    response = Base.fetch(self.privatePostWalletTransfer(extend(request, params)));
    return self.parseTransfer(response, currency)

end
function parseTransfer(self::Hitbtc, transfer, currency=nothing)
    return Dict{Symbol, Any}(
    Symbol("id") => safeString(transfer, 0),
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("currency") => self.safeCurrencyCode(nothing, currency),
    Symbol("amount") => nothing,
    Symbol("fromAccount") => nothing,
    Symbol("toAccount") => nothing,
    Symbol("status") => nothing,
    Symbol("info") => transfer
)

end
function convertCurrencyNetwork(self::Hitbtc, code, amount, fromNetwork, toNetwork, params)
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(code != "USDT")
        throw(ExchangeError(string(self.id, " convertCurrencyNetwork() only supports USDT currently")));
    end
    networks = safeValue(self.options, "networks", Dict{Symbol, Any}());
    fromNetwork = uppercase(fromNetwork);
    toNetwork = uppercase(toNetwork);
    fromNetwork = safeString(networks, fromNetwork);
    toNetwork = safeString(networks, toNetwork);
    if functions.ccxtruthy(fromNetwork == toNetwork)
        throw(BadRequest(string(self.id, " convertCurrencyNetwork() fromNetwork cannot be the same as toNetwork")));
    end
    if functions.ccxtruthy(@functions.ccxt_or((fromNetwork == nothing), (toNetwork == nothing)))
        keys_var = objectKeys(networks);
        throw(ArgumentsRequired(string(self.id, " convertCurrencyNetwork() requires a fromNetwork parameter and a toNetwork parameter, supported networks are ", join(keys_var, ", "))));
    end
    request = Dict{Symbol, Any}(
        Symbol("from_currency") => fromNetwork,
        Symbol("to_currency") => toNetwork,
        Symbol("amount") => self.currencyToPrecision(code, amount)
    );
    response = Base.fetch(self.privatePostWalletConvert(extend(request, params)));
    return Dict{Symbol, Any}(
    Symbol("info") => response
)

end
function withdraw(self::Hitbtc, code, amount, address, tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    self.checkAddress(address);
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => amount,
        Symbol("address") => address
    );
    if functions.ccxtruthy(tag != nothing)
        request[Symbol("payment_id")] = tag;
    end
    networks = safeValue(self.options, "networks", Dict{Symbol, Any}());
    network = safeStringUpper(params, "network");
    if functions.ccxtruthy(@functions.ccxt_and((network != nothing), (code == "USDT")))
        parsedNetwork = safeString(networks, network);
        if functions.ccxtruthy(parsedNetwork != nothing)
            request[Symbol("network_code")] = parsedNetwork;
        end
        params = omit(params, "network");
    end
    withdrawOptions = safeValue(self.options, "withdraw", Dict{Symbol, Any}());
    includeFee = self.safeBool(withdrawOptions, "includeFee", false);
    if functions.ccxtruthy(includeFee)
        request[Symbol("include_fee")] = true;
    end
    response = Base.fetch(self.privatePostWalletCryptoWithdraw(extend(request, params)));
    return self.parseTransaction(response, currency)

end
function fetchFundingRates(self::Hitbtc, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbols != nothing)
        symbols = self.marketSymbols(symbols);
        market = self.market(get(symbols, 1, nothing));
        queryMarketIds = self.marketIds(symbols);
        request[Symbol("symbols")] =         join(queryMarketIds, ",");
    end
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchFundingRates", market, params);
    if functions.ccxtruthy(type_var != "swap")
        throw(NotSupported(string(self.id, " fetchFundingRates() does not support ", type_var, " markets")));
    end
    response = Base.fetch(self.publicGetPublicFuturesInfo(extend(request, params)));
    marketIds = objectKeys(response);
    fundingRates = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(marketIds)))
        marketId = safeString(marketIds, i);
        if functions.ccxtruthy(marketId == nothing)
            i += 1; continue
        end
        rawFundingRate = safeValue(response, marketId);
        marketInner = self.market(marketId);
        symbol = get(marketInner, Symbol("symbol"), nothing);
        fundingRate = self.parseFundingRate(rawFundingRate, marketInner);
        fundingRates[Symbol(symbol)] = fundingRate;
        i += 1
    end
    return self.filterByArray(fundingRates, "symbol", symbols)

end
function fetchFundingRateHistory(self::Hitbtc, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchFundingRateHistory", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchFundingRateHistory", symbol, since, limit, "8h", params, 1000))
    end
    market = nothing;
    request = Dict{Symbol, Any}();
    (request, params) = self.handleUntilOption("until", request, params);
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        symbol = get(market, Symbol("symbol"), nothing);
        request[Symbol("symbols")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("from")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.publicGetPublicFuturesHistoryFunding(extend(request, params)));
    contracts = objectKeys(response);
    rates = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(contracts)))
        marketId = get(contracts, i + 1, nothing);
        marketInner = self.safeMarket(marketId);
        fundingRateData = self.safeList(response, marketId, []);
        j = 0
        while functions.ccxtruthy(functions.ccxt_lt(j, length(fundingRateData)))
            entry = get(fundingRateData, j + 1, nothing);
            symbolInner = self.safeSymbol(get(marketInner, Symbol("symbol"), nothing));
            fundingRate = self.safeNumber(entry, "funding_rate");
            datetime = safeString(entry, "timestamp");
            push!(rates, Dict{Symbol, Any}(
    Symbol("info") => entry,
    Symbol("symbol") => symbolInner,
    Symbol("fundingRate") => fundingRate,
    Symbol("timestamp") => self.parse8601(datetime),
    Symbol("datetime") => datetime
));
            j += 1
        end
        i += 1
    end
    sorted = sortBy(rates, "timestamp");
    return self.filterBySymbolSinceLimit(sorted, symbol, since, limit)

end
function fetchPositions(self::Hitbtc, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    marketType = nothing;
    marginMode = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchPositions", nothing, params);
    if functions.ccxtruthy(marketType == "spot")
        marketType = "swap";
    end
    (marginMode, params) = self.handleMarginModeAndParams("fetchPositions", params);
    params = omit(params, ["marginMode", "margin"]);
    if functions.ccxtruthy(marginMode != nothing)
        response = Base.fetch(self.privateGetMarginAccount(extend(request, params)));
    else
        if functions.ccxtruthy(marketType == "swap")
            response = Base.fetch(self.privateGetFuturesAccount(extend(request, params)));
        elseif functions.ccxtruthy(marketType == "margin")
            response = Base.fetch(self.privateGetMarginAccount(extend(request, params)));
        else
            throw(NotSupported(string(self.id, " fetchPositions() not support this market type")));
        end
    end
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        push!(result, self.parsePosition(get(response, i + 1, nothing)));
        i += 1
    end
    return result

end
function fetchPosition(self::Hitbtc, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    marketType = nothing;
    marginMode = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchPosition", nothing, params);
    (marginMode, params) = self.handleMarginModeAndParams("fetchPosition", params);
    params = omit(params, ["marginMode", "margin"]);
    if functions.ccxtruthy(marginMode != nothing)
        response = Base.fetch(self.privateGetMarginAccountIsolatedSymbol(extend(request, params)));
    else
        if functions.ccxtruthy(marketType == "swap")
            response = Base.fetch(self.privateGetFuturesAccountIsolatedSymbol(extend(request, params)));
        elseif functions.ccxtruthy(marketType == "margin")
            response = Base.fetch(self.privateGetMarginAccountIsolatedSymbol(extend(request, params)));
        else
            throw(NotSupported(string(self.id, " fetchPosition() not support this market type")));
        end
    end
    return self.parsePosition(response, market)

end
function parsePosition(self::Hitbtc, position, market=nothing)
    marginMode = safeString(position, "type");
    leverage = self.safeNumber(position, "leverage");
    datetime = safeString(position, "updated_at");
    positions = safeValue(position, "positions", []);
    liquidationPrice = nothing;
    entryPrice = nothing;
    contracts = nothing;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(positions)))
        entry = get(positions, i + 1, nothing);
        liquidationPrice = self.safeNumber(entry, "price_liquidation");
        entryPrice = self.safeNumber(entry, "price_entry");
        contracts = self.safeNumber(entry, "quantity");
        i += 1
    end
    currencies = safeValue(position, "currencies", []);
    collateral = nothing;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(currencies)))
        entry = get(currencies, i + 1, nothing);
        collateral = self.safeNumber(entry, "margin_balance");
        i += 1
    end
    marketId = safeString(position, "symbol");
    market = self.safeMarket(marketId, market);
    symbol = get(market, Symbol("symbol"), nothing);
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => nothing,
    Symbol("symbol") => symbol,
    Symbol("notional") => nothing,
    Symbol("marginMode") => marginMode,
    Symbol("marginType") => marginMode,
    Symbol("liquidationPrice") => liquidationPrice,
    Symbol("entryPrice") => entryPrice,
    Symbol("unrealizedPnl") => nothing,
    Symbol("percentage") => nothing,
    Symbol("contracts") => contracts,
    Symbol("contractSize") => nothing,
    Symbol("markPrice") => nothing,
    Symbol("lastPrice") => nothing,
    Symbol("side") => nothing,
    Symbol("hedged") => nothing,
    Symbol("timestamp") => self.parse8601(datetime),
    Symbol("datetime") => datetime,
    Symbol("lastUpdateTimestamp") => nothing,
    Symbol("maintenanceMargin") => nothing,
    Symbol("maintenanceMarginPercentage") => nothing,
    Symbol("collateral") => collateral,
    Symbol("initialMargin") => nothing,
    Symbol("initialMarginPercentage") => nothing,
    Symbol("leverage") => leverage,
    Symbol("marginRatio") => nothing,
    Symbol("stopLossPrice") => nothing,
    Symbol("takeProfitPrice") => nothing
))

end
function parseOpenInterest(self::Hitbtc, interest, market=nothing)
    datetime = safeString(interest, "timestamp");
    value = self.safeNumber(interest, "open_interest");
    return self.safeOpenInterest(Dict{Symbol, Any}(
    Symbol("symbol") => self.safeSymbol(nothing, market),
    Symbol("openInterestAmount") => nothing,
    Symbol("openInterestValue") => value,
    Symbol("timestamp") => self.parse8601(datetime),
    Symbol("datetime") => datetime,
    Symbol("info") => interest
), market)

end
function fetchOpenInterests(self::Hitbtc, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    symbols = self.marketSymbols(symbols);
    marketIds = nothing;
    if functions.ccxtruthy(symbols != nothing)
        marketIds = self.marketIds(symbols);
        request[Symbol("symbols")] =         join(marketIds, ",");
    end
    response = Base.fetch(self.publicGetPublicFuturesInfo(extend(request, params)));
    results = [];
    markets = objectKeys(response);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(markets)))
        marketId = get(markets, i + 1, nothing);
        marketInner = self.safeMarket(marketId);
        openInterest = self.safeDict(response, marketId, Dict{Symbol, Any}());
        push!(results, self.parseOpenInterest(openInterest, marketInner));
        i += 1
    end
    return self.filterByArray(results, "symbol", symbols)

end
function fetchOpenInterest(self::Hitbtc, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
        throw(BadSymbol(string(self.id, " fetchOpenInterest() supports swap contracts only")));
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetPublicFuturesInfoSymbol(extend(request, params)));
    return self.parseOpenInterest(response, market)

end
function fetchFundingRate(self::Hitbtc, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
        throw(BadSymbol(string(self.id, " fetchFundingRate() supports swap contracts only")));
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetPublicFuturesInfoSymbol(extend(request, params)));
    return self.parseFundingRate(response, market)

end
function parseFundingRate(self::Hitbtc, contract, market=nothing)
    fundingDateTime = safeString(contract, "next_funding_time");
    datetime = safeString(contract, "timestamp");
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => self.safeSymbol(nothing, market),
    Symbol("markPrice") => self.safeNumber(contract, "mark_price"),
    Symbol("indexPrice") => self.safeNumber(contract, "index_price"),
    Symbol("interestRate") => self.safeNumber(contract, "interest_rate"),
    Symbol("estimatedSettlePrice") => nothing,
    Symbol("timestamp") => self.parse8601(datetime),
    Symbol("datetime") => datetime,
    Symbol("fundingRate") => self.safeNumber(contract, "funding_rate"),
    Symbol("fundingTimestamp") => self.parse8601(fundingDateTime),
    Symbol("fundingDatetime") => fundingDateTime,
    Symbol("nextFundingRate") => self.safeNumber(contract, "indicative_funding_rate"),
    Symbol("nextFundingTimestamp") => nothing,
    Symbol("nextFundingDatetime") => nothing,
    Symbol("previousFundingRate") => nothing,
    Symbol("previousFundingTimestamp") => nothing,
    Symbol("previousFundingDatetime") => nothing,
    Symbol("interval") => nothing
)

end
function modifyMarginHelper(self::Hitbtc, symbol, amount, type_var, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    leverage = safeString(params, "leverage");
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        if functions.ccxtruthy(leverage == nothing)
            throw(ArgumentsRequired(string(self.id, " modifyMarginHelper() requires a leverage parameter for swap markets")));
        end
    end
    stringAmount = numberToString(amount);
    if functions.ccxtruthy(stringAmount != "0")
        amount = self.amountToPrecision(symbol, stringAmount);
    else
        amount = "0";
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("margin_balance") => amount
    );
    if functions.ccxtruthy(leverage != nothing)
        request[Symbol("leverage")] = leverage;
    end
    marketType = nothing;
    marginMode = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("modifyMarginHelper", market, params);
    (marginMode, params) = self.handleMarginModeAndParams("modifyMarginHelper", params);
    if functions.ccxtruthy(marketType == "swap")
        response = Base.fetch(self.privatePutFuturesAccountIsolatedSymbol(extend(request, params)));
    elseif functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or((marketType == "margin"), (marketType == "spot")), (marginMode == "isolated")))
        response = Base.fetch(self.privatePutMarginAccountIsolatedSymbol(extend(request, params)));
    else
        throw(NotSupported(string(self.id, " modifyMarginHelper() not support this market type")));
    end
    parsedAmount = self.parseNumber(amount);
    return extend(self.parseMarginModification(response, market), Dict{Symbol, Any}(
    Symbol("amount") => parsedAmount,
    Symbol("type") => type_var
))

end
function parseMarginModification(self::Hitbtc, data, market=nothing)
    currencies = safeValue(data, "currencies", []);
    currencyInfo = safeValue(currencies, 0);
    datetime = safeString(data, "updated_at");
    return Dict{Symbol, Any}(
    Symbol("info") => data,
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("type") => nothing,
    Symbol("marginMode") => "isolated",
    Symbol("amount") => nothing,
    Symbol("total") => nothing,
    Symbol("code") => safeString(currencyInfo, "code"),
    Symbol("status") => nothing,
    Symbol("timestamp") => self.parse8601(datetime),
    Symbol("datetime") => datetime
)

end
function reduceMargin(self::Hitbtc, symbol, amount, params=Dict())
    if functions.ccxtruthy(numberToString(amount) != "0")
        throw(BadRequest(string(self.id, " reduceMargin() on hitbtc requires the amount to be 0 and that will remove the entire margin amount")));
    end
    return Base.fetch(self.modifyMarginHelper(symbol, amount, "reduce", params))

end
function addMargin(self::Hitbtc, symbol, amount, params=Dict())
    return Base.fetch(self.modifyMarginHelper(symbol, amount, "add", params))

end
function fetchLeverage(self::Hitbtc, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("fetchLeverage", params);
    params = omit(params, ["marginMode", "margin"]);
    if functions.ccxtruthy(marginMode != nothing)
        response = Base.fetch(self.privateGetMarginAccountIsolatedSymbol(extend(request, params)));
    else
        if functions.ccxtruthy(get(market, Symbol("type"), nothing) == "spot")
            response = Base.fetch(self.privateGetMarginAccountIsolatedSymbol(extend(request, params)));
        elseif functions.ccxtruthy(get(market, Symbol("type"), nothing) == "swap")
            response = Base.fetch(self.privateGetFuturesAccountIsolatedSymbol(extend(request, params)));
        else
            if functions.ccxtruthy(get(market, Symbol("type"), nothing) == "margin")
                response = Base.fetch(self.privateGetMarginAccountIsolatedSymbol(extend(request, params)));
            else
                throw(NotSupported(string(self.id, " fetchLeverage() not support this market type")));
            end

        end
    end
    return self.parseLeverage(response, market)

end
function parseLeverage(self::Hitbtc, leverage, market=nothing)
    marketId = safeString(leverage, "symbol");
    leverageValue = safeInteger(leverage, "leverage");
    return Dict{Symbol, Any}(
    Symbol("info") => leverage,
    Symbol("symbol") => self.safeSymbol(marketId, market),
    Symbol("marginMode") => safeStringLower(leverage, "type"),
    Symbol("longLeverage") => leverageValue,
    Symbol("shortLeverage") => leverageValue
)

end
function setLeverage(self::Hitbtc, leverage, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setLeverage() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(get(params, Symbol("margin_balance"), nothing) == nothing)
        throw(ArgumentsRequired(string(self.id, " setLeverage() requires a margin_balance parameter that will transfer margin to the specified trading pair")));
    end
    market = self.market(symbol);
    amount = self.safeNumber(params, "margin_balance");
    maxLeverage = safeInteger(get(get(market, Symbol("limits"), nothing), Symbol("leverage"), nothing), "max", 50);
    if functions.ccxtruthy(get(market, Symbol("type"), nothing) != "swap")
        throw(BadSymbol(string(self.id, " setLeverage() supports swap contracts only")));
    end
    if functions.ccxtruthy(@functions.ccxt_or((functions.ccxt_lt(leverage, 1)), (functions.ccxt_gt(leverage, maxLeverage))))
        throw(BadRequest(string(self.id, " setLeverage() leverage should be between 1 and ", maxLeverage, " for ", symbol)));
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("leverage") => string(leverage),
        Symbol("margin_balance") => self.amountToPrecision(symbol, amount)
    );
    return Base.fetch(self.privatePutFuturesAccountIsolatedSymbol(extend(request, params)))

end
function fetchDepositWithdrawFees(self::Hitbtc, codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.publicGetPublicCurrency(params));
    return self.parseDepositWithdrawFees(response, codes)

end
function parseDepositWithdrawFee(self::Hitbtc, fee, currency=nothing)
    networks = safeValue(fee, "networks", []);
    result = self.depositWithdrawFee(fee);
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(networks)))
        networkEntry = get(networks, j + 1, nothing);
        networkId = safeString(networkEntry, "network");
        code = safeString(currency, "code");
        networkCode = self.networkIdToCode(networkId, code);
        networkCode = functions.ccxtruthy((networkCode != nothing)) ? uppercase(networkCode) : nothing;
        withdrawFee = self.safeNumber(networkEntry, "payout_fee");
        isDefault = safeValue(networkEntry, "default");
        withdrawResult = Dict{Symbol, Any}(
            Symbol("fee") => withdrawFee,
            Symbol("percentage") => functions.ccxtruthy((withdrawFee != nothing)) ? false : nothing
        );
        if functions.ccxtruthy(isDefault)
            result[Symbol("withdraw")] = withdrawResult;
        end
        if functions.ccxtruthy(networkCode != nothing)
            result[Symbol("networks")][Symbol(networkCode)] = Dict{Symbol, Any}(
                Symbol("withdraw") => withdrawResult,
                Symbol("deposit") => Dict{Symbol, Any}(
                    Symbol("fee") => nothing,
                    Symbol("percentage") => nothing
                )
            );
        end
        j += 1
    end
    return result

end
function closePosition(self::Hitbtc, symbol, side=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("closePosition", params, "cross");
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("margin_mode") => marginMode
    );
    response = Base.fetch(self.privateDeleteFuturesPositionMarginModeSymbol(extend(request, params)));
    return self.parseOrder(response, market)

end
function handleMarginModeAndParams(self::Hitbtc, methodName, params=Dict(), defaultValue=nothing)
    defaultType = safeString(self.options, "defaultType");
    isMargin = self.safeBool(params, "margin", false);
    marginMode = nothing;
    (marginMode, params) = handleMarginModeAndParams(self.parent, methodName, params, defaultValue);
    if functions.ccxtruthy(marginMode == nothing)
        if functions.ccxtruthy(@functions.ccxt_or((defaultType == "margin"), (isMargin)))
            marginMode = "isolated";
        end
    end
    return [marginMode, params]

end
function handleErrors(self::Hitbtc, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    error = safeValue(response, "error");
    errorCode = safeString(error, "code");
    if functions.ccxtruthy(errorCode != nothing)
        feedback = string(self.id, " ", body);
        message = safeString2(error, "message", "description");
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), errorCode, feedback);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), message, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end
function sign(self::Hitbtc, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    query = omit(params, self.extractParams(path));
    implodedPath = self.implodeParams(path, params);
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing), "/", implodedPath);
    getRequest = nothing;
    keys_var = objectKeys(query);
    queryLength = length(keys_var);
    headers = Dict{Symbol, Any}(
        Symbol("Content-Type") => "application/json"
    );
    if functions.ccxtruthy(method == "GET")
        if functions.ccxtruthy(queryLength)
            getRequest = string("?", self.urlencode(query));
            url = string(url, getRequest);
        end
    else
        body = json(params);
    end
    if functions.ccxtruthy(api == "private")
        self.checkRequiredCredentials();
        timestamp = string(self.nonce());
        payload = [method, string("/api/3/", implodedPath)];
        if functions.ccxtruthy(method == "GET")
            if functions.ccxtruthy(getRequest != nothing)
                                push!(payload, getRequest);
            end
        else
            if functions.ccxtruthy(body != nothing)
                                push!(payload, body);
            end
        end
                push!(payload, timestamp);
        payloadString = join(payload, "");
        signature = self.hmac(self.encode(payloadString), self.encode(self.secret), sha256, "hex");
        secondPayload = string(self.apiKey, ":", signature, ":", timestamp);
        encoded = self.stringToBase64(secondPayload);
        headers[Symbol("Authorization")] = string("HS256 ", encoded);
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
Base.getproperty(self::Hitbtc, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetPublicCurrency(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "public/currency", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicCurrencyCurrency(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "public/currency/{currency}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicSymbol(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "public/symbol", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicSymbolSymbol(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "public/symbol/{symbol}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicTicker(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "public/ticker", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicTickerSymbol(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "public/ticker/{symbol}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicPriceRate(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "public/price/rate", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicPriceHistory(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "public/price/history", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicPriceTicker(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "public/price/ticker", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicPriceTickerSymbol(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "public/price/ticker/{symbol}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicTrades(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "public/trades", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicTradesSymbol(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "public/trades/{symbol}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicOrderbook(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "public/orderbook", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicOrderbookSymbol(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "public/orderbook/{symbol}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicCandles(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "public/candles", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicCandlesSymbol(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "public/candles/{symbol}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicConvertedCandles(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "public/converted/candles", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicConvertedCandlesSymbol(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "public/converted/candles/{symbol}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicFuturesInfo(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "public/futures/info", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicFuturesInfoSymbol(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "public/futures/info/{symbol}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicFuturesHistoryFunding(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "public/futures/history/funding", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicFuturesHistoryFundingSymbol(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "public/futures/history/funding/{symbol}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicFuturesCandlesIndexPrice(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "public/futures/candles/index_price", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicFuturesCandlesIndexPriceSymbol(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "public/futures/candles/index_price/{symbol}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicFuturesCandlesMarkPrice(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "public/futures/candles/mark_price", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicFuturesCandlesMarkPriceSymbol(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "public/futures/candles/mark_price/{symbol}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicFuturesCandlesPremiumIndex(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "public/futures/candles/premium_index", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicFuturesCandlesPremiumIndexSymbol(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "public/futures/candles/premium_index/{symbol}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicFuturesCandlesOpenInterest(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "public/futures/candles/open_interest", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicFuturesCandlesOpenInterestSymbol(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "public/futures/candles/open_interest/{symbol}", "public", "GET", params, nothing, nothing, Dict())
end

function privateGetSpotBalance(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "spot/balance", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetSpotBalanceCurrency(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "spot/balance/{currency}", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetSpotOrder(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "spot/order", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetSpotOrderClientOrderId(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "spot/order/{client_order_id}", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetSpotFee(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "spot/fee", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetSpotFeeSymbol(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "spot/fee/{symbol}", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetSpotHistoryOrder(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "spot/history/order", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetSpotHistoryTrade(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "spot/history/trade", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetMarginAccount(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "margin/account", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetMarginAccountIsolatedSymbol(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "margin/account/isolated/{symbol}", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetMarginAccountCrossCurrency(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "margin/account/cross/{currency}", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetMarginOrder(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "margin/order", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetMarginOrderClientOrderId(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "margin/order/{client_order_id}", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetMarginConfig(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "margin/config", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetMarginHistoryOrder(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "margin/history/order", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetMarginHistoryTrade(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "margin/history/trade", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetMarginHistoryPositions(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "margin/history/positions", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetMarginHistoryClearing(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "margin/history/clearing", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetFuturesBalance(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "futures/balance", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetFuturesBalanceCurrency(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "futures/balance/{currency}", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetFuturesAccount(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "futures/account", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetFuturesAccountIsolatedSymbol(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "futures/account/isolated/{symbol}", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetFuturesOrder(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "futures/order", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetFuturesOrderClientOrderId(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "futures/order/{client_order_id}", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetFuturesConfig(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "futures/config", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetFuturesFee(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "futures/fee", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetFuturesFeeSymbol(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "futures/fee/{symbol}", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetFuturesHistoryOrder(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "futures/history/order", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetFuturesHistoryTrade(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "futures/history/trade", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetFuturesHistoryPositions(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "futures/history/positions", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetFuturesHistoryClearing(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "futures/history/clearing", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetWalletBalance(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "wallet/balance", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetWalletBalanceCurrency(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "wallet/balance/{currency}", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetWalletCryptoAddress(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "wallet/crypto/address", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetWalletCryptoAddressRecentDeposit(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "wallet/crypto/address/recent-deposit", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetWalletCryptoAddressRecentWithdraw(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "wallet/crypto/address/recent-withdraw", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetWalletCryptoAddressCheckMine(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "wallet/crypto/address/check-mine", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetWalletTransactions(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "wallet/transactions", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetWalletTransactionsTxId(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "wallet/transactions/{tx_id}", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetWalletCryptoFeeEstimate(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "wallet/crypto/fee/estimate", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetWalletAirdrops(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "wallet/airdrops", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetWalletAmountLocks(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "wallet/amount-locks", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetSubAccount(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "sub-account", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetSubAccountAcl(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "sub-account/acl", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetSubAccountBalanceSubAccID(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "sub-account/balance/{subAccID}", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetSubAccountCryptoAddressSubAccIDCurrency(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "sub-account/crypto/address/{subAccID}/{currency}", "private", "GET", params, nothing, nothing, Dict())
end

function privatePostSpotOrder(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "spot/order", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostSpotOrderList(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "spot/order/list", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostMarginOrder(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "margin/order", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostMarginOrderList(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "margin/order/list", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostFuturesOrder(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "futures/order", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostFuturesOrderList(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "futures/order/list", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostWalletCryptoAddress(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "wallet/crypto/address", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostWalletCryptoWithdraw(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "wallet/crypto/withdraw", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostWalletConvert(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "wallet/convert", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostWalletTransfer(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "wallet/transfer", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostWalletInternalWithdraw(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "wallet/internal/withdraw", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostWalletCryptoCheckOffchainAvailable(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "wallet/crypto/check-offchain-available", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostWalletCryptoFeesEstimate(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "wallet/crypto/fees/estimate", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostWalletAirdropsIdClaim(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "wallet/airdrops/{id}/claim", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostSubAccountFreeze(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "sub-account/freeze", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostSubAccountActivate(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "sub-account/activate", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostSubAccountTransfer(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "sub-account/transfer", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostSubAccountAcl(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "sub-account/acl", "private", "POST", params, nothing, nothing, Dict())
end

function privatePatchSpotOrderClientOrderId(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "spot/order/{client_order_id}", "private", "PATCH", params, nothing, nothing, Dict())
end

function privatePatchMarginOrderClientOrderId(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "margin/order/{client_order_id}", "private", "PATCH", params, nothing, nothing, Dict())
end

function privatePatchFuturesOrderClientOrderId(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "futures/order/{client_order_id}", "private", "PATCH", params, nothing, nothing, Dict())
end

function privateDeleteSpotOrder(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "spot/order", "private", "DELETE", params, nothing, nothing, Dict())
end

function privateDeleteSpotOrderClientOrderId(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "spot/order/{client_order_id}", "private", "DELETE", params, nothing, nothing, Dict())
end

function privateDeleteMarginPosition(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "margin/position", "private", "DELETE", params, nothing, nothing, Dict())
end

function privateDeleteMarginPositionIsolatedSymbol(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "margin/position/isolated/{symbol}", "private", "DELETE", params, nothing, nothing, Dict())
end

function privateDeleteMarginOrder(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "margin/order", "private", "DELETE", params, nothing, nothing, Dict())
end

function privateDeleteMarginOrderClientOrderId(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "margin/order/{client_order_id}", "private", "DELETE", params, nothing, nothing, Dict())
end

function privateDeleteFuturesPosition(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "futures/position", "private", "DELETE", params, nothing, nothing, Dict())
end

function privateDeleteFuturesPositionMarginModeSymbol(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "futures/position/{margin_mode}/{symbol}", "private", "DELETE", params, nothing, nothing, Dict())
end

function privateDeleteFuturesOrder(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "futures/order", "private", "DELETE", params, nothing, nothing, Dict())
end

function privateDeleteFuturesOrderClientOrderId(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "futures/order/{client_order_id}", "private", "DELETE", params, nothing, nothing, Dict())
end

function privateDeleteWalletCryptoWithdrawId(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "wallet/crypto/withdraw/{id}", "private", "DELETE", params, nothing, nothing, Dict())
end

function privatePutMarginAccountIsolatedSymbol(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "margin/account/isolated/{symbol}", "private", "PUT", params, nothing, nothing, Dict())
end

function privatePutFuturesAccountIsolatedSymbol(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "futures/account/isolated/{symbol}", "private", "PUT", params, nothing, nothing, Dict())
end

function privatePutWalletCryptoWithdrawId(self::Hitbtc, params=Dict(), context=Dict())
    return request(self, "wallet/crypto/withdraw/{id}", "private", "PUT", params, nothing, nothing, Dict())
end

function Hitbtc(; kwargs...)
    inst = Hitbtc(Exchange(), describe, nonce, fetchMarkets, fetchCurrencies, parseCurrency, createDepositAddress, fetchDepositAddress, parseBalance, fetchBalance, fetchTicker, fetchTickers, parseTicker, fetchTrades, fetchMyTrades, parseTrade, fetchTransactionsHelper, parseTransactionStatus, parseTransactionType, parseTransaction, fetchDepositsWithdrawals, fetchDeposits, fetchWithdrawals, fetchOrderBooks, fetchOrderBook, parseTradingFee, fetchTradingFee, fetchTradingFees, fetchOHLCV, parseOHLCV, fetchClosedOrders, fetchOrder, fetchOrderTrades, fetchOpenOrders, fetchOpenOrder, cancelAllOrders, cancelOrder, editOrder, createOrder, createOrderRequest, parseOrderStatus, parseOrder, fetchMarginModes, parseMarginMode, transfer, parseTransfer, convertCurrencyNetwork, withdraw, fetchFundingRates, fetchFundingRateHistory, fetchPositions, fetchPosition, parsePosition, parseOpenInterest, fetchOpenInterests, fetchOpenInterest, fetchFundingRate, parseFundingRate, modifyMarginHelper, parseMarginModification, reduceMargin, addMargin, fetchLeverage, parseLeverage, setLeverage, fetchDepositWithdrawFees, parseDepositWithdrawFee, closePosition, handleMarginModeAndParams, handleErrors, sign, publicGetPublicCurrency, publicGetPublicCurrencyCurrency, publicGetPublicSymbol, publicGetPublicSymbolSymbol, publicGetPublicTicker, publicGetPublicTickerSymbol, publicGetPublicPriceRate, publicGetPublicPriceHistory, publicGetPublicPriceTicker, publicGetPublicPriceTickerSymbol, publicGetPublicTrades, publicGetPublicTradesSymbol, publicGetPublicOrderbook, publicGetPublicOrderbookSymbol, publicGetPublicCandles, publicGetPublicCandlesSymbol, publicGetPublicConvertedCandles, publicGetPublicConvertedCandlesSymbol, publicGetPublicFuturesInfo, publicGetPublicFuturesInfoSymbol, publicGetPublicFuturesHistoryFunding, publicGetPublicFuturesHistoryFundingSymbol, publicGetPublicFuturesCandlesIndexPrice, publicGetPublicFuturesCandlesIndexPriceSymbol, publicGetPublicFuturesCandlesMarkPrice, publicGetPublicFuturesCandlesMarkPriceSymbol, publicGetPublicFuturesCandlesPremiumIndex, publicGetPublicFuturesCandlesPremiumIndexSymbol, publicGetPublicFuturesCandlesOpenInterest, publicGetPublicFuturesCandlesOpenInterestSymbol, privateGetSpotBalance, privateGetSpotBalanceCurrency, privateGetSpotOrder, privateGetSpotOrderClientOrderId, privateGetSpotFee, privateGetSpotFeeSymbol, privateGetSpotHistoryOrder, privateGetSpotHistoryTrade, privateGetMarginAccount, privateGetMarginAccountIsolatedSymbol, privateGetMarginAccountCrossCurrency, privateGetMarginOrder, privateGetMarginOrderClientOrderId, privateGetMarginConfig, privateGetMarginHistoryOrder, privateGetMarginHistoryTrade, privateGetMarginHistoryPositions, privateGetMarginHistoryClearing, privateGetFuturesBalance, privateGetFuturesBalanceCurrency, privateGetFuturesAccount, privateGetFuturesAccountIsolatedSymbol, privateGetFuturesOrder, privateGetFuturesOrderClientOrderId, privateGetFuturesConfig, privateGetFuturesFee, privateGetFuturesFeeSymbol, privateGetFuturesHistoryOrder, privateGetFuturesHistoryTrade, privateGetFuturesHistoryPositions, privateGetFuturesHistoryClearing, privateGetWalletBalance, privateGetWalletBalanceCurrency, privateGetWalletCryptoAddress, privateGetWalletCryptoAddressRecentDeposit, privateGetWalletCryptoAddressRecentWithdraw, privateGetWalletCryptoAddressCheckMine, privateGetWalletTransactions, privateGetWalletTransactionsTxId, privateGetWalletCryptoFeeEstimate, privateGetWalletAirdrops, privateGetWalletAmountLocks, privateGetSubAccount, privateGetSubAccountAcl, privateGetSubAccountBalanceSubAccID, privateGetSubAccountCryptoAddressSubAccIDCurrency, privatePostSpotOrder, privatePostSpotOrderList, privatePostMarginOrder, privatePostMarginOrderList, privatePostFuturesOrder, privatePostFuturesOrderList, privatePostWalletCryptoAddress, privatePostWalletCryptoWithdraw, privatePostWalletConvert, privatePostWalletTransfer, privatePostWalletInternalWithdraw, privatePostWalletCryptoCheckOffchainAvailable, privatePostWalletCryptoFeesEstimate, privatePostWalletAirdropsIdClaim, privatePostSubAccountFreeze, privatePostSubAccountActivate, privatePostSubAccountTransfer, privatePostSubAccountAcl, privatePatchSpotOrderClientOrderId, privatePatchMarginOrderClientOrderId, privatePatchFuturesOrderClientOrderId, privateDeleteSpotOrder, privateDeleteSpotOrderClientOrderId, privateDeleteMarginPosition, privateDeleteMarginPositionIsolatedSymbol, privateDeleteMarginOrder, privateDeleteMarginOrderClientOrderId, privateDeleteFuturesPosition, privateDeleteFuturesPositionMarginModeSymbol, privateDeleteFuturesOrder, privateDeleteFuturesOrderClientOrderId, privateDeleteWalletCryptoWithdrawId, privatePutMarginAccountIsolatedSymbol, privatePutFuturesAccountIsolatedSymbol, privatePutWalletCryptoWithdrawId)
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
