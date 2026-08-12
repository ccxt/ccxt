@kwdef mutable struct Poloniex <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    parseOHLCV::Function = parseOHLCV
    fetchOHLCV::Function = fetchOHLCV
    loadMarkets::Function = loadMarkets
    fetchMarkets::Function = fetchMarkets
    fetchSpotMarkets::Function = fetchSpotMarkets
    fetchSwapMarkets::Function = fetchSwapMarkets
    parseMarket::Function = parseMarket
    parseSpotMarket::Function = parseSpotMarket
    parseSwapMarket::Function = parseSwapMarket
    fetchTime::Function = fetchTime
    parseTicker::Function = parseTicker
    fetchTickers::Function = fetchTickers
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    fetchTicker::Function = fetchTicker
    parseTrade::Function = parseTrade
    fetchTrades::Function = fetchTrades
    fetchMyTrades::Function = fetchMyTrades
    parseOrderStatus::Function = parseOrderStatus
    parseOrder::Function = parseOrder
    parseOrderType::Function = parseOrderType
    parseOpenOrders::Function = parseOpenOrders
    fetchOpenOrders::Function = fetchOpenOrders
    fetchClosedOrders::Function = fetchClosedOrders
    createOrder::Function = createOrder
    orderRequest::Function = orderRequest
    editOrder::Function = editOrder
    cancelOrder::Function = cancelOrder
    cancelAllOrders::Function = cancelAllOrders
    fetchOrder::Function = fetchOrder
    fetchOrderStatus::Function = fetchOrderStatus
    fetchOrderTrades::Function = fetchOrderTrades
    parseBalance::Function = parseBalance
    fetchBalance::Function = fetchBalance
    fetchTradingFees::Function = fetchTradingFees
    fetchOrderBook::Function = fetchOrderBook
    createDepositAddress::Function = createDepositAddress
    fetchDepositAddress::Function = fetchDepositAddress
    prepareRequestForDepositAddress::Function = prepareRequestForDepositAddress
    parseDepositAddressSpecial::Function = parseDepositAddressSpecial
    transfer::Function = transfer
    parseTransfer::Function = parseTransfer
    withdraw::Function = withdraw
    fetchTransactionsHelper::Function = fetchTransactionsHelper
    fetchDepositsWithdrawals::Function = fetchDepositsWithdrawals
    fetchWithdrawals::Function = fetchWithdrawals
    fetchDepositWithdrawFees::Function = fetchDepositWithdrawFees
    parseDepositWithdrawFees::Function = parseDepositWithdrawFees
    parseDepositWithdrawFee::Function = parseDepositWithdrawFee
    fetchDeposits::Function = fetchDeposits
    parseTransactionStatus::Function = parseTransactionStatus
    parseTransaction::Function = parseTransaction
    setLeverage::Function = setLeverage
    fetchLeverage::Function = fetchLeverage
    parseLeverage::Function = parseLeverage
    fetchPositionMode::Function = fetchPositionMode
    setPositionMode::Function = setPositionMode
    fetchPositions::Function = fetchPositions
    parsePosition::Function = parsePosition
    modifyMarginHelper::Function = modifyMarginHelper
    parseMarginModification::Function = parseMarginModification
    reduceMargin::Function = reduceMargin
    addMargin::Function = addMargin
    nonce::Function = nonce
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    publicGetMarkets::Function = publicGetMarkets
    publicGetMarketsSymbol::Function = publicGetMarketsSymbol
    publicGetCurrencies::Function = publicGetCurrencies
    publicGetCurrenciesCurrency::Function = publicGetCurrenciesCurrency
    publicGetV2Currencies::Function = publicGetV2Currencies
    publicGetV2CurrenciesCurrency::Function = publicGetV2CurrenciesCurrency
    publicGetTimestamp::Function = publicGetTimestamp
    publicGetMarketsPrice::Function = publicGetMarketsPrice
    publicGetMarketsSymbolPrice::Function = publicGetMarketsSymbolPrice
    publicGetMarketsMarkPrice::Function = publicGetMarketsMarkPrice
    publicGetMarketsSymbolMarkPrice::Function = publicGetMarketsSymbolMarkPrice
    publicGetMarketsSymbolMarkPriceComponents::Function = publicGetMarketsSymbolMarkPriceComponents
    publicGetMarketsSymbolOrderBook::Function = publicGetMarketsSymbolOrderBook
    publicGetMarketsSymbolCandles::Function = publicGetMarketsSymbolCandles
    publicGetMarketsSymbolTrades::Function = publicGetMarketsSymbolTrades
    publicGetMarketsTicker24h::Function = publicGetMarketsTicker24h
    publicGetMarketsSymbolTicker24h::Function = publicGetMarketsSymbolTicker24h
    publicGetMarketsCollateralInfo::Function = publicGetMarketsCollateralInfo
    publicGetMarketsCurrencyCollateralInfo::Function = publicGetMarketsCurrencyCollateralInfo
    publicGetMarketsBorrowRatesInfo::Function = publicGetMarketsBorrowRatesInfo
    privateGetAccounts::Function = privateGetAccounts
    privateGetAccountsBalances::Function = privateGetAccountsBalances
    privateGetAccountsIdBalances::Function = privateGetAccountsIdBalances
    privateGetAccountsActivity::Function = privateGetAccountsActivity
    privateGetAccountsTransfer::Function = privateGetAccountsTransfer
    privateGetAccountsTransferId::Function = privateGetAccountsTransferId
    privateGetFeeinfo::Function = privateGetFeeinfo
    privateGetAccountsInterestHistory::Function = privateGetAccountsInterestHistory
    privateGetSubaccounts::Function = privateGetSubaccounts
    privateGetSubaccountsBalances::Function = privateGetSubaccountsBalances
    privateGetSubaccountsIdBalances::Function = privateGetSubaccountsIdBalances
    privateGetSubaccountsTransfer::Function = privateGetSubaccountsTransfer
    privateGetSubaccountsTransferId::Function = privateGetSubaccountsTransferId
    privateGetWalletsAddresses::Function = privateGetWalletsAddresses
    privateGetWalletsAddressesCurrency::Function = privateGetWalletsAddressesCurrency
    privateGetWalletsActivity::Function = privateGetWalletsActivity
    privateGetMarginAccountMargin::Function = privateGetMarginAccountMargin
    privateGetMarginBorrowStatus::Function = privateGetMarginBorrowStatus
    privateGetMarginMaxSize::Function = privateGetMarginMaxSize
    privateGetOrders::Function = privateGetOrders
    privateGetOrdersId::Function = privateGetOrdersId
    privateGetOrdersKillSwitchStatus::Function = privateGetOrdersKillSwitchStatus
    privateGetSmartorders::Function = privateGetSmartorders
    privateGetSmartordersId::Function = privateGetSmartordersId
    privateGetOrdersHistory::Function = privateGetOrdersHistory
    privateGetSmartordersHistory::Function = privateGetSmartordersHistory
    privateGetTrades::Function = privateGetTrades
    privateGetOrdersIdTrades::Function = privateGetOrdersIdTrades
    privatePostAccountsTransfer::Function = privatePostAccountsTransfer
    privatePostSubaccountsTransfer::Function = privatePostSubaccountsTransfer
    privatePostWalletsAddress::Function = privatePostWalletsAddress
    privatePostWalletsWithdraw::Function = privatePostWalletsWithdraw
    privatePostV2WalletsWithdraw::Function = privatePostV2WalletsWithdraw
    privatePostOrders::Function = privatePostOrders
    privatePostOrdersBatch::Function = privatePostOrdersBatch
    privatePostOrdersKillSwitch::Function = privatePostOrdersKillSwitch
    privatePostSmartorders::Function = privatePostSmartorders
    privateDeleteOrdersId::Function = privateDeleteOrdersId
    privateDeleteOrdersCancelByIds::Function = privateDeleteOrdersCancelByIds
    privateDeleteOrders::Function = privateDeleteOrders
    privateDeleteSmartordersId::Function = privateDeleteSmartordersId
    privateDeleteSmartordersCancelByIds::Function = privateDeleteSmartordersCancelByIds
    privateDeleteSmartorders::Function = privateDeleteSmartorders
    privatePutOrdersId::Function = privatePutOrdersId
    privatePutSmartordersId::Function = privatePutSmartordersId
    swapPublicGetV3MarketAllInstruments::Function = swapPublicGetV3MarketAllInstruments
    swapPublicGetV3MarketInstruments::Function = swapPublicGetV3MarketInstruments
    swapPublicGetV3MarketOrderBook::Function = swapPublicGetV3MarketOrderBook
    swapPublicGetV3MarketCandles::Function = swapPublicGetV3MarketCandles
    swapPublicGetV3MarketIndexPriceCandlesticks::Function = swapPublicGetV3MarketIndexPriceCandlesticks
    swapPublicGetV3MarketPremiumIndexCandlesticks::Function = swapPublicGetV3MarketPremiumIndexCandlesticks
    swapPublicGetV3MarketMarkPriceCandlesticks::Function = swapPublicGetV3MarketMarkPriceCandlesticks
    swapPublicGetV3MarketTrades::Function = swapPublicGetV3MarketTrades
    swapPublicGetV3MarketLiquidationOrder::Function = swapPublicGetV3MarketLiquidationOrder
    swapPublicGetV3MarketTickers::Function = swapPublicGetV3MarketTickers
    swapPublicGetV3MarketMarkPrice::Function = swapPublicGetV3MarketMarkPrice
    swapPublicGetV3MarketIndexPrice::Function = swapPublicGetV3MarketIndexPrice
    swapPublicGetV3MarketIndexPriceComponents::Function = swapPublicGetV3MarketIndexPriceComponents
    swapPublicGetV3MarketFundingRate::Function = swapPublicGetV3MarketFundingRate
    swapPublicGetV3MarketOpenInterest::Function = swapPublicGetV3MarketOpenInterest
    swapPublicGetV3MarketInsurance::Function = swapPublicGetV3MarketInsurance
    swapPublicGetV3MarketRiskLimit::Function = swapPublicGetV3MarketRiskLimit
    swapPrivateGetV3AccountBalance::Function = swapPrivateGetV3AccountBalance
    swapPrivateGetV3AccountBills::Function = swapPrivateGetV3AccountBills
    swapPrivateGetV3TradeOrderOpens::Function = swapPrivateGetV3TradeOrderOpens
    swapPrivateGetV3TradeOrderTrades::Function = swapPrivateGetV3TradeOrderTrades
    swapPrivateGetV3TradeOrderHistory::Function = swapPrivateGetV3TradeOrderHistory
    swapPrivateGetV3TradePositionOpens::Function = swapPrivateGetV3TradePositionOpens
    swapPrivateGetV3TradePositionHistory::Function = swapPrivateGetV3TradePositionHistory
    swapPrivateGetV3PositionLeverages::Function = swapPrivateGetV3PositionLeverages
    swapPrivateGetV3PositionMode::Function = swapPrivateGetV3PositionMode
    swapPrivatePostV3TradeOrder::Function = swapPrivatePostV3TradeOrder
    swapPrivatePostV3TradeOrders::Function = swapPrivatePostV3TradeOrders
    swapPrivatePostV3TradePosition::Function = swapPrivatePostV3TradePosition
    swapPrivatePostV3TradePositionAll::Function = swapPrivatePostV3TradePositionAll
    swapPrivatePostV3PositionLeverage::Function = swapPrivatePostV3PositionLeverage
    swapPrivatePostV3PositionMode::Function = swapPrivatePostV3PositionMode
    swapPrivatePostV3TradePositionMargin::Function = swapPrivatePostV3TradePositionMargin
    swapPrivateDeleteV3TradeOrder::Function = swapPrivateDeleteV3TradeOrder
    swapPrivateDeleteV3TradeBatchOrders::Function = swapPrivateDeleteV3TradeBatchOrders
    swapPrivateDeleteV3TradeAllOrders::Function = swapPrivateDeleteV3TradeAllOrders

