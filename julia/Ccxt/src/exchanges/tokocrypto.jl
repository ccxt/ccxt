@kwdef mutable struct Tokocrypto <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    nonce::Function = nonce
    fetchTime::Function = fetchTime
    fetchMarkets::Function = fetchMarkets
    fetchOrderBook::Function = fetchOrderBook
    parseTrade::Function = parseTrade
    fetchTrades::Function = fetchTrades
    parseTicker::Function = parseTicker
    fetchTickers::Function = fetchTickers
    getMarketIdByType::Function = getMarketIdByType
    fetchTicker::Function = fetchTicker
    fetchBidsAsks::Function = fetchBidsAsks
    parseOHLCV::Function = parseOHLCV
    fetchOHLCV::Function = fetchOHLCV
    fetchBalance::Function = fetchBalance
    parseBalanceCustom::Function = parseBalanceCustom
    parseOrderStatus::Function = parseOrderStatus
    parseOrder::Function = parseOrder
    parseOrderType::Function = parseOrderType
    createOrder::Function = createOrder
    fetchOrder::Function = fetchOrder
    fetchOrders::Function = fetchOrders
    fetchOpenOrders::Function = fetchOpenOrders
    fetchClosedOrders::Function = fetchClosedOrders
    cancelOrder::Function = cancelOrder
    fetchMyTrades::Function = fetchMyTrades
    fetchDepositAddress::Function = fetchDepositAddress
    fetchDeposits::Function = fetchDeposits
    fetchWithdrawals::Function = fetchWithdrawals
    parseTransactionStatusByType::Function = parseTransactionStatusByType
    parseTransaction::Function = parseTransaction
    withdraw::Function = withdraw
    sign::Function = sign
    handleErrors::Function = handleErrors
    calculateRateLimiterCost::Function = calculateRateLimiterCost