end
function describe(self::Poloniex, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "poloniex",
    Symbol("name") => "Poloniex",
    Symbol("countries") => ["US"],
    Symbol("rateLimit") => 5,
    Symbol("certified") => false,
    Symbol("pro") => true,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => true,
        Symbol("margin") => nothing,
        Symbol("swap") => true,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("addMargin") => true,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => nothing,
        Symbol("createDepositAddress") => true,
        Symbol("createMarketBuyOrderWithCost") => true,
        Symbol("createMarketOrderWithCost") => false,
        Symbol("createMarketSellOrderWithCost") => false,
        Symbol("createOrder") => true,
        Symbol("createOrders") => nothing,
        Symbol("createStopOrder") => true,
        Symbol("createTriggerOrder") => true,
        Symbol("editOrder") => true,
        Symbol("fetchAllGreeks") => false,
        Symbol("fetchBalance") => true,
        Symbol("fetchClosedOrder") => false,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDepositAddress") => true,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => false,
        Symbol("fetchDeposits") => true,
        Symbol("fetchDepositsWithdrawals") => true,
        Symbol("fetchDepositWithdrawFee") => "emulated",
        Symbol("fetchDepositWithdrawFees") => true,
        Symbol("fetchFundingHistory") => false,
        Symbol("fetchFundingInterval") => false,
        Symbol("fetchFundingIntervals") => false,
        Symbol("fetchFundingRate") => false,
        Symbol("fetchFundingRateHistory") => false,
        Symbol("fetchFundingRates") => nothing,
        Symbol("fetchGreeks") => false,
        Symbol("fetchLedger") => nothing,
        Symbol("fetchLeverage") => true,
        Symbol("fetchLiquidations") => nothing,
        Symbol("fetchMarginMode") => false,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterestHistory") => false,
        Symbol("fetchOpenOrder") => false,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOption") => false,
        Symbol("fetchOptionChain") => false,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrderBooks") => false,
        Symbol("fetchOrderTrades") => true,
        Symbol("fetchPosition") => false,
        Symbol("fetchPositionMode") => true,
        Symbol("fetchPositions") => true,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => false,
        Symbol("fetchTradingFees") => true,
        Symbol("fetchTransactions") => "emulated",
        Symbol("fetchTransfer") => false,
        Symbol("fetchTransfers") => false,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("fetchWithdrawals") => true,
        Symbol("reduceMargin") => true,
        Symbol("sandbox") => true,
        Symbol("setLeverage") => true,
        Symbol("setPositionMode") => true,
        Symbol("transfer") => true,
        Symbol("withdraw") => true
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "MINUTE_1",
        Symbol("5m") => "MINUTE_5",
        Symbol("10m") => "MINUTE_10",
        Symbol("15m") => "MINUTE_15",
        Symbol("30m") => "MINUTE_30",
        Symbol("1h") => "HOUR_1",
        Symbol("2h") => "HOUR_2",
        Symbol("4h") => "HOUR_4",
        Symbol("6h") => "HOUR_6",
        Symbol("12h") => "HOUR_12",
        Symbol("1d") => "DAY_1",
        Symbol("3d") => "DAY_3",
        Symbol("1w") => "WEEK_1",
        Symbol("1M") => "MONTH_1"
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://user-images.githubusercontent.com/1294454/27766817-e9456312-5ee6-11e7-9b3c-b628ca5626a5.jpg",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("spot") => "https://api.poloniex.com",
            Symbol("swap") => "https://api.poloniex.com"
        ),
        Symbol("test") => Dict{Symbol, Any}(
            Symbol("spot") => "https://sand-spot-api-gateway.poloniex.com"
        ),
        Symbol("www") => "https://www.poloniex.com",
        Symbol("doc") => "https://api-docs.poloniex.com/spot/",
        Symbol("fees") => "https://poloniex.com/fees",
        Symbol("referral") => "https://poloniex.com/signup?c=UBFZJRPJ"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("markets") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("markets/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("currencies") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("currencies/{currency}") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("v2/currencies") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("v2/currencies/{currency}") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("timestamp") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("markets/price") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("markets/{symbol}/price") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("markets/markPrice") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("markets/{symbol}/markPrice") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("markets/{symbol}/markPriceComponents") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("markets/{symbol}/orderBook") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("markets/{symbol}/candles") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("markets/{symbol}/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("markets/ticker24h") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("markets/{symbol}/ticker24h") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("markets/collateralInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("markets/{currency}/collateralInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("markets/borrowRatesInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("accounts") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("accounts/balances") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("accounts/{id}/balances") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("accounts/activity") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("accounts/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("accounts/transfer/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("feeinfo") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("accounts/interest/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("subaccounts") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("subaccounts/balances") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("subaccounts/{id}/balances") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("subaccounts/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("subaccounts/transfer/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("wallets/addresses") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("wallets/addresses/{currency}") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("wallets/activity") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("margin/accountMargin") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("margin/borrowStatus") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("margin/maxSize") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("orders/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("orders/killSwitchStatus") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("smartorders") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("smartorders/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("orders/history") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("smartorders/history") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("trades") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("orders/{id}/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 4
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("accounts/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("subaccounts/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("wallets/address") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("wallets/withdraw") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("v2/wallets/withdraw") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("orders/batch") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("orders/killSwitch") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("smartorders") => Dict{Symbol, Any}(
    Symbol("cost") => 4
)
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("orders/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("orders/cancelByIds") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("smartorders/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("smartorders/cancelByIds") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("smartorders") => Dict{Symbol, Any}(
    Symbol("cost") => 20
)
            ),
            Symbol("put") => Dict{Symbol, Any}(
                Symbol("orders/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("smartorders/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 20
)
            )
        ),
        Symbol("swapPublic") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("v3/market/allInstruments") => Dict{Symbol, Any}(
    Symbol("cost") => 2 / 3
),
                Symbol("v3/market/instruments") => Dict{Symbol, Any}(
    Symbol("cost") => 2 / 3
),
                Symbol("v3/market/orderBook") => Dict{Symbol, Any}(
    Symbol("cost") => 2 / 3
),
                Symbol("v3/market/candles") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("v3/market/indexPriceCandlesticks") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("v3/market/premiumIndexCandlesticks") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("v3/market/markPriceCandlesticks") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("v3/market/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 2 / 3
),
                Symbol("v3/market/liquidationOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 2 / 3
),
                Symbol("v3/market/tickers") => Dict{Symbol, Any}(
    Symbol("cost") => 2 / 3
),
                Symbol("v3/market/markPrice") => Dict{Symbol, Any}(
    Symbol("cost") => 2 / 3
),
                Symbol("v3/market/indexPrice") => Dict{Symbol, Any}(
    Symbol("cost") => 2 / 3
),
                Symbol("v3/market/indexPriceComponents") => Dict{Symbol, Any}(
    Symbol("cost") => 2 / 3
),
                Symbol("v3/market/fundingRate") => Dict{Symbol, Any}(
    Symbol("cost") => 2 / 3
),
                Symbol("v3/market/openInterest") => Dict{Symbol, Any}(
    Symbol("cost") => 2 / 3
),
                Symbol("v3/market/insurance") => Dict{Symbol, Any}(
    Symbol("cost") => 2 / 3
),
                Symbol("v3/market/riskLimit") => Dict{Symbol, Any}(
    Symbol("cost") => 2 / 3
)
            )
        ),
        Symbol("swapPrivate") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("v3/account/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("v3/account/bills") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("v3/trade/order/opens") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("v3/trade/order/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("v3/trade/order/history") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("v3/trade/position/opens") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("v3/trade/position/history") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("v3/position/leverages") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("v3/position/mode") => Dict{Symbol, Any}(
    Symbol("cost") => 20
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("v3/trade/order") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("v3/trade/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                Symbol("v3/trade/position") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("v3/trade/positionAll") => Dict{Symbol, Any}(
    Symbol("cost") => 100
),
                Symbol("v3/position/leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("v3/position/mode") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("v3/trade/position/margin") => Dict{Symbol, Any}(
    Symbol("cost") => 20
)
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("v3/trade/order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("v3/trade/batchOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("v3/trade/allOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 20
)
            )
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("feeSide") => "get",
            Symbol("maker") => self.parseNumber("0.0009"),
            Symbol("taker") => self.parseNumber("0.0009")
        ),
        Symbol("funding") => Dict{Symbol, Any}()
    ),
    Symbol("commonCurrencies") => Dict{Symbol, Any}(
        Symbol("AIR") => "AirCoin",
        Symbol("APH") => "AphroditeCoin",
        Symbol("BCC") => "BTCtalkcoin",
        Symbol("BCHABC") => "BCHABC",
        Symbol("BDG") => "Badgercoin",
        Symbol("BTM") => "Bitmark",
        Symbol("CON") => "Coino",
        Symbol("ETHTRON") => "ETH",
        Symbol("GOLD") => "GoldEagles",
        Symbol("GPUC") => "GPU",
        Symbol("HOT") => "Hotcoin",
        Symbol("ITC") => "Information Coin",
        Symbol("KEY") => "KEYCoin",
        Symbol("MASK") => "NFTX Hashmasks Index",
        Symbol("MEME") => "Degenerator Meme",
        Symbol("PLX") => "ParallaxCoin",
        Symbol("REPV2") => "REP",
        Symbol("STR") => "XLM",
        Symbol("SOC") => "SOCC",
        Symbol("TRADE") => "Unitrade",
        Symbol("TRXETH") => "TRX",
        Symbol("XAP") => "API Coin",
        Symbol("USDTBSC") => "USDT",
        Symbol("USDTTRON") => "USDT",
        Symbol("USDTETH") => "USDT",
        Symbol("UST") => "USTC"
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("defaultType") => "spot",
        Symbol("createMarketBuyOrderRequiresPrice") => true,
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("BEP20") => "BSC",
            Symbol("ERC20") => "ETH",
            Symbol("TRC20") => "TRON",
            Symbol("TRX") => "TRON"
        ),
        Symbol("networksById") => Dict{Symbol, Any}(
            Symbol("TRX") => "TRC20",
            Symbol("TRON") => "TRC20"
        ),
        Symbol("limits") => Dict{Symbol, Any}(
            Symbol("cost") => Dict{Symbol, Any}(
                Symbol("min") => Dict{Symbol, Any}(
                    Symbol("BTC") => 0.0001,
                    Symbol("ETH") => 0.0001,
                    Symbol("USDT") => 1,
                    Symbol("TRX") => 100,
                    Symbol("BNB") => 0.06,
                    Symbol("USDC") => 1,
                    Symbol("USDJ") => 1,
                    Symbol("TUSD") => 0.0001,
                    Symbol("DAI") => 1,
                    Symbol("PAX") => 1,
                    Symbol("BUSD") => 1
                )
            )
        ),
        Symbol("accountsByType") => Dict{Symbol, Any}(
            Symbol("spot") => "spot",
            Symbol("future") => "futures"
        ),
        Symbol("accountsById") => Dict{Symbol, Any}(
            Symbol("exchange") => "spot",
            Symbol("futures") => "future"
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
                    Symbol("GTD") => false
                ),
                Symbol("hedged") => false,
                Symbol("leverage") => false,
                Symbol("marketBuyByCost") => true,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("selfTradePrevention") => true,
                Symbol("trailing") => false,
                Symbol("iceberg") => false
            ),
            Symbol("createOrders") => Dict{Symbol, Any}(
                Symbol("max") => 20
            ),
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 1000,
                Symbol("daysBack") => 100000,
                Symbol("untilDays") => 100000,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 2000,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => nothing,
            Symbol("fetchClosedOrders") => nothing,
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 500
            )
        ),
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("extends") => "default"
        ),
        Symbol("forContracts") => Dict{Symbol, Any}(
            Symbol("extends") => "default",
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("triggerPrice") => false,
                Symbol("hedged") => true,
                Symbol("stpMode") => true,
                Symbol("marketBuyByCost") => false
            ),
            Symbol("createOrders") => Dict{Symbol, Any}(
                Symbol("max") => 10
            ),
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("limit") => 100
            ),
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => nothing,
                Symbol("daysBackCanceled") => 1 / 6,
                Symbol("untilDays") => nothing,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("limit") => 100,
                Symbol("untilDays") => 90
            )
        ),
        Symbol("swap") => Dict{Symbol, Any}(
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("extends") => "forContracts"
            ),
            Symbol("inverse") => Dict{Symbol, Any}(
                Symbol("extends") => "forContracts"
            )
        ),
        Symbol("future") => Dict{Symbol, Any}(
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("extends") => "forContracts"
            ),
            Symbol("inverse") => Dict{Symbol, Any}(
                Symbol("extends") => "forContracts"
            )
        )
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("500") => ExchangeNotAvailable,
            Symbol("603") => RequestTimeout,
            Symbol("601") => BadRequest,
            Symbol("415") => ExchangeError,
            Symbol("602") => ArgumentsRequired,
            Symbol("21604") => BadRequest,
            Symbol("21600") => AuthenticationError,
            Symbol("21605") => AuthenticationError,
            Symbol("21102") => ExchangeError,
            Symbol("21100") => AuthenticationError,
            Symbol("21704") => AuthenticationError,
            Symbol("21700") => BadRequest,
            Symbol("21705") => BadRequest,
            Symbol("21707") => ExchangeError,
            Symbol("21708") => BadRequest,
            Symbol("21601") => AccountSuspended,
            Symbol("21711") => ExchangeError,
            Symbol("21709") => InsufficientFunds,
            Symbol("250000") => ExchangeError,
            Symbol("250001") => BadRequest,
            Symbol("250002") => BadRequest,
            Symbol("250003") => BadRequest,
            Symbol("250004") => BadRequest,
            Symbol("250005") => InsufficientFunds,
            Symbol("250008") => BadRequest,
            Symbol("250012") => ExchangeError,
            Symbol("21110") => BadRequest,
            Symbol("10040") => BadSymbol,
            Symbol("10060") => ExchangeError,
            Symbol("10020") => BadSymbol,
            Symbol("10041") => BadSymbol,
            Symbol("21340") => OnMaintenance,
            Symbol("21341") => InvalidOrder,
            Symbol("21342") => InvalidOrder,
            Symbol("21343") => InvalidOrder,
            Symbol("21351") => AccountSuspended,
            Symbol("21352") => BadSymbol,
            Symbol("21353") => PermissionDenied,
            Symbol("21354") => PermissionDenied,
            Symbol("21359") => OrderNotFound,
            Symbol("21360") => InvalidOrder,
            Symbol("24106") => BadRequest,
            Symbol("24201") => ExchangeNotAvailable,
            Symbol("21301") => OrderNotFound,
            Symbol("21302") => ExchangeError,
            Symbol("21304") => ExchangeError,
            Symbol("21305") => OrderNotFound,
            Symbol("21307") => ExchangeError,
            Symbol("21309") => InvalidOrder,
            Symbol("21310") => InvalidOrder,
            Symbol("21311") => InvalidOrder,
            Symbol("21312") => InvalidOrder,
            Symbol("21314") => InvalidOrder,
            Symbol("21315") => InvalidOrder,
            Symbol("21317") => InvalidOrder,
            Symbol("21319") => InvalidOrder,
            Symbol("21320") => InvalidOrder,
            Symbol("21321") => InvalidOrder,
            Symbol("21322") => InvalidOrder,
            Symbol("21324") => BadRequest,
            Symbol("21327") => InvalidOrder,
            Symbol("21328") => InvalidOrder,
            Symbol("21330") => InvalidOrder,
            Symbol("21335") => InvalidOrder,
            Symbol("21336") => InvalidOrder,
            Symbol("21337") => InvalidOrder,
            Symbol("21344") => InvalidOrder,
            Symbol("21345") => InvalidOrder,
            Symbol("21346") => InvalidOrder,
            Symbol("21348") => InvalidOrder,
            Symbol("21347") => InvalidOrder,
            Symbol("21349") => InvalidOrder,
            Symbol("21350") => InvalidOrder,
            Symbol("21355") => ExchangeError,
            Symbol("21356") => BadRequest,
            Symbol("21721") => InsufficientFunds,
            Symbol("24101") => BadSymbol,
            Symbol("24102") => InvalidOrder,
            Symbol("24103") => InvalidOrder,
            Symbol("24104") => InvalidOrder,
            Symbol("24105") => InvalidOrder,
            Symbol("25020") => InvalidOrder,
            Symbol("25000") => InvalidOrder,
            Symbol("25001") => InvalidOrder,
            Symbol("25002") => InvalidOrder,
            Symbol("25003") => ExchangeError,
            Symbol("25004") => InvalidOrder,
            Symbol("25005") => ExchangeError,
            Symbol("25006") => InvalidOrder,
            Symbol("25007") => InvalidOrder,
            Symbol("25008") => InvalidOrder,
            Symbol("25009") => ExchangeError,
            Symbol("25010") => PermissionDenied,
            Symbol("25011") => InvalidOrder,
            Symbol("25012") => ExchangeError,
            Symbol("25013") => OrderNotFound,
            Symbol("25014") => OrderNotFound,
            Symbol("25015") => OrderNotFound,
            Symbol("25016") => ExchangeError,
            Symbol("25017") => ExchangeError,
            Symbol("25018") => BadRequest,
            Symbol("25019") => BadSymbol
        ),
        Symbol("broad") => Dict{Symbol, Any}()
    )
))