end
function describe(self::Tokocrypto, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "tokocrypto",
    Symbol("name") => "Tokocrypto",
    Symbol("countries") => ["ID"],
    Symbol("certified") => false,
    Symbol("pro") => false,
    Symbol("version") => "v1",
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => true,
        Symbol("margin") => true,
        Symbol("swap") => false,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("addMargin") => nothing,
        Symbol("borrowMargin") => nothing,
        Symbol("cancelAllOrders") => false,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => nothing,
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => false,
        Symbol("createDepositAddress") => false,
        Symbol("createMarketBuyOrderWithCost") => true,
        Symbol("createMarketOrderWithCost") => false,
        Symbol("createMarketSellOrderWithCost") => false,
        Symbol("createOrder") => true,
        Symbol("createReduceOnlyOrder") => nothing,
        Symbol("createStopLimitOrder") => true,
        Symbol("createStopLossOrder") => false,
        Symbol("createStopMarketOrder") => true,
        Symbol("createStopOrder") => true,
        Symbol("createTakeProfitOrder") => false,
        Symbol("fetchAccounts") => false,
        Symbol("fetchAllGreeks") => false,
        Symbol("fetchBalance") => true,
        Symbol("fetchBidsAsks") => true,
        Symbol("fetchBorrowInterest") => nothing,
        Symbol("fetchBorrowRateHistories") => nothing,
        Symbol("fetchBorrowRateHistory") => nothing,
        Symbol("fetchCanceledOrders") => false,
        Symbol("fetchClosedOrder") => false,
        Symbol("fetchClosedOrders") => "emulated",
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => false,
        Symbol("fetchDeposit") => false,
        Symbol("fetchDepositAddress") => true,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => false,
        Symbol("fetchDeposits") => true,
        Symbol("fetchDepositsWithdrawals") => false,
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
        Symbol("fetchL3OrderBook") => false,
        Symbol("fetchLedger") => nothing,
        Symbol("fetchLeverage") => false,
        Symbol("fetchLeverageTiers") => false,
        Symbol("fetchLongShortRatio") => false,
        Symbol("fetchLongShortRatioHistory") => false,
        Symbol("fetchMarketLeverageTiers") => "emulated",
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => false,
        Symbol("fetchMarkPrice") => false,
        Symbol("fetchMarkPrices") => false,
        Symbol("fetchMySettlementHistory") => false,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterestHistory") => false,
        Symbol("fetchOpenInterests") => false,
        Symbol("fetchOpenOrder") => false,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOption") => false,
        Symbol("fetchOptionChain") => false,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrderBooks") => false,
        Symbol("fetchOrders") => true,
        Symbol("fetchOrderTrades") => false,
        Symbol("fetchPosition") => false,
        Symbol("fetchPositionHistory") => false,
        Symbol("fetchPositionMode") => false,
        Symbol("fetchPositions") => false,
        Symbol("fetchPositionsForSymbol") => false,
        Symbol("fetchPositionsHistory") => false,
        Symbol("fetchPositionsRisk") => false,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchSettlementHistory") => false,
        Symbol("fetchStatus") => false,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => false,
        Symbol("fetchTradingFees") => false,
        Symbol("fetchTradingLimits") => false,
        Symbol("fetchTransactionFee") => false,
        Symbol("fetchTransactionFees") => false,
        Symbol("fetchTransactions") => false,
        Symbol("fetchTransfers") => false,
        Symbol("fetchUnderlyingAssets") => false,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("fetchWithdrawal") => false,
        Symbol("fetchWithdrawals") => true,
        Symbol("fetchWithdrawalWhitelist") => false,
        Symbol("reduceMargin") => false,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("setLeverage") => false,
        Symbol("setMargin") => false,
        Symbol("setMarginMode") => false,
        Symbol("setPositionMode") => false,
        Symbol("signIn") => false,
        Symbol("transfer") => false,
        Symbol("withdraw") => true
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "1m",
        Symbol("3m") => "3m",
        Symbol("5m") => "5m",
        Symbol("15m") => "15m",
        Symbol("30m") => "30m",
        Symbol("1h") => "1h",
        Symbol("2h") => "2h",
        Symbol("4h") => "4h",
        Symbol("6h") => "6h",
        Symbol("8h") => "8h",
        Symbol("12h") => "12h",
        Symbol("1d") => "1d",
        Symbol("3d") => "3d",
        Symbol("1w") => "1w",
        Symbol("1M") => "1M"
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://user-images.githubusercontent.com/1294454/183870484-d3398d0c-f6a1-4cce-91b8-d58792308716.jpg",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("rest") => Dict{Symbol, Any}(
                Symbol("public") => "https://www.tokocrypto.com",
                Symbol("binance") => "https://api.binance.com/api/v3",
                Symbol("private") => "https://www.tokocrypto.com"
            )
        ),
        Symbol("www") => "https://tokocrypto.com",
        Symbol("doc") => "https://www.tokocrypto.com/apidocs/",
        Symbol("fees") => "https://www.tokocrypto.com/fees/newschedule"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("binance") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("ping") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("time") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("depth") => Dict{Symbol, Any}(
    Symbol("cost") => 1,
    Symbol("byLimit") => [[100, 1], [500, 5], [1000, 10], [5000, 50]]
),
                Symbol("trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("aggTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("historicalTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("klines") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ticker/24hr") => Dict{Symbol, Any}(
    Symbol("cost") => 1,
    Symbol("noSymbol") => 40
),
                Symbol("ticker/price") => Dict{Symbol, Any}(
    Symbol("cost") => 1,
    Symbol("noSymbol") => 2
),
                Symbol("ticker/bookTicker") => Dict{Symbol, Any}(
    Symbol("cost") => 1,
    Symbol("noSymbol") => 2
),
                Symbol("exchangeInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 10
)
            ),
            Symbol("put") => Dict{Symbol, Any}(
                Symbol("userDataStream") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("userDataStream") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("userDataStream") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("open/v1/common/time") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("open/v1/common/symbols") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("open/v1/market/depth") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("open/v1/market/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("open/v1/market/agg-trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("open/v1/market/klines") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("open/v1/orders/detail") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("open/v1/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("open/v1/account/spot") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("open/v1/account/spot/asset") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("open/v1/orders/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("open/v1/withdraws") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("open/v1/deposits") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("open/v1/deposits/address") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("open/v1/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("open/v1/orders/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("open/v1/orders/oco") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("open/v1/withdraws") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("open/v1/user-data-stream") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("tierBased") => true,
            Symbol("percentage") => true,
            Symbol("taker") => self.parseNumber("0.0075"),
            Symbol("maker") => self.parseNumber("0.0075")
        )
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("createMarketBuyOrderRequiresPrice") => true,
        Symbol("defaultTimeInForce") => "GTC",
        Symbol("hasAlreadyAuthenticatedSuccessfully") => false,
        Symbol("warnOnFetchOpenOrdersWithoutSymbol") => true,
        Symbol("recvWindow") => 5 * 1000,
        Symbol("timeDifference") => 0,
        Symbol("adjustForTimeDifference") => false,
        Symbol("newOrderRespType") => Dict{Symbol, Any}(
            Symbol("market") => "FULL",
            Symbol("limit") => "FULL"
        ),
        Symbol("quoteOrderQty") => false,
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("ERC20") => "ETH",
            Symbol("TRC20") => "TRX",
            Symbol("BEP2") => "BNB",
            Symbol("BEP20") => "BSC",
            Symbol("OMNI") => "OMNI",
            Symbol("EOS") => "EOS",
            Symbol("SOL") => "SOL"
        ),
        Symbol("reverseNetworks") => Dict{Symbol, Any}(
            Symbol("tronscan.org") => "TRC20",
            Symbol("etherscan.io") => "ERC20",
            Symbol("bscscan.com") => "BSC",
            Symbol("explorer.binance.org") => "BEP2",
            Symbol("bithomp.com") => "XRP",
            Symbol("bloks.io") => "EOS",
            Symbol("stellar.expert") => "XLM",
            Symbol("blockchair.com/bitcoin") => "BTC",
            Symbol("blockchair.com/bitcoin-cash") => "BCH",
            Symbol("blockchair.com/ecash") => "XEC",
            Symbol("explorer.litecoin.net") => "LTC",
            Symbol("explorer.avax.network") => "AVAX",
            Symbol("solscan.io") => "SOL",
            Symbol("polkadot.subscan.io") => "DOT",
            Symbol("dashboard.internetcomputer.org") => "ICP",
            Symbol("explorer.chiliz.com") => "CHZ",
            Symbol("cardanoscan.io") => "ADA",
            Symbol("mainnet.theoan.com") => "AION",
            Symbol("algoexplorer.io") => "ALGO",
            Symbol("explorer.ambrosus.com") => "AMB",
            Symbol("viewblock.io/zilliqa") => "ZIL",
            Symbol("viewblock.io/arweave") => "AR",
            Symbol("explorer.ark.io") => "ARK",
            Symbol("atomscan.com") => "ATOM",
            Symbol("www.mintscan.io") => "CTK",
            Symbol("explorer.bitcoindiamond.org") => "BCD",
            Symbol("btgexplorer.com") => "BTG",
            Symbol("bts.ai") => "BTS",
            Symbol("explorer.celo.org") => "CELO",
            Symbol("explorer.nervos.org") => "CKB",
            Symbol("cerebro.cortexlabs.ai") => "CTXC",
            Symbol("chainz.cryptoid.info") => "VIA",
            Symbol("explorer.dcrdata.org") => "DCR",
            Symbol("digiexplorer.info") => "DGB",
            Symbol("dock.subscan.io") => "DOCK",
            Symbol("dogechain.info") => "DOGE",
            Symbol("explorer.elrond.com") => "EGLD",
            Symbol("blockscout.com") => "ETC",
            Symbol("explore-fetchhub.fetch.ai") => "FET",
            Symbol("filfox.info") => "FIL",
            Symbol("fio.bloks.io") => "FIO",
            Symbol("explorer.firo.org") => "FIRO",
            Symbol("neoscan.io") => "NEO",
            Symbol("ftmscan.com") => "FTM",
            Symbol("explorer.gochain.io") => "GO",
            Symbol("block.gxb.io") => "GXS",
            Symbol("hash-hash.info") => "HBAR",
            Symbol("www.hiveblockexplorer.com") => "HIVE",
            Symbol("explorer.helium.com") => "HNT",
            Symbol("tracker.icon.foundation") => "ICX",
            Symbol("www.iostabc.com") => "IOST",
            Symbol("explorer.iota.org") => "IOTA",
            Symbol("iotexscan.io") => "IOTX",
            Symbol("irishub.iobscan.io") => "IRIS",
            Symbol("kava.mintscan.io") => "KAVA",
            Symbol("scope.klaytn.com") => "KLAY",
            Symbol("kmdexplorer.io") => "KMD",
            Symbol("kusama.subscan.io") => "KSM",
            Symbol("explorer.lto.network") => "LTO",
            Symbol("polygonscan.com") => "POLYGON",
            Symbol("explorer.ont.io") => "ONT",
            Symbol("minaexplorer.com") => "MINA",
            Symbol("nanolooker.com") => "NANO",
            Symbol("explorer.nebulas.io") => "NAS",
            Symbol("explorer.nbs.plus") => "NBS",
            Symbol("explorer.nebl.io") => "NEBL",
            Symbol("nulscan.io") => "NULS",
            Symbol("nxscan.com") => "NXS",
            Symbol("explorer.harmony.one") => "ONE",
            Symbol("explorer.poa.network") => "POA",
            Symbol("qtum.info") => "QTUM",
            Symbol("explorer.rsk.co") => "RSK",
            Symbol("www.oasisscan.com") => "ROSE",
            Symbol("ravencoin.network") => "RVN",
            Symbol("sc.tokenview.com") => "SC",
            Symbol("secretnodes.com") => "SCRT",
            Symbol("explorer.skycoin.com") => "SKY",
            Symbol("steemscan.com") => "STEEM",
            Symbol("explorer.stacks.co") => "STX",
            Symbol("www.thetascan.io") => "THETA",
            Symbol("scan.tomochain.com") => "TOMO",
            Symbol("explore.vechain.org") => "VET",
            Symbol("explorer.vite.net") => "VITE",
            Symbol("www.wanscan.org") => "WAN",
            Symbol("wavesexplorer.com") => "WAVES",
            Symbol("wax.eosx.io") => "WAXP",
            Symbol("waltonchain.pro") => "WTC",
            Symbol("chain.nem.ninja") => "XEM",
            Symbol("verge-blockchain.info") => "XVG",
            Symbol("explorer.yoyow.org") => "YOYOW",
            Symbol("explorer.zcha.in") => "ZEC",
            Symbol("explorer.zensystem.io") => "ZEN"
        ),
        Symbol("impliedNetworks") => Dict{Symbol, Any}(
            Symbol("ETH") => Dict{Symbol, Any}(
                Symbol("ERC20") => "ETH"
            ),
            Symbol("TRX") => Dict{Symbol, Any}(
                Symbol("TRC20") => "TRX"
            )
        ),
        Symbol("legalMoney") => Dict{Symbol, Any}(
            Symbol("MXN") => true,
            Symbol("UGX") => true,
            Symbol("SEK") => true,
            Symbol("CHF") => true,
            Symbol("VND") => true,
            Symbol("AED") => true,
            Symbol("DKK") => true,
            Symbol("KZT") => true,
            Symbol("HUF") => true,
            Symbol("PEN") => true,
            Symbol("PHP") => true,
            Symbol("USD") => true,
            Symbol("TRY") => true,
            Symbol("EUR") => true,
            Symbol("NGN") => true,
            Symbol("PLN") => true,
            Symbol("BRL") => true,
            Symbol("ZAR") => true,
            Symbol("KES") => true,
            Symbol("ARS") => true,
            Symbol("RUB") => true,
            Symbol("AUD") => true,
            Symbol("NOK") => true,
            Symbol("CZK") => true,
            Symbol("GBP") => true,
            Symbol("UAH") => true,
            Symbol("GHS") => true,
            Symbol("HKD") => true,
            Symbol("CAD") => true,
            Symbol("INR") => true,
            Symbol("JPY") => true,
            Symbol("NZD") => true
        )
    ),
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("System is under maintenance.") => OnMaintenance,
            Symbol("System abnormality") => ExchangeError,
            Symbol("You are not authorized to execute this request.") => PermissionDenied,
            Symbol("API key does not exist") => AuthenticationError,
            Symbol("Order would trigger immediately.") => OrderImmediatelyFillable,
            Symbol("Stop price would trigger immediately.") => OrderImmediatelyFillable,
            Symbol("Order would immediately match and take.") => OrderImmediatelyFillable,
            Symbol("Account has insufficient balance for requested action.") => InsufficientFunds,
            Symbol("Rest API trading is not enabled.") => ExchangeNotAvailable,
            Symbol("You don't have permission.") => PermissionDenied,
            Symbol("Market is closed.") => ExchangeNotAvailable,
            Symbol("Too many requests. Please try again later.") => DDoSProtection,
            Symbol("This action disabled is on this account.") => AccountSuspended,
            Symbol("-1000") => ExchangeNotAvailable,
            Symbol("-1001") => ExchangeNotAvailable,
            Symbol("-1002") => AuthenticationError,
            Symbol("-1003") => RateLimitExceeded,
            Symbol("-1004") => DDoSProtection,
            Symbol("-1005") => PermissionDenied,
            Symbol("-1006") => BadResponse,
            Symbol("-1007") => RequestTimeout,
            Symbol("-1010") => BadResponse,
            Symbol("-1011") => PermissionDenied,
            Symbol("-1013") => InvalidOrder,
            Symbol("-1014") => InvalidOrder,
            Symbol("-1015") => RateLimitExceeded,
            Symbol("-1016") => ExchangeNotAvailable,
            Symbol("-1020") => BadRequest,
            Symbol("-1021") => InvalidNonce,
            Symbol("-1022") => AuthenticationError,
            Symbol("-1023") => BadRequest,
            Symbol("-1099") => AuthenticationError,
            Symbol("-1100") => BadRequest,
            Symbol("-1101") => BadRequest,
            Symbol("-1102") => BadRequest,
            Symbol("-1103") => BadRequest,
            Symbol("-1104") => BadRequest,
            Symbol("-1105") => BadRequest,
            Symbol("-1106") => BadRequest,
            Symbol("-1108") => BadRequest,
            Symbol("-1109") => AuthenticationError,
            Symbol("-1110") => BadRequest,
            Symbol("-1111") => BadRequest,
            Symbol("-1112") => InvalidOrder,
            Symbol("-1113") => BadRequest,
            Symbol("-1114") => BadRequest,
            Symbol("-1115") => BadRequest,
            Symbol("-1116") => BadRequest,
            Symbol("-1117") => BadRequest,
            Symbol("-1118") => BadRequest,
            Symbol("-1119") => BadRequest,
            Symbol("-1120") => BadRequest,
            Symbol("-1121") => BadSymbol,
            Symbol("-1125") => AuthenticationError,
            Symbol("-1127") => BadRequest,
            Symbol("-1128") => BadRequest,
            Symbol("-1130") => BadRequest,
            Symbol("-1131") => BadRequest,
            Symbol("-1136") => BadRequest,
            Symbol("-2008") => AuthenticationError,
            Symbol("-2010") => ExchangeError,
            Symbol("-2011") => OrderNotFound,
            Symbol("-2013") => OrderNotFound,
            Symbol("-2014") => AuthenticationError,
            Symbol("-2015") => AuthenticationError,
            Symbol("-2016") => BadRequest,
            Symbol("-2018") => InsufficientFunds,
            Symbol("-2019") => InsufficientFunds,
            Symbol("-2020") => OrderNotFillable,
            Symbol("-2021") => OrderImmediatelyFillable,
            Symbol("-2022") => InvalidOrder,
            Symbol("-2023") => InsufficientFunds,
            Symbol("-2024") => InsufficientFunds,
            Symbol("-2025") => InvalidOrder,
            Symbol("-2026") => InvalidOrder,
            Symbol("-2027") => InvalidOrder,
            Symbol("-2028") => InsufficientFunds,
            Symbol("-3000") => ExchangeError,
            Symbol("-3001") => AuthenticationError,
            Symbol("-3002") => BadSymbol,
            Symbol("-3003") => BadRequest,
            Symbol("-3004") => ExchangeError,
            Symbol("-3005") => InsufficientFunds,
            Symbol("-3006") => InsufficientFunds,
            Symbol("-3007") => ExchangeError,
            Symbol("-3008") => InsufficientFunds,
            Symbol("-3009") => BadRequest,
            Symbol("-3010") => ExchangeError,
            Symbol("-3011") => BadRequest,
            Symbol("-3012") => ExchangeError,
            Symbol("-3013") => BadRequest,
            Symbol("-3014") => AccountSuspended,
            Symbol("-3015") => ExchangeError,
            Symbol("-3016") => BadRequest,
            Symbol("-3017") => ExchangeError,
            Symbol("-3018") => AccountSuspended,
            Symbol("-3019") => AccountSuspended,
            Symbol("-3020") => InsufficientFunds,
            Symbol("-3021") => BadRequest,
            Symbol("-3022") => AccountSuspended,
            Symbol("-3023") => BadRequest,
            Symbol("-3024") => ExchangeError,
            Symbol("-3025") => BadRequest,
            Symbol("-3026") => BadRequest,
            Symbol("-3027") => BadSymbol,
            Symbol("-3028") => BadSymbol,
            Symbol("-3029") => ExchangeError,
            Symbol("-3036") => AccountSuspended,
            Symbol("-3037") => ExchangeError,
            Symbol("-3038") => BadRequest,
            Symbol("-3041") => InsufficientFunds,
            Symbol("-3042") => BadRequest,
            Symbol("-3043") => BadRequest,
            Symbol("-3044") => DDoSProtection,
            Symbol("-3045") => ExchangeError,
            Symbol("-3999") => ExchangeError,
            Symbol("-4001") => BadRequest,
            Symbol("-4002") => BadRequest,
            Symbol("-4003") => BadRequest,
            Symbol("-4004") => AuthenticationError,
            Symbol("-4005") => RateLimitExceeded,
            Symbol("-4006") => BadRequest,
            Symbol("-4007") => BadRequest,
            Symbol("-4008") => BadRequest,
            Symbol("-4010") => BadRequest,
            Symbol("-4011") => BadRequest,
            Symbol("-4012") => BadRequest,
            Symbol("-4013") => AuthenticationError,
            Symbol("-4014") => PermissionDenied,
            Symbol("-4015") => ExchangeError,
            Symbol("-4016") => PermissionDenied,
            Symbol("-4017") => PermissionDenied,
            Symbol("-4018") => BadSymbol,
            Symbol("-4019") => BadSymbol,
            Symbol("-4021") => BadRequest,
            Symbol("-4022") => BadRequest,
            Symbol("-4023") => ExchangeError,
            Symbol("-4024") => InsufficientFunds,
            Symbol("-4025") => InsufficientFunds,
            Symbol("-4026") => InsufficientFunds,
            Symbol("-4027") => ExchangeError,
            Symbol("-4028") => BadRequest,
            Symbol("-4029") => BadRequest,
            Symbol("-4030") => ExchangeError,
            Symbol("-4031") => ExchangeError,
            Symbol("-4032") => ExchangeError,
            Symbol("-4033") => BadRequest,
            Symbol("-4034") => ExchangeError,
            Symbol("-4035") => PermissionDenied,
            Symbol("-4036") => BadRequest,
            Symbol("-4037") => ExchangeError,
            Symbol("-4038") => ExchangeError,
            Symbol("-4039") => BadRequest,
            Symbol("-4040") => BadRequest,
            Symbol("-4041") => ExchangeError,
            Symbol("-4042") => ExchangeError,
            Symbol("-4043") => BadRequest,
            Symbol("-4044") => BadRequest,
            Symbol("-4045") => ExchangeError,
            Symbol("-4046") => AuthenticationError,
            Symbol("-4047") => BadRequest,
            Symbol("-5001") => BadRequest,
            Symbol("-5002") => InsufficientFunds,
            Symbol("-5003") => InsufficientFunds,
            Symbol("-5004") => BadRequest,
            Symbol("-5005") => InsufficientFunds,
            Symbol("-5006") => BadRequest,
            Symbol("-5007") => BadRequest,
            Symbol("-5008") => InsufficientFunds,
            Symbol("-5009") => BadRequest,
            Symbol("-5010") => ExchangeError,
            Symbol("-5011") => BadRequest,
            Symbol("-5012") => ExchangeError,
            Symbol("-5013") => InsufficientFunds,
            Symbol("-5021") => BadRequest,
            Symbol("-6001") => BadRequest,
            Symbol("-6003") => BadRequest,
            Symbol("-6004") => ExchangeError,
            Symbol("-6005") => InvalidOrder,
            Symbol("-6006") => BadRequest,
            Symbol("-6007") => BadRequest,
            Symbol("-6008") => BadRequest,
            Symbol("-6009") => RateLimitExceeded,
            Symbol("-6011") => BadRequest,
            Symbol("-6012") => InsufficientFunds,
            Symbol("-6013") => ExchangeError,
            Symbol("-6014") => BadRequest,
            Symbol("-6015") => BadRequest,
            Symbol("-6016") => BadRequest,
            Symbol("-6017") => BadRequest,
            Symbol("-6018") => BadRequest,
            Symbol("-6019") => AuthenticationError,
            Symbol("-6020") => BadRequest,
            Symbol("-7001") => BadRequest,
            Symbol("-7002") => BadRequest,
            Symbol("-9000") => InsufficientFunds,
            Symbol("-10017") => BadRequest,
            Symbol("-11008") => InsufficientFunds,
            Symbol("-12014") => RateLimitExceeded,
            Symbol("-13000") => BadRequest,
            Symbol("-13001") => BadRequest,
            Symbol("-13002") => BadRequest,
            Symbol("-13003") => BadRequest,
            Symbol("-13004") => BadRequest,
            Symbol("-13005") => BadRequest,
            Symbol("-13006") => InvalidOrder,
            Symbol("-13007") => AuthenticationError,
            Symbol("-21001") => BadRequest,
            Symbol("-21002") => BadRequest,
            Symbol("-21003") => BadRequest,
            Symbol("100001003") => BadRequest,
            Symbol("2202") => InsufficientFunds,
            Symbol("3210") => InvalidOrder,
            Symbol("3203") => InvalidOrder,
            Symbol("3211") => InvalidOrder,
            Symbol("3207") => InvalidOrder,
            Symbol("3218") => OrderNotFound
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("has no operation privilege") => PermissionDenied,
            Symbol("MAX_POSITION") => InvalidOrder
        )
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("sandbox") => false,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("triggerPrice") => true,
                Symbol("triggerDirection") => false,
                Symbol("triggerPriceType") => nothing,
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
                Symbol("marketBuyRequiresPrice") => true,
                Symbol("selfTradePrevention") => true,
                Symbol("iceberg") => true
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
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 1000,
                Symbol("daysBack") => 100000,
                Symbol("untilDays") => 100000,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 1000,
                Symbol("daysBack") => 100000,
                Symbol("daysBackCanceled") => 1,
                Symbol("untilDays") => 100000,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 1000
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
    )
))

end
function nonce(self::Tokocrypto, )
    return milliseconds() - get(self.options, Symbol("timeDifference"), nothing)

end
function fetchTime(self::Tokocrypto, params=Dict())
    response = Base.fetch(self.publicGetOpenV1CommonTime(params));
    return safeInteger(response, "timestamp")

end
function fetchMarkets(self::Tokocrypto, params=Dict())
    response = Base.fetch(self.publicGetOpenV1CommonSymbols(params));
    if functions.ccxtruthy(get(self.options, Symbol("adjustForTimeDifference"), nothing))
        Base.fetch(self.loadTimeDifference());
    end
    data = safeValue(response, "data", Dict{Symbol, Any}());
    list = safeValue(data, "list", []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(list)))
        market = get(list, i + 1, nothing);
        baseId = safeString(market, "baseAsset");
        quoteId = safeString(market, "quoteAsset");
        id = safeString(market, "symbol");
        lowercaseId = safeStringLower(market, "symbol");
        settleId = safeString(market, "marginAsset");
        base = self.safeCurrencyCode(baseId);
        quote_var = self.safeCurrencyCode(quoteId);
        settle = self.safeCurrencyCode(settleId);
        symbol = string(base, "/", quote_var);
        filters = safeValue(market, "filters", []);
        filtersByType = indexBy(filters, "filterType");
        status = safeString(market, "spotTradingEnable");
        active = (status == "1");
        permissions = safeValue(market, "permissions", []);
        j = 0
        while functions.ccxtruthy(functions.ccxt_lt(j, length(permissions)))
            if functions.ccxtruthy(get(permissions, j + 1, nothing) == "TRD_GRP_003")
                active = false;
                break
            end
            j += 1
        end
        isMarginTradingAllowed = self.safeBool(market, "isMarginTradingAllowed", false);
        entry = Dict{Symbol, Any}(
            Symbol("id") => id,
            Symbol("lowercaseId") => lowercaseId,
            Symbol("symbol") => symbol,
            Symbol("base") => base,
            Symbol("quote") => quote_var,
            Symbol("settle") => settle,
            Symbol("baseId") => baseId,
            Symbol("quoteId") => quoteId,
            Symbol("settleId") => settleId,
            Symbol("type") => "spot",
            Symbol("spot") => true,
            Symbol("margin") => isMarginTradingAllowed,
            Symbol("swap") => false,
            Symbol("future") => false,
            Symbol("delivery") => false,
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
                Symbol("amount") => self.parseNumber(self.parsePrecision(safeString(market, "quantityPrecision"))),
                Symbol("price") => self.parseNumber(self.parsePrecision(safeString(market, "pricePrecision"))),
                Symbol("base") => self.parseNumber(self.parsePrecision(safeString(market, "baseAssetPrecision"))),
                Symbol("quote") => self.parseNumber(self.parsePrecision(safeString(market, "quotePrecision")))
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
        );
        if functions.ccxtruthy(ccxt_in("PRICE_FILTER", filtersByType))
            filter_var = safeValue(filtersByType, "PRICE_FILTER", Dict{Symbol, Any}());
            entry[Symbol("precision")][Symbol("price")] = self.safeNumber(filter_var, "tickSize");
            entry[Symbol("limits")][Symbol("price")] = Dict{Symbol, Any}(
                Symbol("min") => self.safeNumber(filter_var, "minPrice"),
                Symbol("max") => self.safeNumber(filter_var, "maxPrice")
            );
            entry[Symbol("precision")][Symbol("price")] = get(filter_var, Symbol("tickSize"), nothing);
        end
        if functions.ccxtruthy(ccxt_in("LOT_SIZE", filtersByType))
            filter_var = safeValue(filtersByType, "LOT_SIZE", Dict{Symbol, Any}());
            entry[Symbol("precision")][Symbol("amount")] = self.safeNumber(filter_var, "stepSize");
            entry[Symbol("limits")][Symbol("amount")] = Dict{Symbol, Any}(
                Symbol("min") => self.safeNumber(filter_var, "minQty"),
                Symbol("max") => self.safeNumber(filter_var, "maxQty")
            );
        end
        if functions.ccxtruthy(ccxt_in("MARKET_LOT_SIZE", filtersByType))
            filter_var = safeValue(filtersByType, "MARKET_LOT_SIZE", Dict{Symbol, Any}());
            entry[Symbol("limits")][Symbol("market")] = Dict{Symbol, Any}(
                Symbol("min") => self.safeNumber(filter_var, "minQty"),
                Symbol("max") => self.safeNumber(filter_var, "maxQty")
            );
        end
        if functions.ccxtruthy(ccxt_in("MIN_NOTIONAL", filtersByType))
            filter_var = safeValue(filtersByType, "MIN_NOTIONAL", Dict{Symbol, Any}());
            entry[Symbol("limits")][Symbol("cost")][Symbol("min")] = self.safeNumber2(filter_var, "minNotional", "notional");
        end
        push!(result, entry);
        i += 1
    end
    return result