end
function parseOHLCV(self::Poloniex, ohlcv; market=nothing)
    ohlcvLength = length(ohlcv);
    isContract = ohlcvLength == 9;
    if functions.ccxtruthy(isContract)
            return [safeInteger(ohlcv, 7), self.safeNumber(ohlcv, 2), self.safeNumber(ohlcv, 1), self.safeNumber(ohlcv, 0), self.safeNumber(ohlcv, 3), self.safeNumber(ohlcv, 5)]
    end
    return [safeInteger(ohlcv, 12), self.safeNumber(ohlcv, 2), self.safeNumber(ohlcv, 1), self.safeNumber(ohlcv, 0), self.safeNumber(ohlcv, 3), self.safeNumber(ohlcv, 5)]

end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://api-docs.poloniex.com/spot/api/public/market-data#candles
see: https://api-docs.poloniex.com/v3/futures/api/market/get-kline-data

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchOHLCV(self::Poloniex, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOHLCV", "paginate", defaultValue = false);
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchOHLCV", symbol = symbol, since = since, limit = limit, timeframe = timeframe, params = params, maxEntriesPerRequest = 500))
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("interval") => safeString(self.timeframes, timeframe, timeframe)
    );
    keyStart = functions.ccxtruthy(get(market, Symbol("spot"), nothing)) ? "startTime" : "sTime";
    keyEnd = functions.ccxtruthy(get(market, Symbol("spot"), nothing)) ? "endTime" : "eTime";
    if functions.ccxtruthy(since != nothing)
        request[Symbol(keyStart)] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    (request, params) = self.handleUntilOption(keyEnd, request, params);
    if functions.ccxtruthy(get(market, Symbol("contract"), nothing))
        if functions.ccxtruthy(inArray(timeframe, ["10m", "1M"]))
            throw(NotSupported(string(self.id, " ", timeframe, " ", get(market, Symbol("type"), nothing), " fetchOHLCV is not supported")));
        end
        responseRaw = Base.fetch(self.swapPublicGetV3MarketCandles(extend(request, params)));
        data = self.safeList(responseRaw, "data");
            return self.parseOHLCVs(data, market = market, timeframe = timeframe, since = since, limit = limit)
    end
    response = Base.fetch(self.publicGetMarketsSymbolCandles(extend(request, params)));
    candles = [];
    if functions.ccxtruthy(functions.ccxt_isArray(response))
        candles = response;
    end
    return self.parseOHLCVs(candles, market = market, timeframe = timeframe, since = since, limit = limit)

end
function loadMarkets(self::Poloniex; reload=false, params=Dict())
    markets = Base.fetch(loadMarkets(self.parent, reload = reload, params = params));
    currenciesByNumericId = safeValue(self.options, "currenciesByNumericId");
    if functions.ccxtruthy(@functions.ccxt_or((currenciesByNumericId == nothing), reload))
        self.options[Symbol("currenciesByNumericId")] = indexBy(self.currencies, "numericId");
    end
    return markets

end
"""
retrieves data on all markets for poloniex
see: https://api-docs.poloniex.com/spot/api/public/reference-data#symbol-information
see: https://api-docs.poloniex.com/v3/futures/api/market/get-all-product-info

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Poloniex; params=Dict())
    promises = [self.fetchSpotMarkets(params = params), self.fetchSwapMarkets(params = params)];
    results = Base.fetch(asyncmap(Base.fetch, promises));
    return arrayConcat(get(results, 1, nothing), get(results, 2, nothing))

end
function fetchSpotMarkets(self::Poloniex; params=Dict())
    markets = Base.fetch(self.publicGetMarkets(params));
    return self.parseMarkets(markets)

end
function fetchSwapMarkets(self::Poloniex; params=Dict())
    response = Base.fetch(self.swapPublicGetV3MarketAllInstruments(params));
    markets = self.safeList(response, "data");
    return self.parseMarkets(markets)

end
function parseMarket(self::Poloniex, market)
    if functions.ccxtruthy(ccxt_in("ctType", market))
            return self.parseSwapMarket(market)
    else
        return self.parseSpotMarket(market)
    end

end
function parseSpotMarket(self::Poloniex, market)
    id = safeString(market, "symbol");
    baseId = safeString(market, "baseCurrencyName");
    quoteId = safeString(market, "quoteCurrencyName");
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    state = safeString(market, "state");
    active = state == "NORMAL";
    symbolTradeLimit = safeValue(market, "symbolTradeLimit");
    return self.safeMarketStructure(market = Dict{Symbol, Any}(
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
    Symbol("active") => active,
    Symbol("contract") => false,
    Symbol("linear") => nothing,
    Symbol("inverse") => nothing,
    Symbol("contractSize") => nothing,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.parseNumber(self.parsePrecision(precision = safeString(symbolTradeLimit, "quantityScale"))),
        Symbol("price") => self.parseNumber(self.parsePrecision(precision = safeString(symbolTradeLimit, "priceScale")))
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(symbolTradeLimit, "minQuantity"),
            Symbol("max") => nothing
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(symbolTradeLimit, "minAmount"),
            Symbol("max") => nothing
        )
    ),
    Symbol("created") => safeInteger(market, "tradableStartTime"),
    Symbol("info") => market
))

end
function parseSwapMarket(self::Poloniex, market)
    id = safeString(market, "symbol");
    baseId = safeString(market, "bCcy");
    quoteId = safeString(market, "qCcy");
    settleId = safeString(market, "sCcy");
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    settle = self.safeCurrencyCode(settleId);
    status = safeString(market, "status");
    active = status == "OPEN";
    linear = get(market, Symbol("ctType"), nothing) == "LINEAR";
    symbol = string(base, "/", quote_var);
    if functions.ccxtruthy(linear)
        symbol += string(":", settle);
    else
        symbol += string(":", base);
    end
    alias = safeString(market, "alias");
    type_var = "swap";
    if functions.ccxtruthy(alias != nothing)
        type_var = "future";
    end
    marketType = functions.ccxtruthy((type_var == "future")) ? "future" : "swap";
    return self.safeMarketStructure(market = Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => settle,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => settleId,
    Symbol("type") => marketType,
    Symbol("spot") => false,
    Symbol("margin") => false,
    Symbol("swap") => type_var == "swap",
    Symbol("future") => type_var == "future",
    Symbol("option") => false,
    Symbol("active") => active,
    Symbol("contract") => true,
    Symbol("linear") => linear,
    Symbol("inverse") => !functions.ccxtruthy(linear),
    Symbol("contractSize") => self.safeNumber(market, "ctVal"),
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("taker") => self.safeNumber(market, "tFee"),
    Symbol("maker") => self.safeNumber(market, "mFee"),
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.safeNumber(market, "lotSz"),
        Symbol("price") => self.safeNumber(market, "tSz")
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "minSz"),
            Symbol("max") => self.safeNumber(market, "limitMaxQty")
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "minPx"),
            Symbol("max") => self.safeNumber(market, "maxPx")
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("max") => self.safeNumber(market, "maxLever"),
            Symbol("min") => nothing
        )
    ),
    Symbol("created") => safeInteger(market, "oDate"),
    Symbol("info") => market
))

end
"""
fetches the current integer timestamp in milliseconds from the exchange server
see: https://api-docs.poloniex.com/spot/api/public/reference-data#system-timestamp

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
function fetchTime(self::Poloniex; params=Dict())
    response = Base.fetch(self.publicGetTimestamp(params));
    return safeInteger(response, "serverTime")

end
function parseTicker(self::Poloniex, ticker; market=nothing)
    timestamp = safeInteger2(ticker, "ts", "cT");
    marketId = safeString2(ticker, "symbol", "s");
    market = self.safeMarket(marketId = marketId);
    relativeChange = safeString2(ticker, "dailyChange", "dc");
    percentage = stringMul(relativeChange, "100");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("id") => marketId,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => safeString2(ticker, "high", "h"),
    Symbol("low") => safeString2(ticker, "low", "l"),
    Symbol("bid") => safeString2(ticker, "bid", "bPx"),
    Symbol("bidVolume") => safeString2(ticker, "bidQuantity", "bSz"),
    Symbol("ask") => safeString2(ticker, "ask", "aPx"),
    Symbol("askVolume") => safeString2(ticker, "askQuantity", "aSz"),
    Symbol("vwap") => nothing,
    Symbol("open") => safeString2(ticker, "open", "o"),
    Symbol("close") => safeString2(ticker, "close", "c"),
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => percentage,
    Symbol("average") => nothing,
    Symbol("baseVolume") => safeString2(ticker, "quantity", "qty"),
    Symbol("quoteVolume") => safeString2(ticker, "amount", "amt"),
    Symbol("markPrice") => safeString2(ticker, "markPrice", "mPx"),
    Symbol("indexPrice") => safeString(ticker, "iPx"),
    Symbol("info") => ticker
), market = market)

end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://api-docs.poloniex.com/spot/api/public/market-data#ticker
see: https://api-docs.poloniex.com/v3/futures/api/market/get-market-info

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTickers(self::Poloniex; symbols=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbols != nothing)
        symbols = self.marketSymbols(symbols = symbols, type_var = nothing, allowEmpty = true, sameTypeOnly = true, sameSubTypeOnly = false);
        symbolsLength = length(symbols);
        if functions.ccxtruthy(functions.ccxt_gt(symbolsLength, 0))
            market = self.market(get(symbols, 1, nothing));
            if functions.ccxtruthy(symbolsLength == 1)
                request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
            end
        end
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchTickers", market = market, params = params);
    if functions.ccxtruthy(marketType == "swap")
        responseRaw = Base.fetch(self.swapPublicGetV3MarketTickers(extend(request, params)));
        data = self.safeList(responseRaw, "data");
            return self.parseTickers(data, symbols = symbols)
    end
    response = Base.fetch(self.publicGetMarketsTicker24h(params));
    return self.parseTickers(response, symbols = symbols)