end
function fetchOrderBook(self::Tokocrypto, symbol, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(get(market, Symbol("quote"), nothing) == "USDT")
        request[Symbol("symbol")] = string(safeString(market, "baseId", ""), safeString(market, "quoteId", ""));
        response = Base.fetch(self.binanceGetDepth(extend(request, params)));
    else
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        response = Base.fetch(self.publicGetOpenV1MarketDepth(extend(request, params)));
    end
    data = safeValue(response, "data", response);
    timestamp = safeInteger2(response, "T", "timestamp");
    orderbook = self.parseOrderBook(data, symbol, timestamp);
    orderbook[Symbol("nonce")] = safeInteger(data, "lastUpdateId");
    return orderbook

end
function parseTrade(self::Tokocrypto, trade, market=nothing)
    timestamp = safeInteger2(trade, "T", "time");
    price = safeString2(trade, "p", "price");
    amount = safeString2(trade, "q", "qty");
    cost = safeString2(trade, "quoteQty", "baseQty");
    marketId = safeString(trade, "symbol");
    symbol = self.safeSymbol(marketId, market);
    id = safeString2(trade, "t", "a");
    id = safeString2(trade, "id", "tradeId", id);
    side = nothing;
    orderId = safeString(trade, "orderId");
    buyerMaker = safeValue2(trade, "m", "isBuyerMaker");
    takerOrMaker = nothing;
    if functions.ccxtruthy(buyerMaker != nothing)
        side = functions.ccxtruthy(buyerMaker) ? "sell" : "buy";
        takerOrMaker = "taker";
    elseif functions.ccxtruthy(ccxt_in("side", trade))
        side = safeStringLower(trade, "side");
    else
        if functions.ccxtruthy(ccxt_in("isBuyer", trade))
            side = functions.ccxtruthy(get(trade, Symbol("isBuyer"), nothing)) ? "buy" : "sell";
        end
    end
    fee = nothing;
    if functions.ccxtruthy(ccxt_in("commission", trade))
        fee = Dict{Symbol, Any}(
            Symbol("cost") => safeString(trade, "commission"),
            Symbol("currency") => self.safeCurrencyCode(safeString(trade, "commissionAsset"))
        );
    end
    if functions.ccxtruthy(ccxt_in("isMaker", trade))
        takerOrMaker = functions.ccxtruthy(get(trade, Symbol("isMaker"), nothing)) ? "maker" : "taker";
    end
    if functions.ccxtruthy(ccxt_in("maker", trade))
        takerOrMaker = functions.ccxtruthy(get(trade, Symbol("maker"), nothing)) ? "maker" : "taker";
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => symbol,
    Symbol("id") => id,
    Symbol("order") => orderId,
    Symbol("type") => nothing,
    Symbol("side") => side,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("price") => price,
    Symbol("amount") => amount,
    Symbol("cost") => cost,
    Symbol("fee") => fee
), market)

end
function fetchTrades(self::Tokocrypto, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => self.getMarketIdByType(market)
    );
    if functions.ccxtruthy(get(market, Symbol("quote"), nothing) != "USDT")
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("limit")] = limit;
        end
        responseInner = self.publicGetOpenV1MarketTrades(extend(request, params));
        data = self.safeDict(responseInner, "data", Dict{Symbol, Any}());
        list = self.safeList(data, "list", []);
            return self.parseTrades(list, market, since, limit)
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    defaultMethod = "binanceGetTrades";
    method = safeString(self.options, "fetchTradesMethod", defaultMethod);
    response = nothing;
    if functions.ccxtruthy(@functions.ccxt_and((method == "binanceGetAggTrades"), (since != nothing)))
        request[Symbol("startTime")] = since;
        request[Symbol("endTime")] = self.sum(since, 3600000);
        response = Base.fetch(self.binanceGetAggTrades(extend(request, params)));
    else
        response = Base.fetch(self.binanceGetTrades(extend(request, params)));
    end
    responseList = toArray(response);
    return self.parseTrades(responseList, market, since, limit)

end
function parseTicker(self::Tokocrypto, ticker, market=nothing)
    timestamp = safeInteger(ticker, "closeTime");
    marketId = safeString(ticker, "symbol");
    symbol = self.safeSymbol(marketId, market);
    last_var = safeString(ticker, "lastPrice");
    isCoinm = (ccxt_in("baseVolume", ticker));
    baseVolume = nothing;
    quoteVolume = nothing;
    if functions.ccxtruthy(isCoinm)
        baseVolume = safeString(ticker, "baseVolume");
        quoteVolume = safeString(ticker, "volume");
    else
        baseVolume = safeString(ticker, "volume");
        quoteVolume = safeString(ticker, "quoteVolume");
    end
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => safeString(ticker, "highPrice"),
    Symbol("low") => safeString(ticker, "lowPrice"),
    Symbol("bid") => safeString(ticker, "bidPrice"),
    Symbol("bidVolume") => safeString(ticker, "bidQty"),
    Symbol("ask") => safeString(ticker, "askPrice"),
    Symbol("askVolume") => safeString(ticker, "askQty"),
    Symbol("vwap") => safeString(ticker, "weightedAvgPrice"),
    Symbol("open") => safeString(ticker, "openPrice"),
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => safeString(ticker, "prevClosePrice"),
    Symbol("change") => safeString(ticker, "priceChange"),
    Symbol("percentage") => safeString(ticker, "priceChangePercent"),
    Symbol("average") => nothing,
    Symbol("baseVolume") => baseVolume,
    Symbol("quoteVolume") => quoteVolume,
    Symbol("info") => ticker
), market)

end
function fetchTickers(self::Tokocrypto, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.binanceGetTicker24hr(params));
    return self.parseTickers(response, symbols)

end
function getMarketIdByType(self::Tokocrypto, market)
    if functions.ccxtruthy(get(market, Symbol("quote"), nothing) == "USDT")
            return get(market, Symbol("baseId"), nothing) + get(market, Symbol("quoteId"), nothing)
    end
    return get(market, Symbol("id"), nothing)

end
function fetchTicker(self::Tokocrypto, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => string(safeString(market, "baseId", ""), safeString(market, "quoteId", ""))
    );
    response = Base.fetch(self.binanceGetTicker24hr(extend(request, params)));
    if functions.ccxtruthy(functions.ccxt_isArray(response))
        firstTicker = self.safeDict(response, 0, Dict{Symbol, Any}());
            return self.parseTicker(firstTicker, market)
    end
    return self.parseTicker(response, market)

end
function fetchBidsAsks(self::Tokocrypto, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.binanceGetTickerBookTicker(params));
    return self.parseTickers(response, symbols)

end
function parseOHLCV(self::Tokocrypto, ohlcv, market=nothing)
    return [safeInteger(ohlcv, 0), self.safeNumber(ohlcv, 1), self.safeNumber(ohlcv, 2), self.safeNumber(ohlcv, 3), self.safeNumber(ohlcv, 4), self.safeNumber(ohlcv, 5)]

end
function fetchOHLCV(self::Tokocrypto, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    defaultLimit = 500;
    maxLimit = 1500;
    price = safeString(params, "price");
    until = safeInteger(params, "until");
    params = omit(params, ["price", "until"]);
    limit = functions.ccxtruthy((limit == nothing)) ? defaultLimit : min(limit, maxLimit);
    request = Dict{Symbol, Any}(
        Symbol("interval") => safeString(self.timeframes, timeframe, timeframe),
        Symbol("limit") => limit
    );
    if functions.ccxtruthy(price == "index")
        request[Symbol("pair")] = get(market, Symbol("id"), nothing);
    else
        request[Symbol("symbol")] = self.getMarketIdByType(market);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(until != nothing)
        request[Symbol("endTime")] = until;
    end
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("quote"), nothing) == "USDT")
        response = Base.fetch(self.binanceGetKlines(extend(request, params)));
    else
        response = Base.fetch(self.publicGetOpenV1MarketKlines(extend(request, params)));
    end
    data = [];
    if functions.ccxtruthy(functions.ccxt_isArray(response))
        data = response;
    else
        data = self.safeList(response, "data", []);
    end
    return self.parseOHLCVs(data, market, timeframe, since, limit)

end
function fetchBalance(self::Tokocrypto, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    defaultType = safeString2(self.options, "fetchBalance", "defaultType", "spot");
    type_var = safeString(params, "type", defaultType);
    defaultMarginMode = safeString2(self.options, "marginMode", "defaultMarginMode");
    marginMode = safeStringLower(params, "marginMode", defaultMarginMode);
    request = Dict{Symbol, Any}();
    response = Base.fetch(self.privateGetOpenV1AccountSpot(extend(request, params)));
    return self.parseBalanceCustom(response, type_var, marginMode)

end
function parseBalanceCustom(self::Tokocrypto, response, type_var=nothing, marginMode=nothing)
    timestamp = safeInteger(response, "updateTime");
    result = Dict{Symbol, Any}(
        Symbol("info") => response,
        Symbol("timestamp") => timestamp,
        Symbol("datetime") => self.iso8601(timestamp)
    );
    data = safeValue(response, "data", Dict{Symbol, Any}());
    balances = safeValue(data, "accountAssets", []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(balances)))
        balance = get(balances, i + 1, nothing);
        currencyId = safeString(balance, "asset");
        code = self.safeCurrencyCode(currencyId);
        account = self.account();
        account[Symbol("free")] = safeString(balance, "free");
        account[Symbol("used")] = safeString(balance, "locked");
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
function parseOrderStatus(self::Tokocrypto, status)
    statuses = Dict{Symbol, Any}(
        Symbol("-2") => "open",
        Symbol("0") => "open",
        Symbol("1") => "open",
        Symbol("2") => "closed",
        Symbol("3") => "canceled",
        Symbol("4") => "canceling",
        Symbol("5") => "rejected",
        Symbol("6") => "expired",
        Symbol("NEW") => "open",
        Symbol("PARTIALLY_FILLED") => "open",
        Symbol("FILLED") => "closed",
        Symbol("CANCELED") => "canceled",
        Symbol("PENDING_CANCEL") => "canceling",
        Symbol("REJECTED") => "rejected",
        Symbol("EXPIRED") => "expired"
    );
    return safeString(statuses, status, status)