end
"""
fetches all available currencies on an exchange
see: https://api-docs.poloniex.com/spot/api/public/reference-data#currencyv2-information

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
function fetchCurrencies(self::Poloniex; params=Dict())
    response = Base.fetch(self.publicGetV2Currencies(params));
    return self.parseCurrencies(response)

end
function parseCurrency(self::Poloniex, currency)
    entry = currency;
    id = safeString(entry, "coin");
    code = self.safeCurrencyCode(id);
    networks = Dict{Symbol, Any}();
    chains = self.safeList(entry, "networkList", defaultValue = []);
    chainsLength = length(chains);
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, chainsLength))
        chain = get(chains, j + 1, nothing);
        chainId = safeString(chain, "blockchain");
        networkCode = self.networkIdToCode(networkId = chainId, currencyCode = code);
        if functions.ccxtruthy(networkCode != nothing)
            networks[Symbol(networkCode)] = Dict{Symbol, Any}(
                Symbol("info") => chain,
                Symbol("id") => chainId,
                Symbol("name") => nothing,
                Symbol("code") => networkCode,
                Symbol("active") => nothing,
                Symbol("fee") => self.safeNumber(chain, "withdrawFee"),
                Symbol("deposit") => self.safeBool(chain, "depositEnable"),
                Symbol("withdraw") => self.safeBool(chain, "withdrawalEnable"),
                Symbol("precision") => self.parseNumber(self.parsePrecision(precision = safeString(chain, "decimals"))),
                Symbol("limits") => Dict{Symbol, Any}(
                    Symbol("withdraw") => Dict{Symbol, Any}(
                        Symbol("min") => self.safeNumber(chain, "withdrawMin"),
                        Symbol("max") => nothing
                    ),
                    Symbol("deposit") => Dict{Symbol, Any}(
                        Symbol("min") => nothing,
                        Symbol("max") => nothing
                    )
                )
            );
        end
        j += 1
    end
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("name") => safeString(entry, "name"),
    Symbol("code") => code,
    Symbol("type") => nothing,
    Symbol("precision") => nothing,
    Symbol("info") => entry,
    Symbol("networks") => networks,
    Symbol("deposit") => nothing,
    Symbol("withdraw") => nothing,
    Symbol("active") => nothing,
    Symbol("fee") => nothing,
    Symbol("limits") => nothing,
    Symbol("margin") => self.safeBool(entry, "supportBorrow")
))

end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://api-docs.poloniex.com/spot/api/public/market-data#ticker
see: https://api-docs.poloniex.com/v3/futures/api/market/get-market-info

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTicker(self::Poloniex, symbol; params=Dict())
    Base.fetch(self.loadMarkets());
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(get(market, Symbol("contract"), nothing))
        tickers = Base.fetch(self.fetchTickers(symbols = [get(market, Symbol("symbol"), nothing)], params = params));
            return self.safeDict(tickers, symbol)
    end
    response = Base.fetch(self.publicGetMarketsSymbolTicker24h(extend(request, params)));
    return self.parseTicker(response, market = market)

end
function parseTrade(self::Poloniex, trade; market=nothing)
    id = safeStringN(trade, ["id", "tradeID", "trdId"]);
    orderId = safeString2(trade, "orderId", "ordId");
    timestamp = safeIntegerN(trade, ["ts", "createTime", "cT", "cTime"]);
    marketId = safeString(trade, "symbol");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = "_");
    symbol = get(market, Symbol("symbol"), nothing);
    side = safeStringLower2(trade, "side", "takerSide");
    fee = nothing;
    priceString = safeString2(trade, "price", "px");
    amountString = safeString2(trade, "quantity", "qty");
    costString = safeString2(trade, "amount", "amt");
    feeCurrencyId = safeString2(trade, "feeCurrency", "feeCcy");
    feeCostString = safeString2(trade, "feeAmount", "feeAmt");
    if functions.ccxtruthy(feeCostString != nothing)
        feeCurrencyCode = self.safeCurrencyCode(feeCurrencyId);
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCostString,
            Symbol("currency") => feeCurrencyCode
        );
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("info") => trade,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => symbol,
    Symbol("order") => orderId,
    Symbol("type") => safeStringLower2(trade, "ordType", "type"),
    Symbol("side") => side,
    Symbol("takerOrMaker") => safeStringLower2(trade, "matchRole", "role"),
    Symbol("price") => priceString,
    Symbol("amount") => amountString,
    Symbol("cost") => costString,
    Symbol("fee") => fee
), market = market)

end
"""
get the list of most recent trades for a particular symbol
see: https://api-docs.poloniex.com/spot/api/public/market-data#trades
see: https://api-docs.poloniex.com/v3/futures/api/market/get-execution-info

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
function fetchTrades(self::Poloniex, symbol; since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(get(market, Symbol("contract"), nothing))
        response = Base.fetch(self.swapPublicGetV3MarketTrades(extend(request, params)));
        tradesList = self.safeList(response, "data", defaultValue = []);
            return self.parseTrades(tradesList, market = market, since = since, limit = limit)
    end
    trades = Base.fetch(self.publicGetMarketsSymbolTrades(extend(request, params)));
    return self.parseTrades(trades, market = market, since = since, limit = limit)

end
"""
fetch all trades made by the user
see: https://api-docs.poloniex.com/spot/api/private/trade#trade-history
see: https://api-docs.poloniex.com/v3/futures/api/trade/get-execution-details

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchMyTrades(self::Poloniex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchMyTrades", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchMyTrades", symbol = symbol, since = since, limit = limit, params = params))
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchMyTrades", market = market, params = params);
    isContract = inArray(marketType, ["swap", "future"]);
    request = Dict{Symbol, Any}();
    startKey = functions.ccxtruthy(isContract) ? "sTime" : "startTime";
    endKey = functions.ccxtruthy(isContract) ? "eTime" : "endTime";
    if functions.ccxtruthy(since != nothing)
        request[Symbol(startKey)] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(@functions.ccxt_and(isContract, symbol != nothing))
        request[Symbol("symbol")] = safeString(market, "id");
    end
    (request, params) = self.handleUntilOption(endKey, request, params);
    if functions.ccxtruthy(isContract)
        raw = Base.fetch(self.swapPrivateGetV3TradeOrderTrades(extend(request, params)));
        data = self.safeList(raw, "data", defaultValue = []);
            return self.parseTrades(data, market = market, since = since, limit = limit)
    end
    response = Base.fetch(self.privateGetTrades(extend(request, params)));
    result = self.parseTrades(response, market = market, since = since, limit = limit);
    return result

end
function parseOrderStatus(self::Poloniex, status)
    statuses = Dict{Symbol, Any}(
        Symbol("NEW") => "open",
        Symbol("PARTIALLY_FILLED") => "open",
        Symbol("FILLED") => "closed",
        Symbol("PENDING_CANCEL") => "canceled",
        Symbol("PARTIALLY_CANCELED") => "canceled",
        Symbol("CANCELED") => "canceled",
        Symbol("FAILED") => "canceled"
    );
    return safeString(statuses, status, status)

end
function parseOrder(self::Poloniex, order; market=nothing)
    timestamp = safeIntegerN(order, ["timestamp", "createTime", "cTime"]);
    if functions.ccxtruthy(timestamp == nothing)
        timestamp = self.parse8601(safeString(order, "date"));
    end
    marketId = safeString(order, "symbol");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = "_");
    symbol = get(market, Symbol("symbol"), nothing);
    resultingTrades = safeValue(order, "resultingTrades");
    if functions.ccxtruthy(resultingTrades != nothing)
        if functions.ccxtruthy(!functions.ccxtruthy(functions.ccxt_isArray(resultingTrades)))
            resultingTrades = safeValue(resultingTrades, safeString(market, "id", marketId));
        end
    end
    price = safeStringN(order, ["price", "rate", "px"]);
    amount = safeString2(order, "quantity", "sz");
    filled = safeString2(order, "filledQuantity", "execQty");
    status = self.parseOrderStatus(safeString(order, "state"));
    side = safeStringLower(order, "side");
    rawType = safeString(order, "type");
    type_var = self.parseOrderType(rawType);
    id = safeStringN(order, ["orderNumber", "id", "orderId", "ordId"]);
    fee = nothing;
    feeCurrency = safeString2(order, "tokenFeeCurrency", "feeCcy");
    feeCost = nothing;
    feeCurrencyCode = nothing;
    rate = safeString(order, "fee");
    if functions.ccxtruthy(feeCurrency == nothing)
        feeCurrencyCode = functions.ccxtruthy((side == "buy")) ? get(market, Symbol("base"), nothing) : get(market, Symbol("quote"), nothing);
    else
        feeCurrencyCode = self.safeCurrencyCode(feeCurrency);
        feeCost = safeString2(order, "tokenFee", "feeAmt");
    end
    if functions.ccxtruthy(feeCost != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("rate") => rate,
            Symbol("cost") => feeCost,
            Symbol("currency") => feeCurrencyCode
        );
    end
    clientOrderId = safeString2(order, "clientOrderId", "clOrdId");
    marginMode = safeStringLower(order, "mgnMode");
    reduceOnly = self.safeBool(order, "reduceOnly");
    leverage = safeInteger(order, "lever");
    hedged = safeString(order, "posSide") != "BOTH";
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => id,
    Symbol("clientOrderId") => clientOrderId,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => safeInteger(order, "updateTime"),
    Symbol("status") => status,
    Symbol("symbol") => symbol,
    Symbol("type") => type_var,
    Symbol("timeInForce") => safeString(order, "timeInForce"),
    Symbol("postOnly") => rawType == "LIMIT_MAKER",
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("triggerPrice") => safeString2(order, "triggerPrice", "stopPrice"),
    Symbol("cost") => safeString(order, "execAmt"),
    Symbol("average") => safeString2(order, "avgPrice", "avgPx"),
    Symbol("amount") => amount,
    Symbol("filled") => filled,
    Symbol("remaining") => nothing,
    Symbol("trades") => resultingTrades,
    Symbol("fee") => fee,
    Symbol("marginMode") => marginMode,
    Symbol("reduceOnly") => reduceOnly,
    Symbol("leverage") => leverage,
    Symbol("hedged") => hedged
), market = market)

end
function parseOrderType(self::Poloniex, status)
    statuses = Dict{Symbol, Any}(
        Symbol("MARKET") => "market",
        Symbol("LIMIT") => "limit",
        Symbol("LIMIT_MAKER") => "limit",
        Symbol("STOP-LIMIT") => "limit",
        Symbol("STOP-MARKET") => "market"
    );
    return safeString(statuses, status, status)

end
function parseOpenOrders(self::Poloniex, orders, market, result)
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        order = get(orders, i + 1, nothing);
        extended = extend(order, Dict{Symbol, Any}(
            Symbol("status") => "open",
            Symbol("type") => "limit",
            Symbol("side") => get(order, Symbol("type"), nothing),
            Symbol("price") => get(order, Symbol("rate"), nothing)
        ));
        push!(result, self.parseOrder(extended, market = market));
        i += 1
    end
    return result

end
"""
fetch all unfilled currently open orders
see: https://api-docs.poloniex.com/spot/api/private/order#open-orders
see: https://api-docs.poloniex.com/spot/api/private/smart-order#open-orders  // trigger orders
see: https://api-docs.poloniex.com/v3/futures/api/trade/get-current-orders

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of  open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: set true to fetch trigger orders instead of regular orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Poloniex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchOpenOrders", market = market, params = params);
    if functions.ccxtruthy(limit != nothing)
        max = functions.ccxtruthy((marketType == "spot")) ? 2000 : 100;
        request[Symbol("limit")] = max(limit, max);
    end
    isTrigger = safeValue2(params, "trigger", "stop");
    params = omit(params, ["trigger", "stop"]);
    response = [];
    if functions.ccxtruthy(marketType != "spot")
        raw = Base.fetch(self.swapPrivateGetV3TradeOrderOpens(extend(request, params)));
        response = self.safeList(raw, "data", defaultValue = []);
    elseif functions.ccxtruthy(isTrigger)
        response = Base.fetch(self.privateGetSmartorders(extend(request, params)));
    else
        response = Base.fetch(self.privateGetOrders(extend(request, params)));
    end
    extension = Dict{Symbol, Any}(
        Symbol("status") => "open"
    );
    return self.parseOrders(response, market = market, since = since, limit = limit, params = extension)

end
"""
fetches information on multiple closed orders made by the user
see: https://api-docs.poloniex.com/v3/futures/api/trade/get-order-history

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest entry

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchClosedOrders(self::Poloniex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchClosedOrders", market = market, params = params, defaultValue = "swap");
    if functions.ccxtruthy(marketType == "spot")
        throw(NotSupported(string(self.id, " fetchClosedOrders() is not supported for spot markets yet")));
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(200, limit);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("sTime")] = since;
    end
    (request, params) = self.handleUntilOption("eTime", request, params);
    response = Base.fetch(self.swapPrivateGetV3TradeOrderHistory(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseOrders(data, market = market, since = since, limit = limit)

end
"""
create a trade order
see: https://api-docs.poloniex.com/spot/api/private/order#create-order
see: https://api-docs.poloniex.com/spot/api/private/smart-order#create-order  // trigger orders

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.triggerPrice`::float, optional: the price at which a trigger order is triggered at
- `params.cost`::float, optional: *spot market buy only* the quote quantity that can be used as an alternative for the amount

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrder(self::Poloniex, symbol, type_var, side, amount; price=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("side") => uppercase(side)
    );
    triggerPrice = self.safeNumber2(params, "stopPrice", "triggerPrice");
    (request, params) = self.orderRequest(symbol, type_var, side, amount, request, price = price, params = params);
    response = Dict{Symbol, Any}();
    if functions.ccxtruthy(@functions.ccxt_or(get(market, Symbol("swap"), nothing), get(market, Symbol("future"), nothing)))
        responseInitial = Base.fetch(self.swapPrivatePostV3TradeOrder(extend(request, params)));
        response = self.safeDict(responseInitial, "data", defaultValue = Dict{Symbol, Any}());
    elseif functions.ccxtruthy(triggerPrice != nothing)
        response = Base.fetch(self.privatePostSmartorders(extend(request, params)));
    else
        response = Base.fetch(self.privatePostOrders(extend(request, params)));
    end
    return self.parseOrder(response, market = market)

end
function orderRequest(self::Poloniex, symbol, type_var, side, amount, request; price=nothing, params=Dict())
    triggerPrice = self.safeNumber2(params, "stopPrice", "triggerPrice");
    market = self.market(symbol);
    if functions.ccxtruthy(get(market, Symbol("contract"), nothing))
        marginMode = nothing;
        (marginMode, params) = self.handleParamString(params, "marginMode");
        if functions.ccxtruthy(marginMode != nothing)
            self.checkRequiredArgument("createOrder", marginMode, "marginMode", options = ["cross", "isolated"]);
            request[Symbol("mgnMode")] =             uppercase(marginMode);
        end
        hedged = nothing;
        (hedged, params) = self.handleParamString(params, "hedged");
        if functions.ccxtruthy(hedged)
            if functions.ccxtruthy(marginMode == nothing)
                throw(ArgumentsRequired(string(self.id, " createOrder() requires a marginMode parameter \"cross\" or \"isolated\" for hedged orders")));
            end
            if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in("posSide", params))))
                throw(ArgumentsRequired(string(self.id, " createOrder() requires a posSide parameter \"LONG\" or \"SHORT\" for hedged orders")));
            end
        end
    end
    upperCaseType = uppercase(type_var);
    isMarket = upperCaseType == "MARKET";
    isPostOnly = self.isPostOnly(isMarket, upperCaseType == "LIMIT_MAKER", params = params);
    params = omit(params, ["postOnly", "triggerPrice", "stopPrice"]);
    if functions.ccxtruthy(triggerPrice != nothing)
        if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("spot"), nothing)))
            throw(InvalidOrder(string(self.id, " createOrder() does not support trigger orders for ", get(market, Symbol("type"), nothing), " markets")));
        end
        upperCaseType = functions.ccxtruthy((price == nothing)) ? "STOP" : "STOP_LIMIT";
        request[Symbol("stopPrice")] = triggerPrice;
    elseif functions.ccxtruthy(isPostOnly)
        upperCaseType = "LIMIT_MAKER";
    end
    request[Symbol("type")] = upperCaseType;
    if functions.ccxtruthy(isMarket)
        if functions.ccxtruthy(side == "buy")
            quoteAmount = nothing;
            createMarketBuyOrderRequiresPrice = true;
            (createMarketBuyOrderRequiresPrice, params) = self.handleOptionAndParams(params, "createOrder", "createMarketBuyOrderRequiresPrice", defaultValue = true);
            cost = self.safeNumber(params, "cost");
            params = omit(params, "cost");
            if functions.ccxtruthy(cost != nothing)
                quoteAmount = self.costToPrecision(symbol, cost);
            elseif functions.ccxtruthy(@functions.ccxt_and(createMarketBuyOrderRequiresPrice, get(market, Symbol("spot"), nothing)))
                if functions.ccxtruthy(price == nothing)
                    throw(InvalidOrder(string(self.id, " createOrder() requires the price argument for market buy orders to calculate the total cost to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option or param to false and pass the cost to spend (quote quantity) in the amount argument")));
                else
                    amountString = numberToString(amount);
                    priceString = numberToString(price);
                    costRequest = stringMul(amountString, priceString);
                    quoteAmount = self.costToPrecision(symbol, costRequest);
                end
            else
                quoteAmount = self.costToPrecision(symbol, amount);
            end
            amountKey = functions.ccxtruthy(get(market, Symbol("spot"), nothing)) ? "amount" : "sz";
            request[Symbol(amountKey)] = quoteAmount;
        else
            amountKey = functions.ccxtruthy(get(market, Symbol("spot"), nothing)) ? "quantity" : "sz";
            request[Symbol(amountKey)] = self.amountToPrecision(symbol, amount);
        end
    else
        amountKey = functions.ccxtruthy(get(market, Symbol("spot"), nothing)) ? "quantity" : "sz";
        request[Symbol(amountKey)] = self.amountToPrecision(symbol, amount);
        priceKey = functions.ccxtruthy(get(market, Symbol("spot"), nothing)) ? "price" : "px";
        request[Symbol(priceKey)] = self.priceToPrecision(symbol, price);
    end
    clientOrderId = safeString(params, "clientOrderId");
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("clientOrderId")] = clientOrderId;
        params = omit(params, "clientOrderId");
    end
    return [request, params]

end
"""
edit a trade order
see: https://api-docs.poloniex.com/spot/api/private/order#cancel-replace-order
see: https://api-docs.poloniex.com/spot/api/private/smart-order#cancel-replace-order

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float, optional: how much of the currency you want to trade in units of the base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.triggerPrice`::float, optional: The price at which a trigger order is triggered at

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function editOrder(self::Poloniex, id, symbol, type_var, side; amount=nothing, price=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("spot"), nothing)))
        throw(NotSupported(string(self.id, " editOrder() does not support ", get(market, Symbol("type"), nothing), " orders, only spot orders are accepted")));
    end
    request = Dict{Symbol, Any}(
        Symbol("id") => id
    );
    triggerPrice = self.safeNumber2(params, "stopPrice", "triggerPrice");
    (request, params) = self.orderRequest(symbol, type_var, side, amount, request, price = price, params = params);
    response = Dict{Symbol, Any}();
    if functions.ccxtruthy(triggerPrice != nothing)
        response = Base.fetch(self.privatePutSmartordersId(extend(request, params)));
    else
        response = Base.fetch(self.privatePutOrdersId(extend(request, params)));
    end
    response = extend(response, Dict{Symbol, Any}(
    Symbol("side") => side,
    Symbol("type") => type_var
));
    return self.parseOrder(response, market = market)