end
function parseOrder(self::Tokocrypto, order, market=nothing)
    status = self.parseOrderStatus(safeString(order, "status"));
    marketId = safeString(order, "symbol");
    symbol = self.safeSymbol(marketId, market);
    filled = safeString(order, "executedQty", "0");
    timestamp = safeInteger(order, "createTime");
    average = safeString(order, "avgPrice");
    price = safeString2(order, "price", "executedPrice");
    amount = safeString(order, "origQty");
    cost = safeStringN(order, ["cummulativeQuoteQty", "cumQuote", "executedQuoteQty", "cumBase"]);
    id = safeString(order, "orderId");
    type_var = self.parseOrderType(safeStringLower(order, "type"));
    side = safeStringLower(order, "side");
    if functions.ccxtruthy(side == "0")
        side = "buy";
    elseif functions.ccxtruthy(side == "1")
        side = "sell";
    end
    fills = safeValue(order, "fills", []);
    clientOrderId = safeString2(order, "clientOrderId", "clientId");
    timeInForce = safeString(order, "timeInForce");
    if functions.ccxtruthy(timeInForce == "GTX")
        timeInForce = "PO";
    end
    postOnly = @functions.ccxt_or((type_var == "limit_maker"), (timeInForce == "PO"));
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => id,
    Symbol("clientOrderId") => clientOrderId,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("symbol") => symbol,
    Symbol("type") => type_var,
    Symbol("timeInForce") => timeInForce,
    Symbol("postOnly") => postOnly,
    Symbol("reduceOnly") => safeValue(order, "reduceOnly"),
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("triggerPrice") => self.parseNumber(omitZero(safeString(order, "stopPrice"))),
    Symbol("amount") => amount,
    Symbol("cost") => cost,
    Symbol("average") => average,
    Symbol("filled") => filled,
    Symbol("remaining") => nothing,
    Symbol("status") => status,
    Symbol("fee") => nothing,
    Symbol("trades") => fills
), market)

end
function parseOrderType(self::Tokocrypto, status)
    statuses = Dict{Symbol, Any}(
        Symbol("2") => "market",
        Symbol("1") => "limit",
        Symbol("4") => "limit",
        Symbol("7") => "limit"
    );
    return safeString(statuses, status, status)

end
function createOrder(self::Tokocrypto, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    clientOrderId = safeString2(params, "clientOrderId", "clientId");
    postOnly = self.safeBool(params, "postOnly", false);
    if functions.ccxtruthy(postOnly)
        type_var = "LIMIT_MAKER";
    end
    params = omit(params, ["clientId", "clientOrderId"]);
    initialUppercaseType = uppercase(type_var);
    uppercaseType = initialUppercaseType;
    triggerPrice = safeValue2(params, "triggerPrice", "stopPrice");
    if functions.ccxtruthy(triggerPrice != nothing)
        params = omit(params, ["triggerPrice", "stopPrice"]);
        if functions.ccxtruthy(uppercaseType == "MARKET")
            uppercaseType = "STOP_LOSS";
        elseif functions.ccxtruthy(uppercaseType == "LIMIT")
            uppercaseType = "STOP_LOSS_LIMIT";
        end
    end
    validOrderTypes = safeValue(get(market, Symbol("info"), nothing), "orderTypes");
    if functions.ccxtruthy(!functions.ccxtruthy(inArray(uppercaseType, validOrderTypes)))
        if functions.ccxtruthy(initialUppercaseType != uppercaseType)
            throw(InvalidOrder(string(self.id, " triggerPrice parameter is not allowed for ", symbol, " ", type_var, " orders")));
        else
            throw(InvalidOrder(string(self.id, " ", type_var, " is not a valid order type for the ", symbol, " market")));
        end
    end
    reverseOrderTypeMapping = Dict{Symbol, Any}(
        Symbol("LIMIT") => 1,
        Symbol("MARKET") => 2,
        Symbol("STOP_LOSS") => 3,
        Symbol("STOP_LOSS_LIMIT") => 4,
        Symbol("TAKE_PROFIT") => 5,
        Symbol("TAKE_PROFIT_LIMIT") => 6,
        Symbol("LIMIT_MAKER") => 7
    );
    request = Dict{Symbol, Any}(
        Symbol("symbol") => string(get(market, Symbol("baseId"), nothing), "_", get(market, Symbol("quoteId"), nothing)),
        Symbol("type") => safeString(reverseOrderTypeMapping, uppercaseType)
    );
    if functions.ccxtruthy(side == "buy")
        request[Symbol("side")] = 0;
    elseif functions.ccxtruthy(side == "sell")
        request[Symbol("side")] = 1;
    end
    if functions.ccxtruthy(clientOrderId == nothing)
        broker = safeValue(self.options, "broker");
        if functions.ccxtruthy(broker != nothing)
            brokerId = safeString(broker, "marketType");
            if functions.ccxtruthy(brokerId != nothing)
                request[Symbol("clientId")] = string(brokerId, uuid22());
            end
        end
    else
        request[Symbol("clientId")] = clientOrderId;
    end
    priceIsRequired = false;
    triggerPriceIsRequired = false;
    quantityIsRequired = false;
    if functions.ccxtruthy(uppercaseType == "MARKET")
        if functions.ccxtruthy(side == "buy")
            precision = get(get(market, Symbol("precision"), nothing), Symbol("price"), nothing);
            quoteAmount = nothing;
            createMarketBuyOrderRequiresPrice = true;
            (createMarketBuyOrderRequiresPrice, params) = self.handleOptionAndParams(params, "createOrder", "createMarketBuyOrderRequiresPrice", true);
            cost = self.safeNumber2(params, "cost", "quoteOrderQty");
            params = omit(params, ["cost", "quoteOrderQty"]);
            if functions.ccxtruthy(cost != nothing)
                quoteAmount = cost;
            elseif functions.ccxtruthy(createMarketBuyOrderRequiresPrice)
                if functions.ccxtruthy(price == nothing)
                    throw(InvalidOrder(string(self.id, " createOrder() requires the price argument for market buy orders to calculate the total cost to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option or param to false and pass the cost to spend (quote quantity) in the amount argument")));
                else
                    amountString = numberToString(amount);
                    priceString = numberToString(price);
                    quoteAmount = stringMul(amountString, priceString);
                end
            else
                quoteAmount = amount;
            end
            request[Symbol("quoteOrderQty")] = decimalToPrecision(quoteAmount, TRUNCATE, precision, self.precisionMode);
        else
            quantityIsRequired = true;
        end
    elseif functions.ccxtruthy(uppercaseType == "LIMIT")
        priceIsRequired = true;
        quantityIsRequired = true;
    else
        if functions.ccxtruthy(@functions.ccxt_or((uppercaseType == "STOP_LOSS"), (uppercaseType == "TAKE_PROFIT")))
            triggerPriceIsRequired = true;
            quantityIsRequired = true;
            if functions.ccxtruthy(@functions.ccxt_or(get(market, Symbol("linear"), nothing), get(market, Symbol("inverse"), nothing)))
                priceIsRequired = true;
            end
        elseif functions.ccxtruthy(@functions.ccxt_or((uppercaseType == "STOP_LOSS_LIMIT"), (uppercaseType == "TAKE_PROFIT_LIMIT")))
            quantityIsRequired = true;
            triggerPriceIsRequired = true;
            priceIsRequired = true;
        else
            if functions.ccxtruthy(uppercaseType == "LIMIT_MAKER")
                priceIsRequired = true;
                quantityIsRequired = true;
            end

        end

    end
    if functions.ccxtruthy(quantityIsRequired)
        request[Symbol("quantity")] = self.amountToPrecision(symbol, amount);
    end
    if functions.ccxtruthy(priceIsRequired)
        if functions.ccxtruthy(price == nothing)
            throw(InvalidOrder(string(self.id, " createOrder() requires a price argument for a ", type_var, " order")));
        end
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    if functions.ccxtruthy(triggerPriceIsRequired)
        if functions.ccxtruthy(triggerPrice == nothing)
            throw(InvalidOrder(string(self.id, " createOrder() requires a triggerPrice extra param for a ", type_var, " order")));
        else
            request[Symbol("stopPrice")] = self.priceToPrecision(symbol, triggerPrice);
        end
    end
    response = Base.fetch(self.privatePostOpenV1Orders(extend(request, params)));
    rawOrder = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseOrder(rawOrder, market)

end
function fetchOrder(self::Tokocrypto, id, symbol=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("orderId") => id
    );
    response = Base.fetch(self.privateGetOpenV1Orders(extend(request, params)));
    data = safeValue(response, "data", Dict{Symbol, Any}());
    list = safeValue(data, "list", []);
    rawOrder = self.safeDict(list, 0, Dict{Symbol, Any}());
    return self.parseOrder(rawOrder)

end
function fetchOrders(self::Tokocrypto, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateGetOpenV1Orders(extend(request, params)));
    data = safeValue(response, "data", Dict{Symbol, Any}());
    orders = self.safeList(data, "list", []);
    return self.parseOrders(orders, market, since, limit)

end
function fetchOpenOrders(self::Tokocrypto, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("type") => 1
    );
    return Base.fetch(self.fetchOrders(symbol, since, limit, extend(request, params)))

end
function fetchClosedOrders(self::Tokocrypto, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("type") => 2
    );
    return Base.fetch(self.fetchOrders(symbol, since, limit, extend(request, params)))

end
function cancelOrder(self::Tokocrypto, id, symbol=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("orderId") => id
    );
    response = Base.fetch(self.privatePostOpenV1OrdersCancel(extend(request, params)));
    rawOrder = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseOrder(rawOrder)

end
function fetchMyTrades(self::Tokocrypto, symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
    endTime = safeInteger2(params, "until", "endTime");
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(endTime != nothing)
        request[Symbol("endTime")] = endTime;
        params = omit(params, ["endTime", "until"]);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateGetOpenV1OrdersTrades(extend(request, params)));
    data = safeValue(response, "data", Dict{Symbol, Any}());
    trades = self.safeList(data, "list", []);
    return self.parseTrades(trades, market, since, limit)

end
function fetchDepositAddress(self::Tokocrypto, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("asset") => get(currency, Symbol("id"), nothing)
    );
    networks = safeValue(self.options, "networks", Dict{Symbol, Any}());
    network = safeStringUpper(params, "network");
    network = safeString(networks, network, network);
    if functions.ccxtruthy(network != nothing)
        request[Symbol("network")] = network;
        params = omit(params, "network");
    end
    response = Base.fetch(self.privateGetOpenV1DepositsAddress(extend(request, params)));
    data = safeValue(response, "data", Dict{Symbol, Any}());
    address = safeString(data, "address");
    tag = safeString(data, "addressTag", "");
    if functions.ccxtruthy(length(tag) == 0)
        tag = nothing;
    end
    self.checkAddress(address);
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("currency") => code,
    Symbol("network") => safeString(data, "network"),
    Symbol("address") => address,
    Symbol("tag") => tag
)