end
function cancelOrder(self::Poloniex, id; symbol=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a symbol argument")));
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("spot"), nothing)))
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        request[Symbol("ordId")] = id;
        raw = Base.fetch(self.swapPrivateDeleteV3TradeOrder(extend(request, params)));
            return self.parseOrder(self.safeDict(raw, "data", defaultValue = Dict{Symbol, Any}()))
    end
    clientOrderId = safeValue(params, "clientOrderId");
    if functions.ccxtruthy(clientOrderId != nothing)
        id = clientOrderId;
    end
    request[Symbol("id")] = id;
    isTrigger = safeValue2(params, "trigger", "stop");
    params = omit(params, ["clientOrderId", "trigger", "stop"]);
    response = Dict{Symbol, Any}();
    if functions.ccxtruthy(isTrigger)
        response = Base.fetch(self.privateDeleteSmartordersId(extend(request, params)));
    else
        response = Base.fetch(self.privateDeleteOrdersId(extend(request, params)));
    end
    return self.parseOrder(response)

end
"""
cancel all open orders
see: https://api-docs.poloniex.com/spot/api/private/order#cancel-all-orders
see: https://api-docs.poloniex.com/spot/api/private/smart-order#cancel-all-orders  // trigger orders
see: https://api-docs.poloniex.com/v3/futures/api/trade/cancel-all-orders - contract markets

# Arguments
- `symbol`::string, optional: unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: true if canceling trigger orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelAllOrders(self::Poloniex; symbol=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    request = Dict{Symbol, Any}(
        Symbol("symbols") => []
    );
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbols")] = [get(market, Symbol("id"), nothing)];
    end
    response = [];
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("cancelAllOrders", market = market, params = params);
    if functions.ccxtruthy(@functions.ccxt_or(marketType == "swap", marketType == "future"))
        raw = Base.fetch(self.swapPrivateDeleteV3TradeAllOrders(extend(request, params)));
        response = self.safeList(raw, "data", defaultValue = []);
            return self.parseOrders(response, market = market)
    end
    isTrigger = safeValue2(params, "trigger", "stop");
    params = omit(params, ["trigger", "stop"]);
    if functions.ccxtruthy(isTrigger)
        response = Base.fetch(self.privateDeleteSmartorders(extend(request, params)));
    else
        response = Base.fetch(self.privateDeleteOrders(extend(request, params)));
    end
    return self.parseOrders(response, market = market)

end
"""
fetch an order by it's id
see: https://api-docs.poloniex.com/spot/api/private/order#order-details
see: https://api-docs.poloniex.com/spot/api/private/smart-order#open-orders  // trigger orders