end
function fetchDeposits(self::Tokocrypto, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = nothing;
    request = Dict{Symbol, Any}();
    until = safeInteger(params, "until");
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("coin")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
        endTime = self.sum(since, 7776000000);
        if functions.ccxtruthy(until != nothing)
            endTime = min(endTime, until);
        end
        request[Symbol("endTime")] = endTime;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateGetOpenV1Deposits(extend(request, params)));
    data = safeValue(response, "data", Dict{Symbol, Any}());
    deposits = self.safeList(data, "list", []);
    return self.parseTransactions(deposits, currency, since, limit)

end
function fetchWithdrawals(self::Tokocrypto, code=nothing, since=nothing, limit=nothing, params=Dict())
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
        request[Symbol("endTime")] = self.sum(since, 7776000000);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateGetOpenV1Withdraws(extend(request, params)));
    data = safeValue(response, "data", Dict{Symbol, Any}());
    withdrawals = self.safeList(data, "list", []);
    return self.parseTransactions(withdrawals, currency, since, limit)

end
function parseTransactionStatusByType(self::Tokocrypto, status, type_var=nothing)
    statusesByType = Dict{Symbol, Any}(
        Symbol("deposit") => Dict{Symbol, Any}(
            Symbol("0") => "pending",
            Symbol("1") => "ok"
        ),
        Symbol("withdrawal") => Dict{Symbol, Any}(
            Symbol("0") => "pending",
            Symbol("1") => "canceled",
            Symbol("2") => "pending",
            Symbol("3") => "failed",
            Symbol("4") => "pending",
            Symbol("5") => "failed",
            Symbol("10") => "ok"
        )
    );
    statuses = safeValue(statusesByType, type_var, Dict{Symbol, Any}());
    return safeString(statuses, status, status)

end
function parseTransaction(self::Tokocrypto, transaction, currency=nothing)
    address = safeString(transaction, "address");
    tag = safeString(transaction, "addressTag");
    if functions.ccxtruthy(tag != nothing)
        if functions.ccxtruthy(functions.ccxt_lt(length(tag), 1))
            tag = nothing;
        end
    end
    txid = safeString(transaction, "txId");
    if functions.ccxtruthy(@functions.ccxt_and((txid != nothing), (findfirst("Internal transfer ", txid) !== nothing)))
        txid = functions.ccxt_slice(txid, 18);
    end
    currencyId = safeString2(transaction, "coin", "fiatCurrency");
    code = self.safeCurrencyCode(currencyId, currency);
    timestamp = nothing;
    insertTime = safeInteger(transaction, "insertTime");
    createTime = safeInteger2(transaction, "createTime", "timestamp");
    type_var = safeString(transaction, "type");
    if functions.ccxtruthy(type_var == nothing)
        if functions.ccxtruthy(@functions.ccxt_and((insertTime != nothing), (createTime == nothing)))
            type_var = "deposit";
            timestamp = insertTime;
        elseif functions.ccxtruthy(@functions.ccxt_and((insertTime == nothing), (createTime != nothing)))
            type_var = "withdrawal";
            timestamp = createTime;
        end
    end
    feeCost = self.safeNumber2(transaction, "transactionFee", "totalFee");
    fee = Dict{Symbol, Any}(
        Symbol("currency") => nothing,
        Symbol("cost") => nothing,
        Symbol("rate") => nothing
    );
    if functions.ccxtruthy(feeCost != nothing)
        fee[Symbol("currency")] = code;
        fee[Symbol("cost")] = feeCost;
    end
    internalRaw = safeInteger(transaction, "transferType");
    internal = false;
    if functions.ccxtruthy(internalRaw != nothing)
        internal = true;
    end
    id = safeString(transaction, "id");
    if functions.ccxtruthy(id == nothing)
        data = safeValue(transaction, "data", Dict{Symbol, Any}());
        id = safeString(data, "withdrawId");
        type_var = "withdrawal";
    end
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => id,
    Symbol("txid") => txid,
    Symbol("type") => type_var,
    Symbol("currency") => code,
    Symbol("network") => safeString(transaction, "network"),
    Symbol("amount") => self.safeNumber(transaction, "amount"),
    Symbol("status") => self.parseTransactionStatusByType(safeString(transaction, "status"), type_var),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("address") => address,
    Symbol("addressFrom") => nothing,
    Symbol("addressTo") => address,
    Symbol("tag") => tag,
    Symbol("tagFrom") => nothing,
    Symbol("tagTo") => tag,
    Symbol("updated") => safeInteger2(transaction, "successTime", "updateTime"),
    Symbol("comment") => nothing,
    Symbol("internal") => internal,
    Symbol("fee") => fee
)