# Arguments
- `id`::string: order id
- `symbol`::string: unified market symbol, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: true if fetching a trigger order

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrder(self::Poloniex, id; symbol=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    id = string(id);
    request = Dict{Symbol, Any}(
        Symbol("id") => id
    );
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchOrder", market = market, params = params);
    if functions.ccxtruthy(marketType != "spot")
        throw(NotSupported(string(self.id, " fetchOrder() is not supported for ", marketType, " markets yet")));
    end
    isTrigger = safeValue2(params, "trigger", "stop");
    params = omit(params, ["trigger", "stop"]);
    response = Dict{Symbol, Any}();
    if functions.ccxtruthy(isTrigger)
        response = Base.fetch(self.privateGetSmartordersId(extend(request, params)));
        response = safeValue(response, 0);
    else
        response = Base.fetch(self.privateGetOrdersId(extend(request, params)));
    end
    order = self.parseOrder(response);
    order[Symbol("id")] = id;
    return order

end
function fetchOrderStatus(self::Poloniex, id; symbol=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    orders = Base.fetch(self.fetchOpenOrders(symbol = symbol, since = nothing, limit = nothing, params = params));
    indexed = indexBy(orders, "id");
    return functions.ccxtruthy((ccxt_in(id, indexed))) ? "open" : "closed"

end
"""
fetch all the trades made from a single order
see: https://api-docs.poloniex.com/spot/api/private/trade#trades-by-order-id

# Arguments
- `id`::string: order id
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchOrderTrades(self::Poloniex, id; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    request = Dict{Symbol, Any}(
        Symbol("id") => id
    );
    trades = Base.fetch(self.privateGetOrdersIdTrades(extend(request, params)));
    return self.parseTrades(trades)

end
function parseBalance(self::Poloniex, response)
    result = Dict{Symbol, Any}(
        Symbol("info") => response,
        Symbol("timestamp") => nothing,
        Symbol("datetime") => nothing
    );
    if functions.ccxtruthy(!functions.ccxtruthy(functions.ccxt_isArray(response)))
        ts = safeInteger(response, "uTime");
        result[Symbol("timestamp")] = ts;
        result[Symbol("datetime")] = self.iso8601(ts);
        details = self.safeList(response, "details", defaultValue = []);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(details)))
            balance = get(details, i + 1, nothing);
            currencyId = safeString(balance, "ccy");
            code = self.safeCurrencyCode(currencyId);
            account = self.account();
            account[Symbol("total")] = safeString(balance, "avail");
            account[Symbol("used")] = safeString(balance, "im");
            if functions.ccxtruthy(code != nothing)
                result[Symbol(code)] = account;
            end
            i += 1
        end

            return self.safeBalance(result)
    end
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        account = safeValue(response, i, Dict{Symbol, Any}());
        balances = safeValue(account, "balances");
        j = 0
        while functions.ccxtruthy(functions.ccxt_lt(j, length(balances)))
            balance = safeValue(balances, j);
            currencyId = safeString(balance, "currency");
            code = self.safeCurrencyCode(currencyId);
            newAccount = self.account();
            newAccount[Symbol("free")] = safeString(balance, "available");
            newAccount[Symbol("used")] = safeString(balance, "hold");
            if functions.ccxtruthy(code != nothing)
                result[Symbol(code)] = newAccount;
            end
            j += 1
        end
        i += 1
    end
    return self.safeBalance(result)

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://api-docs.poloniex.com/spot/api/private/account#all-account-balances
see: https://api-docs.poloniex.com/v3/futures/api/account/balance

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Poloniex; params=Dict())
    Base.fetch(self.loadMarkets());
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchBalance", market = nothing, params = params);
    if functions.ccxtruthy(marketType != "spot")
        responseRaw = Base.fetch(self.swapPrivateGetV3AccountBalance(params));
        data = self.safeDict(responseRaw, "data", defaultValue = Dict{Symbol, Any}());
            return self.parseBalance(data)
    end
    request = Dict{Symbol, Any}(
        Symbol("accountType") => "SPOT"
    );
    response = Base.fetch(self.privateGetAccountsBalances(extend(request, params)));
    return self.parseBalance(response)

end
"""
fetch the trading fees for multiple markets
see: https://api-docs.poloniex.com/spot/api/private/account#fee-info

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
"""
function fetchTradingFees(self::Poloniex; params=Dict())
    Base.fetch(self.loadMarkets());
    response = Base.fetch(self.privateGetFeeinfo(params));
    result = Dict{Symbol, Any}();
    symbols = self.symbols;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(symbols)))
        symbol = get(symbols, i + 1, nothing);
        result[Symbol(symbol)] = Dict{Symbol, Any}(
            Symbol("info") => response,
            Symbol("symbol") => symbol,
            Symbol("maker") => self.safeNumber(response, "makerRate"),
            Symbol("taker") => self.safeNumber(response, "takerRate"),
            Symbol("percentage") => true,
            Symbol("tierBased") => true
        );
        i += 1
    end
    return result

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://api-docs.poloniex.com/spot/api/public/market-data#order-book
see: https://api-docs.poloniex.com/v3/futures/api/market/get-order-book

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Poloniex, symbol; limit=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
        if functions.ccxtruthy(get(market, Symbol("contract"), nothing))
            request[Symbol("limit")] = self.findNearestCeiling([5, 10, 20, 100, 150], limit);
        end
    end
    if functions.ccxtruthy(get(market, Symbol("contract"), nothing))
        responseRaw = Base.fetch(self.swapPublicGetV3MarketOrderBook(extend(request, params)));
        data = self.safeDict(responseRaw, "data", defaultValue = Dict{Symbol, Any}());
        ts = safeInteger(data, "ts");
            return self.parseOrderBook(data, symbol, timestamp = ts)
    end
    response = Base.fetch(self.publicGetMarketsSymbolOrderBook(extend(request, params)));
    timestamp = safeInteger(response, "time");
    asks = safeValue(response, "asks");
    bids = safeValue(response, "bids");
    asksResult = [];
    bidsResult = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(asks)))
        if functions.ccxtruthy(functions.ccxt_lt((i % 2), 1))
            price = self.safeNumber(asks, i);
            amount = self.safeNumber(asks, self.sum(i, 1));
                        push!(asksResult, [price, amount]);
        end
        i += 1
    end
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(bids)))
        if functions.ccxtruthy(functions.ccxt_lt((i % 2), 1))
            price = self.safeNumber(bids, i);
            amount = self.safeNumber(bids, self.sum(i, 1));
                        push!(bidsResult, [price, amount]);
        end
        i += 1
    end
    return Dict{Symbol, Any}(
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("bids") => sortBy(bidsResult, 0, true),
    Symbol("asks") => sortBy(asksResult, 0),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("nonce") => nothing
)

end
"""
create a currency deposit address
see: https://api-docs.poloniex.com/spot/api/private/wallet#deposit-addresses

# Arguments
- `code`::string: unified currency code of the currency for the deposit address
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
function createDepositAddress(self::Poloniex, code; params=Dict())
    Base.fetch(self.loadMarkets());
    (request, extraParams, currency, networkEntry) = self.prepareRequestForDepositAddress(code, params = params);
    params = extraParams;
    response = Base.fetch(self.privatePostWalletsAddress(extend(request, params)));
    return self.parseDepositAddressSpecial(response, currency, networkEntry)

end
"""
fetch the deposit address for a currency associated with this account
see: https://api-docs.poloniex.com/spot/api/private/wallet#deposit-addresses

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
function fetchDepositAddress(self::Poloniex, code; params=Dict())
    Base.fetch(self.loadMarkets());
    (request, extraParams, currency, networkEntry) = self.prepareRequestForDepositAddress(code, params = params);
    params = extraParams;
    response = Base.fetch(self.privateGetWalletsAddresses(extend(request, params)));
    keys_var = objectKeys(response);
    len = length(keys_var);
    if functions.ccxtruthy(functions.ccxt_lt(len, 1))
        throw(ExchangeError(string(self.id, " fetchDepositAddress() returned an empty response, you might need to try \"createDepositAddress\" at first and then use \"fetchDepositAddress\"")));
    end
    return self.parseDepositAddressSpecial(response, currency, networkEntry)

end
function prepareRequestForDepositAddress(self::Poloniex, code; params=Dict())
    if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in(code, self.currencies))))
        throw(BadSymbol(string(self.id, " fetchDepositAddress(): can not recognize ", code, " currency, you might try using unified currency-code and add provide specific \"network\" parameter, like: fetchDepositAddress(\"USDT\", { \"network\": \"TRC20\" })")));
    end
    currency = self.currency(code);
    networkCode = nothing;
    (networkCode, params) = self.handleNetworkCodeAndParams(params);
    if functions.ccxtruthy(networkCode == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchDepositAddress requires a network parameter for ", code, ".")));
    end
    exchangeNetworkId = nothing;
    networkCode = self.networkIdToCode(networkId = networkCode, currencyCode = code);
    networkEntry = functions.ccxtruthy((networkCode == nothing)) ? nothing : self.safeDict(get(currency, Symbol("networks"), nothing), networkCode);
    if functions.ccxtruthy(networkEntry != nothing)
        exchangeNetworkId = get(networkEntry, Symbol("id"), nothing);
    else
        exchangeNetworkId = networkCode;
    end
    request = Dict{Symbol, Any}(
        Symbol("currency") => exchangeNetworkId
    );
    return [request, params, currency, networkEntry]

end
function parseDepositAddressSpecial(self::Poloniex, response, currency, networkEntry)
    address = safeString(response, "address");
    if functions.ccxtruthy(address == nothing)
        address = safeString(response, get(networkEntry, Symbol("id"), nothing));
    end
    tag = nothing;
    self.checkAddress(address = address);
    if functions.ccxtruthy(networkEntry != nothing)
        depositAddress = safeString(get(networkEntry, Symbol("info"), nothing), "depositAddress");
        if functions.ccxtruthy(depositAddress != nothing)
            tag = address;
            address = depositAddress;
        end
    end
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("currency") => get(currency, Symbol("code"), nothing),
    Symbol("network") => safeString(networkEntry, "network"),
    Symbol("address") => address,
    Symbol("tag") => tag
)

end
"""
transfer currency internally between wallets on the same account
see: https://api-docs.poloniex.com/spot/api/private/account#accounts-transfer

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: account to transfer from
- `toAccount`::string: account to transfer to
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
function transfer(self::Poloniex, code, amount, fromAccount, toAccount; params=Dict())
    Base.fetch(self.loadMarkets());
    currency = self.currency(code);
    accountsByType = safeValue(self.options, "accountsByType", Dict{Symbol, Any}());
    fromId = safeString(accountsByType, fromAccount, fromAccount);
    toId = safeString(accountsByType, toAccount, fromAccount);
    request = Dict{Symbol, Any}(
        Symbol("amount") => self.currencyToPrecision(code, amount),
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("fromAccount") => fromId,
        Symbol("toAccount") => toId
    );
    response = Base.fetch(self.privatePostAccountsTransfer(extend(request, params)));
    return self.parseTransfer(response, currency = currency)

end
function parseTransfer(self::Poloniex, transfer; currency=nothing)
    return Dict{Symbol, Any}(
    Symbol("info") => transfer,
    Symbol("id") => safeString(transfer, "transferId"),
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("currency") => safeString(currency, "id"),
    Symbol("amount") => nothing,
    Symbol("fromAccount") => nothing,
    Symbol("toAccount") => nothing,
    Symbol("status") => nothing
)

end
"""
make a withdrawal
see: https://api-docs.poloniex.com/spot/api/private/wallet#withdraw-currency

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function withdraw(self::Poloniex, code, amount, address; tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    self.checkAddress(address = address);
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("coin") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => self.currencyToPrecision(code, amount),
        Symbol("address") => address
    );
    networkCode = nothing;
    (networkCode, params) = self.handleNetworkCodeAndParams(params);
    if functions.ccxtruthy(networkCode == nothing)
        throw(ArgumentsRequired(string(self.id, " withdraw requires a network parameter for ", code, ".")));
    end
    request[Symbol("network")] = self.networkCodeToId(networkCode, currencyCode = code);
    if functions.ccxtruthy(tag != nothing)
        request[Symbol("paymentId")] = tag;
    end
    response = Base.fetch(self.privatePostV2WalletsWithdraw(extend(request, params)));
    return self.parseTransaction(response, currency = currency)

end
function fetchTransactionsHelper(self::Poloniex; code=nothing, since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    year = 31104000;
    now = seconds();
    start = functions.ccxtruthy((since != nothing)) ? self.parseToInt(since / 1000) : now - 10 * year;
    request = Dict{Symbol, Any}(
        Symbol("start") => start,
        Symbol("end") => now
    );
    response = Base.fetch(self.privateGetWalletsActivity(extend(request, params)));
    return response

end
"""
fetch history of deposits and withdrawals
see: https://api-docs.poloniex.com/spot/api/private/wallet#wallets-activity-records

# Arguments
- `code`::string, optional: unified currency code for the currency of the deposit/withdrawals, default is undefined
- `since`::int, optional: timestamp in ms of the earliest deposit/withdrawal, default is undefined
- `limit`::int, optional: max number of deposit/withdrawals to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDepositsWithdrawals(self::Poloniex; code=nothing, since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    response = Base.fetch(self.fetchTransactionsHelper(code = code, since = since, limit = limit, params = params));
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    withdrawals = safeValue(response, "withdrawals", []);
    deposits = safeValue(response, "deposits", []);
    withdrawalTransactions = self.parseTransactions(withdrawals, currency = currency, since = since, limit = limit);
    depositTransactions = self.parseTransactions(deposits, currency = currency, since = since, limit = limit);
    transactions = arrayConcat(depositTransactions, withdrawalTransactions);
    return self.filterByCurrencySinceLimit(sortBy(transactions, "timestamp"), code = code, since = since, limit = limit)

end
"""
fetch all withdrawals made from an account
see: https://api-docs.poloniex.com/spot/api/private/wallet#wallets-activity-records

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchWithdrawals(self::Poloniex; code=nothing, since=nothing, limit=nothing, params=Dict())
    response = Base.fetch(self.fetchTransactionsHelper(code = code, since = since, limit = limit, params = params));
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    withdrawals = safeValue(response, "withdrawals", []);
    transactions = self.parseTransactions(withdrawals, currency = currency, since = since, limit = limit);
    return self.filterByCurrencySinceLimit(transactions, code = code, since = since, limit = limit)

end
"""
fetch deposit and withdraw fees
see: https://api-docs.poloniex.com/spot/api/public/reference-data#currency-information

# Arguments
- `codes`::any: list of unified currency codes
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [fees structures]{@link https://docs.ccxt.com/?id=fee-structure}
"""
function fetchDepositWithdrawFees(self::Poloniex; codes=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    response = Base.fetch(self.publicGetCurrencies(extend(params, Dict{Symbol, Any}(
        Symbol("includeMultiChainCurrencies") => true
    ))));
    data = Dict{Symbol, Any}();
    entries = [];
    if functions.ccxtruthy(functions.ccxt_isArray(response))
        entries = response;
    end
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(entries)))
        entry = get(entries, i + 1, nothing);
        currencies = objectKeys(entry);
        currencyId = safeString(currencies, 0);
        data[Symbol(currencyId)] = get(entry, Symbol(currencyId), nothing);
        i += 1
    end
    return self.parseDepositWithdrawFees(data, codes = codes)

end
function parseDepositWithdrawFees(self::Poloniex, response; codes=nothing, currencyIdKey=nothing)
    depositWithdrawFees = Dict{Symbol, Any}();
    codes = self.marketCodes(codes = codes);
    responseKeys = objectKeys(response);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(responseKeys)))
        currencyId = get(responseKeys, i + 1, nothing);
        code = self.safeCurrencyCode(currencyId);
        feeInfo = get(response, Symbol(currencyId), nothing);
        if functions.ccxtruthy(@functions.ccxt_and((code != nothing), (@functions.ccxt_or((codes == nothing), (inArray(code, codes))))))
            currency = self.currency(code);
            depositWithdrawFees[Symbol(code)] = self.parseDepositWithdrawFee(feeInfo, currency = currency);
            childChains = safeValue(feeInfo, "childChains");
            chainsLength = length(childChains);
            if functions.ccxtruthy(functions.ccxt_gt(chainsLength, 0))
                j = 0
                while functions.ccxtruthy(functions.ccxt_lt(j, length(childChains)))
                    networkId = get(childChains, j + 1, nothing);
                    networkId = replace(networkId, code => "");
                    networkCode = self.networkIdToCode(networkId = networkId, currencyCode = get(currency, Symbol("code"), nothing));
                    networkInfo = safeValue(response, networkId);
                    networkObject = Dict{Symbol, Any}();
                    withdrawFee = self.safeNumber(networkInfo, "withdrawalFee");
                    if functions.ccxtruthy(networkCode != nothing)
                        networkObject[Symbol(networkCode)] = Dict{Symbol, Any}(
                            Symbol("withdraw") => Dict{Symbol, Any}(
                                Symbol("fee") => withdrawFee,
                                Symbol("percentage") => functions.ccxtruthy((withdrawFee != nothing)) ? false : nothing
                            ),
                            Symbol("deposit") => Dict{Symbol, Any}(
                                Symbol("fee") => nothing,
                                Symbol("percentage") => nothing
                            )
                        );
                    end
                    depositWithdrawFees[Symbol(code)][Symbol("networks")] = extend(get(get(depositWithdrawFees, Symbol(code), nothing), Symbol("networks"), nothing), networkObject);
                    j += 1
                end

            end
        end
        i += 1
    end
    return depositWithdrawFees

end
function parseDepositWithdrawFee(self::Poloniex, fee; currency=nothing)
    depositWithdrawFee = self.depositWithdrawFee(Dict{Symbol, Any}());
    currencyCode = safeString(currency, "code");
    depositWithdrawFee[Symbol("info")][Symbol(currencyCode)] = fee;
    networkId = safeString(fee, "blockchain");
    withdrawFee = self.safeNumber(fee, "withdrawalFee");
    withdrawResult = Dict{Symbol, Any}(
        Symbol("fee") => withdrawFee,
        Symbol("percentage") => functions.ccxtruthy((withdrawFee != nothing)) ? false : nothing
    );
    depositResult = Dict{Symbol, Any}(
        Symbol("fee") => nothing,
        Symbol("percentage") => nothing
    );
    depositWithdrawFee[Symbol("withdraw")] = withdrawResult;
    depositWithdrawFee[Symbol("deposit")] = depositResult;
    networkCode = self.networkIdToCode(networkId = networkId, currencyCode = safeString(currency, "code"));
    if functions.ccxtruthy(networkCode != nothing)
        depositWithdrawFee[Symbol("networks")][Symbol(networkCode)] = Dict{Symbol, Any}(
            Symbol("withdraw") => withdrawResult,
            Symbol("deposit") => depositResult
        );
    end
    return depositWithdrawFee

end
"""
fetch all deposits made to an account
see: https://api-docs.poloniex.com/spot/api/private/wallet#wallets-activity-records

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDeposits(self::Poloniex; code=nothing, since=nothing, limit=nothing, params=Dict())
    response = Base.fetch(self.fetchTransactionsHelper(code = code, since = since, limit = limit, params = params));
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    deposits = safeValue(response, "deposits", []);
    transactions = self.parseTransactions(deposits, currency = currency, since = since, limit = limit);
    return self.filterByCurrencySinceLimit(transactions, code = code, since = since, limit = limit)

end
function parseTransactionStatus(self::Poloniex, status)
    statuses = Dict{Symbol, Any}(
        Symbol("COMPLETE") => "ok",
        Symbol("COMPLETED") => "ok",
        Symbol("AWAITING APPROVAL") => "pending",
        Symbol("AWAITING_APPROVAL") => "pending",
        Symbol("PENDING") => "pending",
        Symbol("PROCESSING") => "pending",
        Symbol("COMPLETE ERROR") => "failed",
        Symbol("COMPLETE_ERROR") => "failed"
    );
    return safeString(statuses, status, status)

end
function parseTransaction(self::Poloniex, transaction; currency=nothing)
    if functions.ccxtruthy(ccxt_in("withdrawNetworkEntry", transaction))
        transaction = get(transaction, Symbol("response"), nothing);
    end
    timestamp = safeTimestamp(transaction, "timestamp");
    currencyId = safeString(transaction, "currency");
    code = self.safeCurrencyCode(currencyId);
    status = safeString(transaction, "status", "pending");
    status = self.parseTransactionStatus(status);
    txid = safeString(transaction, "txid");
    type_var = functions.ccxtruthy((ccxt_in("withdrawalRequestsId", transaction))) ? "withdrawal" : "deposit";
    id = safeString2(transaction, "withdrawalRequestsId", "depositNumber");
    address = safeString(transaction, "address");
    tag = safeString(transaction, "paymentID");
    amountString = safeString(transaction, "amount");
    feeCostString = safeString(transaction, "fee");
    if functions.ccxtruthy(type_var == "withdrawal")
        amountString = stringSub(amountString, feeCostString);
    end
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => id,
    Symbol("currency") => code,
    Symbol("amount") => self.parseNumber(amountString),
    Symbol("network") => nothing,
    Symbol("address") => address,
    Symbol("addressTo") => nothing,
    Symbol("addressFrom") => nothing,
    Symbol("tag") => tag,
    Symbol("tagTo") => nothing,
    Symbol("tagFrom") => nothing,
    Symbol("status") => status,
    Symbol("type") => type_var,
    Symbol("updated") => nothing,
    Symbol("txid") => txid,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("comment") => nothing,
    Symbol("internal") => nothing,
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("currency") => code,
        Symbol("cost") => self.parseNumber(feeCostString),
        Symbol("rate") => nothing
    )
)

end
"""
set the level of leverage for a market
see: https://api-docs.poloniex.com/v3/futures/api/positions/set-leverage

# Arguments
- `leverage`::int: the rate of leverage
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: 'cross' or 'isolated'

# Returns
- response from the exchange
"""
function setLeverage(self::Poloniex, leverage; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setLeverage() requires a symbol argument")));
    end
    Base.fetch(self.loadMarkets());
    market = self.market(symbol);
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("setLeverage", params = params);
    if functions.ccxtruthy(marginMode == nothing)
        throw(ArgumentsRequired(string(self.id, " setLeverage() requires a marginMode parameter \"cross\" or \"isolated\"")));
    end
    hedged = nothing;
    (hedged, params) = self.handleParamBool(params, "hedged", defaultValue = false);
    if functions.ccxtruthy(hedged)
        if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in("posSide", params))))
            throw(ArgumentsRequired(string(self.id, " setLeverage() requires a posSide parameter for hedged mode: \"LONG\" or \"SHORT\"")));
        end
    end
    request = Dict{Symbol, Any}(
        Symbol("lever") => leverage,
        Symbol("mgnMode") => uppercase(marginMode),
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.swapPrivatePostV3PositionLeverage(extend(request, params)));
    return response

end
"""
fetch the set leverage for a market
see: https://api-docs.poloniex.com/v3/futures/api/positions/get-leverages

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [leverage structure]{@link https://docs.ccxt.com/?id=leverage-structure}
"""
function fetchLeverage(self::Poloniex, symbol; params=Dict())
    Base.fetch(self.loadMarkets());
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("fetchLeverage", params = params);
    if functions.ccxtruthy(marginMode == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchLeverage() requires a marginMode parameter \"cross\" or \"isolated\"")));
    end
    request[Symbol("mgnMode")] =     uppercase(marginMode);
    response = Base.fetch(self.swapPrivateGetV3PositionLeverages(extend(request, params)));
    return self.parseLeverage(response, market = market)

end
function parseLeverage(self::Poloniex, leverage; market=nothing)
    shortLeverage = nothing;
    longLeverage = nothing;
    marketId = nothing;
    marginMode = nothing;
    data = self.safeList(leverage, "data", defaultValue = []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        entry = get(data, i + 1, nothing);
        marketId = safeString(entry, "symbol");
        marginMode = safeString(entry, "mgnMode");
        lever = safeInteger(entry, "lever");
        posSide = safeString(entry, "posSide");
        if functions.ccxtruthy(posSide == "LONG")
            longLeverage = lever;
        elseif functions.ccxtruthy(posSide == "SHORT")
            shortLeverage = lever;
        else
            longLeverage = lever;
            shortLeverage = lever;
        end
        i += 1
    end
    return Dict{Symbol, Any}(
    Symbol("info") => leverage,
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("marginMode") => marginMode,
    Symbol("longLeverage") => longLeverage,
    Symbol("shortLeverage") => shortLeverage
)

end
"""
fetches the position mode, hedged or one way, hedged is set identically for all linear markets or all inverse markets
see: https://api-docs.poloniex.com/v3/futures/api/positions/position-mode-switch

# Arguments
- `symbol`::string, optional: unified symbol of the market to fetch the position mode for (not used by fetchPositionMode)
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an object detailing whether the market is in hedged or one-way mode
"""
function fetchPositionMode(self::Poloniex; symbol=nothing, params=Dict())
    response = Base.fetch(self.swapPrivateGetV3PositionMode(params));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    posMode = safeString(data, "posMode");
    hedged = posMode == "HEDGE";
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("hedged") => hedged
)

end
"""
set hedged to true or false for a market
see: https://api-docs.poloniex.com/v3/futures/api/positions/position-mode-switch

# Arguments
- `hedged`::bool: set to true to use the hedged position mode
- `symbol`::string: not used by setPositionMode ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from the exchange
"""
function setPositionMode(self::Poloniex, hedged; symbol=nothing, params=Dict())
    mode = functions.ccxtruthy(hedged) ? "HEDGE" : "ONE_WAY";
    request = Dict{Symbol, Any}(
        Symbol("posMode") => mode
    );
    response = Base.fetch(self.swapPrivatePostV3PositionMode(extend(request, params)));
    return response