end
function withdraw(self::Tokocrypto, code, amount, address, tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    self.checkAddress(address);
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("asset") => get(currency, Symbol("id"), nothing),
        Symbol("address") => address,
        Symbol("amount") => numberToString(amount)
    );
    if functions.ccxtruthy(tag != nothing)
        request[Symbol("addressTag")] = tag;
    end
    (networkCode, query) = self.handleNetworkCodeAndParams(params);
    networkId = self.networkCodeToId(networkCode, code);
    if functions.ccxtruthy(networkId != nothing)
        request[Symbol("network")] =         uppercase(networkId);
    end
    response = Base.fetch(self.privatePostOpenV1Withdraws(extend(request, query)));
    return self.parseTransaction(response, currency)

end
function sign(self::Tokocrypto, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in(api, get(get(self.urls, Symbol("api"), nothing), Symbol("rest"), nothing)))))
        throw(NotSupported(string(self.id, " does not have a testnet/sandbox URL for ", api, " endpoints")));
    end
    url = get(get(get(self.urls, Symbol("api"), nothing), Symbol("rest"), nothing), Symbol(api), nothing);
    url += string("/", path);
    if functions.ccxtruthy(api == "wapi")
        url += ".html";
    end
    userDataStream = @functions.ccxt_or((path == "userDataStream"), (path == "listenKey"));
    if functions.ccxtruthy(userDataStream)
        if functions.ccxtruthy(self.apiKey)
            headers = Dict{Symbol, Any}(
                Symbol("X-MBX-APIKEY") => self.apiKey,
                Symbol("Content-Type") => "application/x-www-form-urlencoded"
            );
            if functions.ccxtruthy(method != "GET")
                body = self.urlencode(params);
            end
        else
            throw(AuthenticationError(string(self.id, " userDataStream endpoint requires `apiKey` credential")));
        end
    elseif functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or((api == "private"), (@functions.ccxt_and(api == "sapi", path != "system/status"))), (api == "sapiV3")), (@functions.ccxt_and(api == "wapi", path != "systemStatus"))), (api == "dapiPrivate")), (api == "dapiPrivateV2")), (api == "fapiPrivate")), (api == "fapiPrivateV2")))
        self.checkRequiredCredentials();
        query = nothing;
        defaultRecvWindow = safeInteger(self.options, "recvWindow");
        extendedParams = extend(Dict{Symbol, Any}(
            Symbol("timestamp") => self.nonce()
        ), params);
        if functions.ccxtruthy(defaultRecvWindow != nothing)
            extendedParams[Symbol("recvWindow")] = defaultRecvWindow;
        end
        recvWindow = safeInteger(params, "recvWindow");
        if functions.ccxtruthy(recvWindow != nothing)
            extendedParams[Symbol("recvWindow")] = recvWindow;
        end
        if functions.ccxtruthy(@functions.ccxt_and((api == "sapi"), (path == "asset/dust")))
            query = self.urlencodeWithArrayRepeat(extendedParams);
        elseif functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or((path == "batchOrders"), (findfirst("sub-account", path) !== nothing)), (path == "capital/withdraw/apply")), (findfirst("staking", path) !== nothing)))
            query = self.rawencode(extendedParams);
        else
            query = self.urlencode(extendedParams);
        end
        signature = self.hmac(self.encode(query), self.encode(self.secret), sha256);
        query += string("&", "signature=", signature);
        headers = Dict{Symbol, Any}(
            Symbol("X-MBX-APIKEY") => self.apiKey
        );
        if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or((method == "GET"), (method == "DELETE")), (api == "wapi")))
            url += string("?", query);
        else
            body = query;
            headers[Symbol("Content-Type")] = "application/x-www-form-urlencoded";
        end
    else
        if functions.ccxtruthy(length(objectKeys(params)))
            url += string("?", self.urlencode(params));
        end
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Tokocrypto, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(@functions.ccxt_or((code == 418), (code == 429)))
        throw(DDoSProtection(string(self.id, " ", code, " ", reason, " ", body)));
    end
    if functions.ccxtruthy(functions.ccxt_ge(code, 400))
        if functions.ccxtruthy(findfirst("Price * QTY is zero or less", body) !== nothing)
            throw(InvalidOrder(string(self.id, " order cost = amount * price is zero or less ", body)));
        end
        if functions.ccxtruthy(findfirst("LOT_SIZE", body) !== nothing)
            throw(InvalidOrder(string(self.id, " order amount should be evenly divisible by lot size ", body)));
        end
        if functions.ccxtruthy(findfirst("PRICE_FILTER", body) !== nothing)
            throw(InvalidOrder(string(self.id, " order price is invalid, i.e. exceeds allowed price precision, exceeds min price or max price limits or is invalid value in general, use this.priceToPrecision (symbol, amount) ", body)));
        end
    end
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    success = self.safeBool(response, "success", true);
    if functions.ccxtruthy(!functions.ccxtruthy(success))
        messageInner = safeString(response, "msg");
        parsedMessage = nothing;
        if functions.ccxtruthy(messageInner != nothing)
            try
                parsedMessage = functions.ccxt_json_parse(messageInner);
            catch e
                parsedMessage = nothing;

            end
            if functions.ccxtruthy(parsedMessage != nothing)
                response = parsedMessage;
            end
        end
    end
    message = safeString(response, "msg");
    if functions.ccxtruthy(message != nothing)
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), message, string(self.id, " ", message));
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), message, string(self.id, " ", message));
    end
    error = safeString(response, "code");
    if functions.ccxtruthy(error != nothing)
        if functions.ccxtruthy(@functions.ccxt_or((error == "200"), stringEquals(error, "0")))
                return nothing
        end
        if functions.ccxtruthy(@functions.ccxt_and((error == "-2015"), get(self.options, Symbol("hasAlreadyAuthenticatedSuccessfully"), nothing)))
            throw(DDoSProtection(string(self.id, " ", body)));
        end
        feedback = string(self.id, " ", body);
        if functions.ccxtruthy(message == "No need to change margin type.")
            throw(MarginModeAlreadySet(feedback));
        end
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), error, feedback);
        throw(ExchangeError(feedback));
    end
    if functions.ccxtruthy(!functions.ccxtruthy(success))
        throw(ExchangeError(string(self.id, " ", body)));
    end
    return nothing

end
function calculateRateLimiterCost(self::Tokocrypto, api, method, path, params, config=Dict())
    if functions.ccxtruthy(@functions.ccxt_and((ccxt_in("noCoin", config)), !functions.ccxtruthy((ccxt_in("coin", params)))))
            return get(config, Symbol("noCoin"), nothing)
    elseif functions.ccxtruthy(@functions.ccxt_and((ccxt_in("noSymbol", config)), !functions.ccxtruthy((ccxt_in("symbol", params)))))
        return get(config, Symbol("noSymbol"), nothing)
    else
        if functions.ccxtruthy(@functions.ccxt_and((ccxt_in("noPoolId", config)), !functions.ccxtruthy((ccxt_in("poolId", params)))))
                return get(config, Symbol("noPoolId"), nothing)
        elseif functions.ccxtruthy(@functions.ccxt_and((ccxt_in("byLimit", config)), (ccxt_in("limit", params))))
            limit = get(params, Symbol("limit"), nothing);
            byLimit = self.safeList(config, "byLimit", []);
            i = 0
            while functions.ccxtruthy(functions.ccxt_lt(i, length(byLimit)))
                entry = get(byLimit, i + 1, nothing);
                if functions.ccxtruthy(functions.ccxt_le(limit, get(entry, 1, nothing)))
                        return get(entry, 2, nothing)
                end
                i += 1
            end
        end

    end
    return safeInteger(config, "cost", 1)

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Tokocrypto, name::Symbol) = ccxt_getproperty(self, name)

function Tokocrypto(; kwargs...)
    inst = Tokocrypto(Exchange(), describe, nonce, fetchTime, fetchMarkets, fetchOrderBook, parseTrade, fetchTrades, parseTicker, fetchTickers, getMarketIdByType, fetchTicker, fetchBidsAsks, parseOHLCV, fetchOHLCV, fetchBalance, parseBalanceCustom, parseOrderStatus, parseOrder, parseOrderType, createOrder, fetchOrder, fetchOrders, fetchOpenOrders, fetchClosedOrders, cancelOrder, fetchMyTrades, fetchDepositAddress, fetchDeposits, fetchWithdrawals, parseTransactionStatusByType, parseTransaction, withdraw, sign, handleErrors, calculateRateLimiterCost)
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