end
"""
fetch all open positions
see: https://api-docs.poloniex.com/v3/futures/api/positions/get-current-position

# Arguments
- `symbols`::any: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.standard`::bool, optional: whether to fetch standard contract positions

# Returns
- a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPositions(self::Poloniex; symbols=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    symbols = self.marketSymbols(symbols = symbols);
    response = Base.fetch(self.swapPrivateGetV3TradePositionOpens(params));
    positions = self.safeList(response, "data", defaultValue = []);
    return self.parsePositions(positions, symbols = symbols)

end
function parsePosition(self::Poloniex, position; market=nothing)
    marketId = safeString(position, "symbol");
    market = self.safeMarket(marketId = marketId, market = market);
    timestamp = safeInteger(position, "cTime");
    marginMode = safeStringLower(position, "mgnMode");
    leverage = safeString(position, "lever");
    initialMargin = safeString(position, "im");
    notional = stringMul(leverage, initialMargin);
    qty = safeString(position, "qty");
    avgPrice = safeString(position, "openAvgPx");
    collateral = stringMul(qty, avgPrice);
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => nothing,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("notional") => notional,
    Symbol("marginMode") => marginMode,
    Symbol("liquidationPrice") => self.safeNumber(position, "liqPx"),
    Symbol("entryPrice") => self.safeNumber(position, "openAvgPx"),
    Symbol("unrealizedPnl") => self.safeNumber(position, "upl"),
    Symbol("percentage") => nothing,
    Symbol("contracts") => self.safeNumber(position, "qty"),
    Symbol("contractSize") => nothing,
    Symbol("markPrice") => self.safeNumber(position, "markPx"),
    Symbol("lastPrice") => nothing,
    Symbol("side") => safeStringLower(position, "posSide"),
    Symbol("hedged") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastUpdateTimestamp") => nothing,
    Symbol("maintenanceMargin") => self.safeNumber(position, "mm"),
    Symbol("maintenanceMarginPercentage") => nothing,
    Symbol("collateral") => collateral,
    Symbol("initialMargin") => initialMargin,
    Symbol("initialMarginPercentage") => nothing,
    Symbol("leverage") => ccxt_parseInt(leverage),
    Symbol("marginRatio") => self.safeNumber(position, "mgnRatio"),
    Symbol("stopLossPrice") => self.safeNumber(position, "slTrgPx"),
    Symbol("takeProfitPrice") => self.safeNumber(position, "tpTrgPx")
))

end
function modifyMarginHelper(self::Poloniex, symbol, amount, type_var; params=Dict())
    Base.fetch(self.loadMarkets());
    market = self.market(symbol);
    amount = self.amountToPrecision(symbol, amount);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("amt") => stringAbs(amount),
        Symbol("type") => uppercase(type_var)
    );
    if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in("posMode", params))))
        request[Symbol("posMode")] = "BOTH";
    end
    response = Base.fetch(self.swapPrivatePostV3TradePositionMargin(extend(request, params)));
    if functions.ccxtruthy(type_var == "reduce")
        amount = stringAbs(amount);
    end
    data = self.safeDict(response, "data");
    return self.parseMarginModification(data, market = market)

end
function parseMarginModification(self::Poloniex, data; market=nothing)
    marketId = safeString(data, "symbol");
    market = self.safeMarket(marketId = marketId, market = market);
    rawType = safeString(data, "type");
    type_var = functions.ccxtruthy((rawType == "ADD")) ? "add" : "reduce";
    return Dict{Symbol, Any}(
    Symbol("info") => data,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("type") => type_var,
    Symbol("marginMode") => nothing,
    Symbol("amount") => self.safeNumber(data, "amt"),
    Symbol("total") => nothing,
    Symbol("code") => nothing,
    Symbol("status") => "ok",
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing
)

end
"""
remove margin from a position

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: the amount of margin to remove
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
function reduceMargin(self::Poloniex, symbol, amount; params=Dict())
    return Base.fetch(self.modifyMarginHelper(symbol, -amount, "reduce", params = params))

end
"""
add margin

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: amount of margin to add
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
function addMargin(self::Poloniex, symbol, amount; params=Dict())
    return Base.fetch(self.modifyMarginHelper(symbol, amount, "add", params = params))

end
function nonce(self::Poloniex, )
    return milliseconds()

end
function sign(self::Poloniex, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    url = get(get(self.urls, Symbol("api"), nothing), Symbol("spot"), nothing);
    if functions.ccxtruthy(inArray(api, ["swapPublic", "swapPrivate"]))
        url = get(get(self.urls, Symbol("api"), nothing), Symbol("swap"), nothing);
    end
    if functions.ccxtruthy(@functions.ccxt_and(method == "GET", (ccxt_in("symbol", params))))
        params[Symbol("symbol")] = self.encodeURIComponent(get(params, Symbol("symbol"), nothing));
    end
    query = omit(params, self.extractParams(path));
    implodedPath = self.implodeParams(path, params);
    if functions.ccxtruthy(@functions.ccxt_or(api == "public", api == "swapPublic"))
        url += string("/", implodedPath);
        if functions.ccxtruthy(length(objectKeys(query)))
            url += string("?", self.urlencode(query));
        end
    else
        self.checkRequiredCredentials();
        timestamp = string(self.nonce());
        auth = string(method, "\n");
        url += string("/", implodedPath);
        auth += string("/", implodedPath);
        if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or((method == "POST"), (method == "PUT")), (method == "DELETE")))
            auth += "\n";
            if functions.ccxtruthy(length(objectKeys(query)))
                body = json(query);
                auth += string("requestBody=", body, "&");
            end
            auth += string("signTimestamp=", timestamp);
        else
            sortedQuery = extend(Dict{Symbol, Any}(
                Symbol("signTimestamp") => timestamp
            ), query);
            sortedQuery = keysort(sortedQuery);
            auth += string("\n", self.urlencode(sortedQuery));
            if functions.ccxtruthy(length(objectKeys(query)))
                url += string("?", self.urlencode(query));
            end
        end
        signature = self.hmac(self.encode(auth), self.encode(self.secret), sha256, "base64");
        headers = Dict{Symbol, Any}(
            Symbol("Content-Type") => "application/json",
            Symbol("key") => self.apiKey,
            Symbol("signTimestamp") => timestamp,
            Symbol("signature") => signature
        );
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Poloniex, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    responseCode = safeString(response, "code");
    if functions.ccxtruthy(@functions.ccxt_and((responseCode != nothing), (responseCode != "200")))
        codeInner = get(response, Symbol("code"), nothing);
        message = safeString(response, "message");
        feedback = string(self.id, " ", body);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), codeInner, feedback);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), message, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Poloniex, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetMarkets(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "markets"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarketsSymbol(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "markets/{symbol}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetCurrencies(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "currencies"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetCurrenciesCurrency(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "currencies/{currency}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV2Currencies(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "v2/currencies"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV2CurrenciesCurrency(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "v2/currencies/{currency}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTimestamp(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "timestamp"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarketsPrice(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "markets/price"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarketsSymbolPrice(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "markets/{symbol}/price"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarketsMarkPrice(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "markets/markPrice"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarketsSymbolMarkPrice(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "markets/{symbol}/markPrice"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarketsSymbolMarkPriceComponents(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "markets/{symbol}/markPriceComponents"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarketsSymbolOrderBook(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "markets/{symbol}/orderBook"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarketsSymbolCandles(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "markets/{symbol}/candles"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarketsSymbolTrades(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "markets/{symbol}/trades"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarketsTicker24h(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "markets/ticker24h"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarketsSymbolTicker24h(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "markets/{symbol}/ticker24h"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarketsCollateralInfo(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "markets/collateralInfo"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarketsCurrencyCollateralInfo(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "markets/{currency}/collateralInfo"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarketsBorrowRatesInfo(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "markets/borrowRatesInfo"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccounts(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "accounts"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountsBalances(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "accounts/balances"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountsIdBalances(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "accounts/{id}/balances"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountsActivity(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "accounts/activity"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountsTransfer(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "accounts/transfer"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountsTransferId(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "accounts/transfer/{id}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetFeeinfo(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "feeinfo"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountsInterestHistory(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "accounts/interest/history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetSubaccounts(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "subaccounts"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetSubaccountsBalances(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "subaccounts/balances"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetSubaccountsIdBalances(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "subaccounts/{id}/balances"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetSubaccountsTransfer(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "subaccounts/transfer"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetSubaccountsTransferId(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "subaccounts/transfer/{id}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetWalletsAddresses(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "wallets/addresses"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetWalletsAddressesCurrency(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "wallets/addresses/{currency}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetWalletsActivity(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "wallets/activity"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetMarginAccountMargin(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "margin/accountMargin"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetMarginBorrowStatus(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "margin/borrowStatus"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetMarginMaxSize(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "margin/maxSize"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrders(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "orders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrdersId(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "orders/{id}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrdersKillSwitchStatus(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "orders/killSwitchStatus"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetSmartorders(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "smartorders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetSmartordersId(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "smartorders/{id}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrdersHistory(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "orders/history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetSmartordersHistory(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "smartorders/history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetTrades(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "trades"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrdersIdTrades(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "orders/{id}/trades"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAccountsTransfer(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "accounts/transfer"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSubaccountsTransfer(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "subaccounts/transfer"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostWalletsAddress(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "wallets/address"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostWalletsWithdraw(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "wallets/withdraw"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV2WalletsWithdraw(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "v2/wallets/withdraw"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrders(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "orders"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrdersBatch(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "orders/batch"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrdersKillSwitch(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "orders/killSwitch"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSmartorders(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "smartorders"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteOrdersId(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "orders/{id}"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteOrdersCancelByIds(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "orders/cancelByIds"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteOrders(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "orders"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteSmartordersId(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "smartorders/{id}"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteSmartordersCancelByIds(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "smartorders/cancelByIds"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteSmartorders(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "smartorders"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePutOrdersId(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "orders/{id}"; api="private", method="PUT", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePutSmartordersId(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "smartorders/{id}"; api="private", method="PUT", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapPublicGetV3MarketAllInstruments(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "v3/market/allInstruments"; api="swapPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapPublicGetV3MarketInstruments(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "v3/market/instruments"; api="swapPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapPublicGetV3MarketOrderBook(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "v3/market/orderBook"; api="swapPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapPublicGetV3MarketCandles(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "v3/market/candles"; api="swapPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapPublicGetV3MarketIndexPriceCandlesticks(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "v3/market/indexPriceCandlesticks"; api="swapPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapPublicGetV3MarketPremiumIndexCandlesticks(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "v3/market/premiumIndexCandlesticks"; api="swapPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapPublicGetV3MarketMarkPriceCandlesticks(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "v3/market/markPriceCandlesticks"; api="swapPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapPublicGetV3MarketTrades(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "v3/market/trades"; api="swapPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapPublicGetV3MarketLiquidationOrder(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "v3/market/liquidationOrder"; api="swapPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapPublicGetV3MarketTickers(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "v3/market/tickers"; api="swapPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapPublicGetV3MarketMarkPrice(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "v3/market/markPrice"; api="swapPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapPublicGetV3MarketIndexPrice(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "v3/market/indexPrice"; api="swapPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapPublicGetV3MarketIndexPriceComponents(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "v3/market/indexPriceComponents"; api="swapPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapPublicGetV3MarketFundingRate(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "v3/market/fundingRate"; api="swapPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapPublicGetV3MarketOpenInterest(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "v3/market/openInterest"; api="swapPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapPublicGetV3MarketInsurance(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "v3/market/insurance"; api="swapPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapPublicGetV3MarketRiskLimit(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "v3/market/riskLimit"; api="swapPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapPrivateGetV3AccountBalance(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "v3/account/balance"; api="swapPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapPrivateGetV3AccountBills(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "v3/account/bills"; api="swapPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapPrivateGetV3TradeOrderOpens(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "v3/trade/order/opens"; api="swapPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapPrivateGetV3TradeOrderTrades(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "v3/trade/order/trades"; api="swapPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapPrivateGetV3TradeOrderHistory(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "v3/trade/order/history"; api="swapPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapPrivateGetV3TradePositionOpens(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "v3/trade/position/opens"; api="swapPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapPrivateGetV3TradePositionHistory(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "v3/trade/position/history"; api="swapPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapPrivateGetV3PositionLeverages(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "v3/position/leverages"; api="swapPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapPrivateGetV3PositionMode(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "v3/position/mode"; api="swapPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapPrivatePostV3TradeOrder(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "v3/trade/order"; api="swapPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapPrivatePostV3TradeOrders(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "v3/trade/orders"; api="swapPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapPrivatePostV3TradePosition(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "v3/trade/position"; api="swapPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapPrivatePostV3TradePositionAll(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "v3/trade/positionAll"; api="swapPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapPrivatePostV3PositionLeverage(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "v3/position/leverage"; api="swapPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapPrivatePostV3PositionMode(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "v3/position/mode"; api="swapPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapPrivatePostV3TradePositionMargin(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "v3/trade/position/margin"; api="swapPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapPrivateDeleteV3TradeOrder(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "v3/trade/order"; api="swapPrivate", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapPrivateDeleteV3TradeBatchOrders(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "v3/trade/batchOrders"; api="swapPrivate", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapPrivateDeleteV3TradeAllOrders(self::Poloniex, params=Dict(), context=Dict())
    return request(self, "v3/trade/allOrders"; api="swapPrivate", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function Poloniex(; kwargs...)
    inst = Poloniex(Exchange(), describe, parseOHLCV, fetchOHLCV, loadMarkets, fetchMarkets, fetchSpotMarkets, fetchSwapMarkets, parseMarket, parseSpotMarket, parseSwapMarket, fetchTime, parseTicker, fetchTickers, fetchCurrencies, parseCurrency, fetchTicker, parseTrade, fetchTrades, fetchMyTrades, parseOrderStatus, parseOrder, parseOrderType, parseOpenOrders, fetchOpenOrders, fetchClosedOrders, createOrder, orderRequest, editOrder, cancelOrder, cancelAllOrders, fetchOrder, fetchOrderStatus, fetchOrderTrades, parseBalance, fetchBalance, fetchTradingFees, fetchOrderBook, createDepositAddress, fetchDepositAddress, prepareRequestForDepositAddress, parseDepositAddressSpecial, transfer, parseTransfer, withdraw, fetchTransactionsHelper, fetchDepositsWithdrawals, fetchWithdrawals, fetchDepositWithdrawFees, parseDepositWithdrawFees, parseDepositWithdrawFee, fetchDeposits, parseTransactionStatus, parseTransaction, setLeverage, fetchLeverage, parseLeverage, fetchPositionMode, setPositionMode, fetchPositions, parsePosition, modifyMarginHelper, parseMarginModification, reduceMargin, addMargin, nonce, sign, handleErrors, publicGetMarkets, publicGetMarketsSymbol, publicGetCurrencies, publicGetCurrenciesCurrency, publicGetV2Currencies, publicGetV2CurrenciesCurrency, publicGetTimestamp, publicGetMarketsPrice, publicGetMarketsSymbolPrice, publicGetMarketsMarkPrice, publicGetMarketsSymbolMarkPrice, publicGetMarketsSymbolMarkPriceComponents, publicGetMarketsSymbolOrderBook, publicGetMarketsSymbolCandles, publicGetMarketsSymbolTrades, publicGetMarketsTicker24h, publicGetMarketsSymbolTicker24h, publicGetMarketsCollateralInfo, publicGetMarketsCurrencyCollateralInfo, publicGetMarketsBorrowRatesInfo, privateGetAccounts, privateGetAccountsBalances, privateGetAccountsIdBalances, privateGetAccountsActivity, privateGetAccountsTransfer, privateGetAccountsTransferId, privateGetFeeinfo, privateGetAccountsInterestHistory, privateGetSubaccounts, privateGetSubaccountsBalances, privateGetSubaccountsIdBalances, privateGetSubaccountsTransfer, privateGetSubaccountsTransferId, privateGetWalletsAddresses, privateGetWalletsAddressesCurrency, privateGetWalletsActivity, privateGetMarginAccountMargin, privateGetMarginBorrowStatus, privateGetMarginMaxSize, privateGetOrders, privateGetOrdersId, privateGetOrdersKillSwitchStatus, privateGetSmartorders, privateGetSmartordersId, privateGetOrdersHistory, privateGetSmartordersHistory, privateGetTrades, privateGetOrdersIdTrades, privatePostAccountsTransfer, privatePostSubaccountsTransfer, privatePostWalletsAddress, privatePostWalletsWithdraw, privatePostV2WalletsWithdraw, privatePostOrders, privatePostOrdersBatch, privatePostOrdersKillSwitch, privatePostSmartorders, privateDeleteOrdersId, privateDeleteOrdersCancelByIds, privateDeleteOrders, privateDeleteSmartordersId, privateDeleteSmartordersCancelByIds, privateDeleteSmartorders, privatePutOrdersId, privatePutSmartordersId, swapPublicGetV3MarketAllInstruments, swapPublicGetV3MarketInstruments, swapPublicGetV3MarketOrderBook, swapPublicGetV3MarketCandles, swapPublicGetV3MarketIndexPriceCandlesticks, swapPublicGetV3MarketPremiumIndexCandlesticks, swapPublicGetV3MarketMarkPriceCandlesticks, swapPublicGetV3MarketTrades, swapPublicGetV3MarketLiquidationOrder, swapPublicGetV3MarketTickers, swapPublicGetV3MarketMarkPrice, swapPublicGetV3MarketIndexPrice, swapPublicGetV3MarketIndexPriceComponents, swapPublicGetV3MarketFundingRate, swapPublicGetV3MarketOpenInterest, swapPublicGetV3MarketInsurance, swapPublicGetV3MarketRiskLimit, swapPrivateGetV3AccountBalance, swapPrivateGetV3AccountBills, swapPrivateGetV3TradeOrderOpens, swapPrivateGetV3TradeOrderTrades, swapPrivateGetV3TradeOrderHistory, swapPrivateGetV3TradePositionOpens, swapPrivateGetV3TradePositionHistory, swapPrivateGetV3PositionLeverages, swapPrivateGetV3PositionMode, swapPrivatePostV3TradeOrder, swapPrivatePostV3TradeOrders, swapPrivatePostV3TradePosition, swapPrivatePostV3TradePositionAll, swapPrivatePostV3PositionLeverage, swapPrivatePostV3PositionMode, swapPrivatePostV3TradePositionMargin, swapPrivateDeleteV3TradeOrder, swapPrivateDeleteV3TradeBatchOrders, swapPrivateDeleteV3TradeAllOrders)
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
function __ccxt_doc_Poloniex_fetchOHLCV() end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://api-docs.poloniex.com/spot/api/public/market-data#candles
see: https://api-docs.poloniex.com/v3/futures/api/market/get-kline-data

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Poloniex_fetchOHLCV

function __ccxt_doc_Poloniex_fetchMarkets() end
"""
retrieves data on all markets for poloniex
see: https://api-docs.poloniex.com/spot/api/public/reference-data#symbol-information
see: https://api-docs.poloniex.com/v3/futures/api/market/get-all-product-info

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Poloniex_fetchMarkets

function __ccxt_doc_Poloniex_fetchTime() end
"""
fetches the current integer timestamp in milliseconds from the exchange server
see: https://api-docs.poloniex.com/spot/api/public/reference-data#system-timestamp

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
__ccxt_doc_Poloniex_fetchTime

function __ccxt_doc_Poloniex_fetchTickers() end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://api-docs.poloniex.com/spot/api/public/market-data#ticker
see: https://api-docs.poloniex.com/v3/futures/api/market/get-market-info

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Poloniex_fetchTickers

function __ccxt_doc_Poloniex_fetchCurrencies() end
"""
fetches all available currencies on an exchange
see: https://api-docs.poloniex.com/spot/api/public/reference-data#currencyv2-information

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
__ccxt_doc_Poloniex_fetchCurrencies

function __ccxt_doc_Poloniex_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://api-docs.poloniex.com/spot/api/public/market-data#ticker
see: https://api-docs.poloniex.com/v3/futures/api/market/get-market-info

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Poloniex_fetchTicker

function __ccxt_doc_Poloniex_fetchTrades() end
"""
get the list of most recent trades for a particular symbol
see: https://api-docs.poloniex.com/spot/api/public/market-data#trades
see: https://api-docs.poloniex.com/v3/futures/api/market/get-execution-info

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
__ccxt_doc_Poloniex_fetchTrades

function __ccxt_doc_Poloniex_fetchMyTrades() end
"""
fetch all trades made by the user
see: https://api-docs.poloniex.com/spot/api/private/trade#trade-history
see: https://api-docs.poloniex.com/v3/futures/api/trade/get-execution-details

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Poloniex_fetchMyTrades

function __ccxt_doc_Poloniex_fetchOpenOrders() end
"""
fetch all unfilled currently open orders
see: https://api-docs.poloniex.com/spot/api/private/order#open-orders
see: https://api-docs.poloniex.com/spot/api/private/smart-order#open-orders  // trigger orders
see: https://api-docs.poloniex.com/v3/futures/api/trade/get-current-orders

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of  open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: set true to fetch trigger orders instead of regular orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Poloniex_fetchOpenOrders

function __ccxt_doc_Poloniex_fetchClosedOrders() end
"""
fetches information on multiple closed orders made by the user
see: https://api-docs.poloniex.com/v3/futures/api/trade/get-order-history

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest entry

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Poloniex_fetchClosedOrders

function __ccxt_doc_Poloniex_createOrder() end
"""
create a trade order
see: https://api-docs.poloniex.com/spot/api/private/order#create-order
see: https://api-docs.poloniex.com/spot/api/private/smart-order#create-order  // trigger orders

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.triggerPrice`::float, optional: the price at which a trigger order is triggered at
- `params.cost`::float, optional: *spot market buy only* the quote quantity that can be used as an alternative for the amount

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Poloniex_createOrder

function __ccxt_doc_Poloniex_editOrder() end
"""
edit a trade order
see: https://api-docs.poloniex.com/spot/api/private/order#cancel-replace-order
see: https://api-docs.poloniex.com/spot/api/private/smart-order#cancel-replace-order

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float, optional: how much of the currency you want to trade in units of the base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.triggerPrice`::float, optional: The price at which a trigger order is triggered at

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Poloniex_editOrder

function __ccxt_doc_Poloniex_cancelAllOrders() end
"""
cancel all open orders
see: https://api-docs.poloniex.com/spot/api/private/order#cancel-all-orders
see: https://api-docs.poloniex.com/spot/api/private/smart-order#cancel-all-orders  // trigger orders
see: https://api-docs.poloniex.com/v3/futures/api/trade/cancel-all-orders - contract markets

# Arguments
- `symbol`::string, optional: unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: true if canceling trigger orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Poloniex_cancelAllOrders

function __ccxt_doc_Poloniex_fetchOrder() end
"""
fetch an order by it's id
see: https://api-docs.poloniex.com/spot/api/private/order#order-details
see: https://api-docs.poloniex.com/spot/api/private/smart-order#open-orders  // trigger orders

# Arguments
- `id`::string: order id
- `symbol`::string: unified market symbol, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: true if fetching a trigger order

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Poloniex_fetchOrder

function __ccxt_doc_Poloniex_fetchOrderTrades() end
"""
fetch all the trades made from a single order
see: https://api-docs.poloniex.com/spot/api/private/trade#trades-by-order-id

# Arguments
- `id`::string: order id
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Poloniex_fetchOrderTrades

function __ccxt_doc_Poloniex_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://api-docs.poloniex.com/spot/api/private/account#all-account-balances
see: https://api-docs.poloniex.com/v3/futures/api/account/balance

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Poloniex_fetchBalance

function __ccxt_doc_Poloniex_fetchTradingFees() end
"""
fetch the trading fees for multiple markets
see: https://api-docs.poloniex.com/spot/api/private/account#fee-info

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
"""
__ccxt_doc_Poloniex_fetchTradingFees

function __ccxt_doc_Poloniex_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://api-docs.poloniex.com/spot/api/public/market-data#order-book
see: https://api-docs.poloniex.com/v3/futures/api/market/get-order-book

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Poloniex_fetchOrderBook

function __ccxt_doc_Poloniex_createDepositAddress() end
"""
create a currency deposit address
see: https://api-docs.poloniex.com/spot/api/private/wallet#deposit-addresses

# Arguments
- `code`::string: unified currency code of the currency for the deposit address
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
__ccxt_doc_Poloniex_createDepositAddress

function __ccxt_doc_Poloniex_fetchDepositAddress() end
"""
fetch the deposit address for a currency associated with this account
see: https://api-docs.poloniex.com/spot/api/private/wallet#deposit-addresses

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
__ccxt_doc_Poloniex_fetchDepositAddress

function __ccxt_doc_Poloniex_transfer() end
"""
transfer currency internally between wallets on the same account
see: https://api-docs.poloniex.com/spot/api/private/account#accounts-transfer

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: account to transfer from
- `toAccount`::string: account to transfer to
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
__ccxt_doc_Poloniex_transfer

function __ccxt_doc_Poloniex_withdraw() end
"""
make a withdrawal
see: https://api-docs.poloniex.com/spot/api/private/wallet#withdraw-currency

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Poloniex_withdraw

function __ccxt_doc_Poloniex_fetchDepositsWithdrawals() end
"""
fetch history of deposits and withdrawals
see: https://api-docs.poloniex.com/spot/api/private/wallet#wallets-activity-records

# Arguments
- `code`::string, optional: unified currency code for the currency of the deposit/withdrawals, default is undefined
- `since`::int, optional: timestamp in ms of the earliest deposit/withdrawal, default is undefined
- `limit`::int, optional: max number of deposit/withdrawals to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Poloniex_fetchDepositsWithdrawals

function __ccxt_doc_Poloniex_fetchWithdrawals() end
"""
fetch all withdrawals made from an account
see: https://api-docs.poloniex.com/spot/api/private/wallet#wallets-activity-records

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Poloniex_fetchWithdrawals

function __ccxt_doc_Poloniex_fetchDepositWithdrawFees() end
"""
fetch deposit and withdraw fees
see: https://api-docs.poloniex.com/spot/api/public/reference-data#currency-information

# Arguments
- `codes`::any: list of unified currency codes
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [fees structures]{@link https://docs.ccxt.com/?id=fee-structure}
"""
__ccxt_doc_Poloniex_fetchDepositWithdrawFees

function __ccxt_doc_Poloniex_fetchDeposits() end
"""
fetch all deposits made to an account
see: https://api-docs.poloniex.com/spot/api/private/wallet#wallets-activity-records

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Poloniex_fetchDeposits

function __ccxt_doc_Poloniex_setLeverage() end
"""
set the level of leverage for a market
see: https://api-docs.poloniex.com/v3/futures/api/positions/set-leverage

# Arguments
- `leverage`::int: the rate of leverage
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: 'cross' or 'isolated'

# Returns
- response from the exchange
"""
__ccxt_doc_Poloniex_setLeverage

function __ccxt_doc_Poloniex_fetchLeverage() end
"""
fetch the set leverage for a market
see: https://api-docs.poloniex.com/v3/futures/api/positions/get-leverages

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [leverage structure]{@link https://docs.ccxt.com/?id=leverage-structure}
"""
__ccxt_doc_Poloniex_fetchLeverage

function __ccxt_doc_Poloniex_fetchPositionMode() end
"""
fetches the position mode, hedged or one way, hedged is set identically for all linear markets or all inverse markets
see: https://api-docs.poloniex.com/v3/futures/api/positions/position-mode-switch

# Arguments
- `symbol`::string, optional: unified symbol of the market to fetch the position mode for (not used by fetchPositionMode)
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an object detailing whether the market is in hedged or one-way mode
"""
__ccxt_doc_Poloniex_fetchPositionMode

function __ccxt_doc_Poloniex_setPositionMode() end
"""
set hedged to true or false for a market
see: https://api-docs.poloniex.com/v3/futures/api/positions/position-mode-switch

# Arguments
- `hedged`::bool: set to true to use the hedged position mode
- `symbol`::string: not used by setPositionMode ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from the exchange
"""
__ccxt_doc_Poloniex_setPositionMode

function __ccxt_doc_Poloniex_fetchPositions() end
"""
fetch all open positions
see: https://api-docs.poloniex.com/v3/futures/api/positions/get-current-position

# Arguments
- `symbols`::any: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.standard`::bool, optional: whether to fetch standard contract positions

# Returns
- a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Poloniex_fetchPositions

function __ccxt_doc_Poloniex_reduceMargin() end
"""
remove margin from a position

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: the amount of margin to remove
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
__ccxt_doc_Poloniex_reduceMargin

function __ccxt_doc_Poloniex_addMargin() end
"""
add margin

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: amount of margin to add
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
__ccxt_doc_Poloniex_addMargin
