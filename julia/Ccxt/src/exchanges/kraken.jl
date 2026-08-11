@kwdef mutable struct Kraken <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    feeToPrecision::Function = feeToPrecision
    fetchMarkets::Function = fetchMarkets
    fetchStatus::Function = fetchStatus
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    safeCurrencyCode::Function = safeCurrencyCode
    fetchTradingFee::Function = fetchTradingFee
    parseTradingFee::Function = parseTradingFee
    parseOrderBookBidAsk::Function = parseOrderBookBidAsk
    fetchOrderBook::Function = fetchOrderBook
    parseTicker::Function = parseTicker
    fetchTickers::Function = fetchTickers
    fetchTicker::Function = fetchTicker
    parseOHLCV::Function = parseOHLCV
    fetchOHLCV::Function = fetchOHLCV
    parseLedgerEntryType::Function = parseLedgerEntryType
    parseLedgerEntry::Function = parseLedgerEntry
    fetchLedger::Function = fetchLedger
    fetchLedgerEntriesByIds::Function = fetchLedgerEntriesByIds
    fetchLedgerEntry::Function = fetchLedgerEntry
    parseTrade::Function = parseTrade
    fetchTrades::Function = fetchTrades
    parseBalance::Function = parseBalance
    fetchBalance::Function = fetchBalance
    createMarketOrderWithCost::Function = createMarketOrderWithCost
    createMarketBuyOrderWithCost::Function = createMarketBuyOrderWithCost
    createOrder::Function = createOrder
    createOrders::Function = createOrders
    findMarketByAltnameOrId::Function = findMarketByAltnameOrId
    getDelistedMarketById::Function = getDelistedMarketById
    parseOrderStatus::Function = parseOrderStatus
    parseOrderType::Function = parseOrderType
    parseOrder::Function = parseOrder
    orderRequest::Function = orderRequest
    editOrder::Function = editOrder
    fetchOrder::Function = fetchOrder
    fetchOrderTrades::Function = fetchOrderTrades
    fetchOrdersByIds::Function = fetchOrdersByIds
    fetchMyTrades::Function = fetchMyTrades
    cancelOrder::Function = cancelOrder
    cancelOrders::Function = cancelOrders
    cancelAllOrders::Function = cancelAllOrders
    cancelAllOrdersAfter::Function = cancelAllOrdersAfter
    fetchOpenOrders::Function = fetchOpenOrders
    fetchClosedOrders::Function = fetchClosedOrders
    parseTransactionStatus::Function = parseTransactionStatus
    parseNetwork::Function = parseNetwork
    parseTransaction::Function = parseTransaction
    parseTransactionsByType::Function = parseTransactionsByType
    fetchDeposits::Function = fetchDeposits
    fetchTime::Function = fetchTime
    fetchWithdrawals::Function = fetchWithdrawals
    addPaginationCursorToResult::Function = addPaginationCursorToResult
    createDepositAddress::Function = createDepositAddress
    fetchDepositMethods::Function = fetchDepositMethods
    fetchDepositAddress::Function = fetchDepositAddress
    parseDepositAddress::Function = parseDepositAddress
    withdraw::Function = withdraw
    fetchPositions::Function = fetchPositions
    parsePosition::Function = parsePosition
    parseAccountType::Function = parseAccountType
    transferOut::Function = transferOut
    transfer::Function = transfer
    parseTransfer::Function = parseTransfer
    sign::Function = sign
    nonce::Function = nonce
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    zendeskGet360000292886::Function = zendeskGet360000292886
    zendeskGet201893608::Function = zendeskGet201893608
    publicGetTime::Function = publicGetTime
    publicGetSystemStatus::Function = publicGetSystemStatus
    publicGetAssets::Function = publicGetAssets
    publicGetAssetPairs::Function = publicGetAssetPairs
    publicGetTicker::Function = publicGetTicker
    publicGetOHLC::Function = publicGetOHLC
    publicGetDepth::Function = publicGetDepth
    publicGetGroupedBook::Function = publicGetGroupedBook
    publicGetTrades::Function = publicGetTrades
    publicGetSpread::Function = publicGetSpread
    publicGetPreTrade::Function = publicGetPreTrade
    publicGetPostTrade::Function = publicGetPostTrade
    privatePostLevel3::Function = privatePostLevel3
    privatePostBalance::Function = privatePostBalance
    privatePostBalanceEx::Function = privatePostBalanceEx
    privatePostCreditLines::Function = privatePostCreditLines
    privatePostTradeBalance::Function = privatePostTradeBalance
    privatePostOpenOrders::Function = privatePostOpenOrders
    privatePostClosedOrders::Function = privatePostClosedOrders
    privatePostQueryOrders::Function = privatePostQueryOrders
    privatePostOrderAmends::Function = privatePostOrderAmends
    privatePostTradesHistory::Function = privatePostTradesHistory
    privatePostQueryTrades::Function = privatePostQueryTrades
    privatePostOpenPositions::Function = privatePostOpenPositions
    privatePostLedgers::Function = privatePostLedgers
    privatePostQueryLedgers::Function = privatePostQueryLedgers
    privatePostTradeVolume::Function = privatePostTradeVolume
    privatePostAddExport::Function = privatePostAddExport
    privatePostExportStatus::Function = privatePostExportStatus
    privatePostRetrieveExport::Function = privatePostRetrieveExport
    privatePostRemoveExport::Function = privatePostRemoveExport
    privatePostGetApiKeyInfo::Function = privatePostGetApiKeyInfo
    privatePostAddOrder::Function = privatePostAddOrder
    privatePostAmendOrder::Function = privatePostAmendOrder
    privatePostCancelOrder::Function = privatePostCancelOrder
    privatePostCancelAll::Function = privatePostCancelAll
    privatePostCancelAllOrdersAfter::Function = privatePostCancelAllOrdersAfter
    privatePostGetWebSocketsToken::Function = privatePostGetWebSocketsToken
    privatePostAddOrderBatch::Function = privatePostAddOrderBatch
    privatePostCancelOrderBatch::Function = privatePostCancelOrderBatch
    privatePostEditOrder::Function = privatePostEditOrder
    privatePostDepositMethods::Function = privatePostDepositMethods
    privatePostDepositAddresses::Function = privatePostDepositAddresses
    privatePostDepositStatus::Function = privatePostDepositStatus
    privatePostWithdrawMethods::Function = privatePostWithdrawMethods
    privatePostWithdrawAddresses::Function = privatePostWithdrawAddresses
    privatePostWithdrawInfo::Function = privatePostWithdrawInfo
    privatePostWithdraw::Function = privatePostWithdraw
    privatePostWithdrawStatus::Function = privatePostWithdrawStatus
    privatePostWithdrawCancel::Function = privatePostWithdrawCancel
    privatePostWalletTransfer::Function = privatePostWalletTransfer
    privatePostCreateSubaccount::Function = privatePostCreateSubaccount
    privatePostAccountTransfer::Function = privatePostAccountTransfer
    privatePostEarnAllocate::Function = privatePostEarnAllocate
    privatePostEarnDeallocate::Function = privatePostEarnDeallocate
    privatePostEarnAllocateStatus::Function = privatePostEarnAllocateStatus
    privatePostEarnDeallocateStatus::Function = privatePostEarnDeallocateStatus
    privatePostEarnStrategies::Function = privatePostEarnStrategies
    privatePostEarnAllocations::Function = privatePostEarnAllocations

end
function describe(self::Kraken, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "kraken",
    Symbol("name") => "Kraken",
    Symbol("countries") => ["US"],
    Symbol("version") => "0",
    Symbol("rateLimit") => 1000,
    Symbol("certified") => false,
    Symbol("pro") => true,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => true,
        Symbol("margin") => true,
        Symbol("swap") => false,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("addMargin") => false,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelAllOrdersAfter") => true,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => true,
        Symbol("createDepositAddress") => true,
        Symbol("createMarketBuyOrderWithCost") => true,
        Symbol("createMarketOrderWithCost") => true,
        Symbol("createMarketSellOrderWithCost") => false,
        Symbol("createOrder") => true,
        Symbol("createOrders") => true,
        Symbol("createStopLimitOrder") => true,
        Symbol("createStopMarketOrder") => true,
        Symbol("createStopOrder") => true,
        Symbol("createTrailingAmountOrder") => true,
        Symbol("createTrailingPercentOrder") => true,
        Symbol("editOrder") => true,
        Symbol("fetchBalance") => true,
        Symbol("fetchBorrowInterest") => false,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDepositAddress") => true,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => false,
        Symbol("fetchDeposits") => true,
        Symbol("fetchFundingHistory") => false,
        Symbol("fetchFundingRate") => false,
        Symbol("fetchFundingRateHistory") => false,
        Symbol("fetchFundingRates") => false,
        Symbol("fetchIndexOHLCV") => false,
        Symbol("fetchIsolatedBorrowRate") => false,
        Symbol("fetchIsolatedBorrowRates") => false,
        Symbol("fetchLedger") => true,
        Symbol("fetchLedgerEntry") => true,
        Symbol("fetchLeverageTiers") => false,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => false,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterestHistory") => false,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrderTrades") => "emulated",
        Symbol("fetchPositions") => true,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchStatus") => true,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => true,
        Symbol("fetchTradingFees") => false,
        Symbol("fetchWithdrawals") => true,
        Symbol("setLeverage") => false,
        Symbol("setMarginMode") => false,
        Symbol("transfer") => true,
        Symbol("withdraw") => true
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => 1,
        Symbol("5m") => 5,
        Symbol("15m") => 15,
        Symbol("30m") => 30,
        Symbol("1h") => 60,
        Symbol("4h") => 240,
        Symbol("1d") => 1440,
        Symbol("1w") => 10080,
        Symbol("2w") => 21600
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://user-images.githubusercontent.com/51840849/76173629-fc67fb00-61b1-11ea-84fe-f2de582f58a3.jpg",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => "https://api.kraken.com",
            Symbol("private") => "https://api.kraken.com",
            Symbol("zendesk") => "https://kraken.zendesk.com/api/v2/help_center/en-us/articles"
        ),
        Symbol("www") => "https://www.kraken.com",
        Symbol("doc") => "https://docs.kraken.com/api-reference/",
        Symbol("fees") => "https://www.kraken.com/en-us/features/fee-schedule"
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("tierBased") => true,
            Symbol("percentage") => true,
            Symbol("taker") => self.parseNumber("0.0026"),
            Symbol("maker") => self.parseNumber("0.0016"),
            Symbol("tiers") => Dict{Symbol, Any}(
                Symbol("taker") => [[self.parseNumber("0"), self.parseNumber("0.0026")], [self.parseNumber("50000"), self.parseNumber("0.0024")], [self.parseNumber("100000"), self.parseNumber("0.0022")], [self.parseNumber("250000"), self.parseNumber("0.0020")], [self.parseNumber("500000"), self.parseNumber("0.0018")], [self.parseNumber("1000000"), self.parseNumber("0.0016")], [self.parseNumber("2500000"), self.parseNumber("0.0014")], [self.parseNumber("5000000"), self.parseNumber("0.0012")], [self.parseNumber("10000000"), self.parseNumber("0.0001")]],
                Symbol("maker") => [[self.parseNumber("0"), self.parseNumber("0.0016")], [self.parseNumber("50000"), self.parseNumber("0.0014")], [self.parseNumber("100000"), self.parseNumber("0.0012")], [self.parseNumber("250000"), self.parseNumber("0.0010")], [self.parseNumber("500000"), self.parseNumber("0.0008")], [self.parseNumber("1000000"), self.parseNumber("0.0006")], [self.parseNumber("2500000"), self.parseNumber("0.0004")], [self.parseNumber("5000000"), self.parseNumber("0.0002")], [self.parseNumber("10000000"), self.parseNumber("0.0")]]
            )
        )
    ),
    Symbol("handleContentTypeApplicationZip") => true,
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("zendesk") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("360000292886") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("201893608") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("Time") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("SystemStatus") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("Assets") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("AssetPairs") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("Ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("OHLC") => Dict{Symbol, Any}(
    Symbol("cost") => 1.2
),
                Symbol("Depth") => Dict{Symbol, Any}(
    Symbol("cost") => 1.2
),
                Symbol("GroupedBook") => Dict{Symbol, Any}(
    Symbol("cost") => 1.2
),
                Symbol("Trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1.2
),
                Symbol("Spread") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("PreTrade") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("PostTrade") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("Level3") => Dict{Symbol, Any}(
    Symbol("cost") => 1.2
),
                Symbol("Balance") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("BalanceEx") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("CreditLines") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("TradeBalance") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("OpenOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("ClosedOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("QueryOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("OrderAmends") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("TradesHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 6
),
                Symbol("QueryTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("OpenPositions") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("Ledgers") => Dict{Symbol, Any}(
    Symbol("cost") => 6
),
                Symbol("QueryLedgers") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("TradeVolume") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("AddExport") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("ExportStatus") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("RetrieveExport") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("RemoveExport") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("GetApiKeyInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("AddOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 0
),
                Symbol("AmendOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 0
),
                Symbol("CancelOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 0
),
                Symbol("CancelAll") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("CancelAllOrdersAfter") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("GetWebSocketsToken") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("AddOrderBatch") => Dict{Symbol, Any}(
    Symbol("cost") => 0
),
                Symbol("CancelOrderBatch") => Dict{Symbol, Any}(
    Symbol("cost") => 0
),
                Symbol("EditOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 0
),
                Symbol("DepositMethods") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("DepositAddresses") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("DepositStatus") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("WithdrawMethods") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("WithdrawAddresses") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("WithdrawInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("Withdraw") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("WithdrawStatus") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("WithdrawCancel") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("WalletTransfer") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("CreateSubaccount") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("AccountTransfer") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("Earn/Allocate") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("Earn/Deallocate") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("Earn/AllocateStatus") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("Earn/DeallocateStatus") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("Earn/Strategies") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("Earn/Allocations") => Dict{Symbol, Any}(
    Symbol("cost") => 3
)
            )
        )
    ),
    Symbol("commonCurrencies") => Dict{Symbol, Any}(
        Symbol("LUNA") => "LUNC",
        Symbol("LUNA2") => "LUNA",
        Symbol("REPV2") => "REP",
        Symbol("REP") => "REPV1",
        Symbol("UST") => "USTC",
        Symbol("XBT") => "BTC",
        Symbol("XDG") => "DOGE",
        Symbol("FEE") => "KFEE",
        Symbol("XETC") => "ETC",
        Symbol("XETH") => "ETH",
        Symbol("XLTC") => "LTC",
        Symbol("XMLN") => "MLN",
        Symbol("XREP") => "REP",
        Symbol("XXBT") => "BTC",
        Symbol("XXDG") => "DOGE",
        Symbol("XXLM") => "XLM",
        Symbol("XXMR") => "XMR",
        Symbol("XXRP") => "XRP",
        Symbol("XZEC") => "ZEC",
        Symbol("ZAUD") => "AUD",
        Symbol("ZCAD") => "CAD",
        Symbol("ZEUR") => "EUR",
        Symbol("ZGBP") => "GBP",
        Symbol("ZJPY") => "JPY",
        Symbol("ZUSD") => "USD"
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("mica") => true,
        Symbol("timeDifference") => 0,
        Symbol("adjustForTimeDifference") => false,
        Symbol("marketsByAltname") => Dict{Symbol, Any}(),
        Symbol("delistedMarketsById") => Dict{Symbol, Any}(),
        Symbol("inactiveCurrencies") => ["CAD", "USD", "JPY", "GBP"],
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("ETH") => "ERC20",
            Symbol("TRX") => "TRC20"
        ),
        Symbol("depositMethods") => Dict{Symbol, Any}(
            Symbol("1INCH") => string("1inch", " ", "(1INCH)"),
            Symbol("AAVE") => "Aave",
            Symbol("ADA") => "ADA",
            Symbol("ALGO") => "Algorand",
            Symbol("ANKR") => string("ANKR", " ", "(ANKR)"),
            Symbol("ANT") => string("Aragon", " ", "(ANT)"),
            Symbol("ATOM") => "Cosmos",
            Symbol("AXS") => string("Axie Infinity Shards", " ", "(AXS)"),
            Symbol("BADGER") => string("Bager DAO", " ", "(BADGER)"),
            Symbol("BAL") => string("Balancer", " ", "(BAL)"),
            Symbol("BAND") => string("Band Protocol", " ", "(BAND)"),
            Symbol("BAT") => "BAT",
            Symbol("BCH") => "Bitcoin Cash",
            Symbol("BNC") => string("Bifrost", " ", "(BNC)"),
            Symbol("BNT") => string("Bancor", " ", "(BNT)"),
            Symbol("BTC") => "Bitcoin",
            Symbol("CHZ") => string("Chiliz", " ", "(CHZ)"),
            Symbol("COMP") => string("Compound", " ", "(COMP)"),
            Symbol("CQT") => string("\tCovalent Query Token", " ", "(CQT)"),
            Symbol("CRV") => string("Curve DAO Token", " ", "(CRV)"),
            Symbol("CTSI") => string("Cartesi", " ", "(CTSI)"),
            Symbol("DAI") => "Dai",
            Symbol("DASH") => "Dash",
            Symbol("DOGE") => "Dogecoin",
            Symbol("DOT") => "Polkadot",
            Symbol("DYDX") => string("dYdX", " ", "(DYDX)"),
            Symbol("ENJ") => string("Enjin Coin", " ", "(ENJ)"),
            Symbol("EOS") => "EOS",
            Symbol("ETC") => string("Ether Classic", " ", "(Hex)"),
            Symbol("ETH") => string("Ether", " ", "(Hex)"),
            Symbol("EWT") => "Energy Web Token",
            Symbol("FEE") => "Kraken Fee Credit",
            Symbol("FIL") => "Filecoin",
            Symbol("FLOW") => "Flow",
            Symbol("GHST") => string("Aavegotchi", " ", "(GHST)"),
            Symbol("GNO") => "GNO",
            Symbol("GRT") => "GRT",
            Symbol("ICX") => "Icon",
            Symbol("INJ") => string("Injective Protocol", " ", "(INJ)"),
            Symbol("KAR") => string("Karura", " ", "(KAR)"),
            Symbol("KAVA") => "Kava",
            Symbol("KEEP") => string("Keep Token", " ", "(KEEP)"),
            Symbol("KNC") => string("Kyber Network", " ", "(KNC)"),
            Symbol("KSM") => "Kusama",
            Symbol("LINK") => "Link",
            Symbol("LPT") => string("Livepeer Token", " ", "(LPT)"),
            Symbol("LRC") => string("Loopring", " ", "(LRC)"),
            Symbol("LSK") => "Lisk",
            Symbol("LTC") => "Litecoin",
            Symbol("MANA") => "MANA",
            Symbol("MATIC") => string("Polygon", " ", "(MATIC)"),
            Symbol("MINA") => "Mina",
            Symbol("MIR") => string("Mirror Protocol", " ", "(MIR)"),
            Symbol("MKR") => string("Maker", " ", "(MKR)"),
            Symbol("MLN") => "MLN",
            Symbol("MOVR") => string("Moonriver", " ", "(MOVR)"),
            Symbol("NANO") => "NANO",
            Symbol("OCEAN") => "OCEAN",
            Symbol("OGN") => string("Origin Protocol", " ", "(OGN)"),
            Symbol("OMG") => "OMG",
            Symbol("OXT") => string("Orchid", " ", "(OXT)"),
            Symbol("OXY") => string("Oxygen", " ", "(OXY)"),
            Symbol("PAXG") => string("PAX", " ", "(Gold)"),
            Symbol("PERP") => string("Perpetual Protocol", " ", "(PERP)"),
            Symbol("PHA") => string("Phala", " ", "(PHA)"),
            Symbol("QTUM") => "QTUM",
            Symbol("RARI") => string("Rarible", " ", "(RARI)"),
            Symbol("RAY") => string("Raydium", " ", "(RAY)"),
            Symbol("REN") => string("Ren Protocol", " ", "(REN)"),
            Symbol("REP") => "REPv2",
            Symbol("REPV1") => "REP",
            Symbol("SAND") => string("The Sandbox", " ", "(SAND)"),
            Symbol("SC") => "Siacoin",
            Symbol("SDN") => string("Shiden", " ", "(SDN)"),
            Symbol("SOL") => "Solana",
            Symbol("SNX") => string("Synthetix  Network", " ", "(SNX)"),
            Symbol("SRM") => "Serum",
            Symbol("STORJ") => string("Storj", " ", "(STORJ)"),
            Symbol("SUSHI") => string("Sushiswap", " ", "(SUSHI)"),
            Symbol("TBTC") => "tBTC",
            Symbol("TRX") => "Tron",
            Symbol("UNI") => "UNI",
            Symbol("USDC") => "USDC",
            Symbol("USDT") => string("Tether USD", " ", "(ERC20)"),
            Symbol("USDT-TRC20") => string("Tether USD", " ", "(TRC20)"),
            Symbol("WAVES") => "Waves",
            Symbol("WBTC") => string("Wrapped Bitcoin", " ", "(WBTC)"),
            Symbol("XLM") => "Stellar XLM",
            Symbol("XMR") => "Monero",
            Symbol("XRP") => "Ripple XRP",
            Symbol("XTZ") => "XTZ",
            Symbol("YFI") => "YFI",
            Symbol("ZEC") => string("Zcash", " ", "(Transparent)"),
            Symbol("ZRX") => string("0x", " ", "(ZRX)")
        ),
        Symbol("withdrawMethods") => Dict{Symbol, Any}(
            Symbol("Lightning") => "Lightning",
            Symbol("Bitcoin") => "BTC",
            Symbol("Ripple") => "XRP",
            Symbol("Litecoin") => "LTC",
            Symbol("Dogecoin") => "DOGE",
            Symbol("Stellar") => "XLM",
            Symbol("Ethereum") => "ERC20",
            Symbol("Arbitrum One") => "Arbitrum",
            Symbol("Polygon") => "MATIC",
            Symbol("Arbitrum Nova") => "Arbitrum",
            Symbol("Optimism") => "Optimism",
            Symbol("zkSync Era") => "zkSync",
            Symbol("Ethereum Classic") => "ETC",
            Symbol("Zcash") => "ZEC",
            Symbol("Monero") => "XMR",
            Symbol("Tron") => "TRC20",
            Symbol("Solana") => "SOL",
            Symbol("EOS") => "EOS",
            Symbol("Bitcoin Cash") => "BCH",
            Symbol("Cardano") => "ADA",
            Symbol("Qtum") => "QTUM",
            Symbol("Tezos") => "XTZ",
            Symbol("Cosmos") => "ATOM",
            Symbol("Nano") => "NANO",
            Symbol("Siacoin") => "SC",
            Symbol("Lisk") => "LSK",
            Symbol("Waves") => "WAVES",
            Symbol("ICON") => "ICX",
            Symbol("Algorand") => "ALGO",
            Symbol("Polygon - USDC.e") => "MATIC",
            Symbol("Arbitrum One - USDC.e") => "Arbitrum",
            Symbol("Polkadot") => "DOT",
            Symbol("Kava") => "KAVA",
            Symbol("Filecoin") => "FIL",
            Symbol("Kusama") => "KSM",
            Symbol("Flow") => "FLOW",
            Symbol("Energy Web") => "EW",
            Symbol("Mina") => "MINA",
            Symbol("Centrifuge") => "CFG",
            Symbol("Karura") => "KAR",
            Symbol("Moonriver") => "MOVR",
            Symbol("Shiden") => "SDN",
            Symbol("Khala") => "PHA",
            Symbol("Bifrost Kusama") => "BNC",
            Symbol("Songbird") => "SGB",
            Symbol("Terra classic") => "LUNC",
            Symbol("KILT") => "KILT",
            Symbol("Basilisk") => "BSX",
            Symbol("Flare") => "FLR",
            Symbol("Avalanche C-Chain") => "AVAX",
            Symbol("Kintsugi") => "KINT",
            Symbol("Altair") => "AIR",
            Symbol("Moonbeam") => "GLMR",
            Symbol("Acala") => "ACA",
            Symbol("Astar") => "ASTR",
            Symbol("Akash") => "AKT",
            Symbol("Robonomics") => "XRT",
            Symbol("Fantom") => "FTM",
            Symbol("Elrond") => "EGLD",
            Symbol("THORchain") => "RUNE",
            Symbol("Secret") => "SCRT",
            Symbol("Near") => "NEAR",
            Symbol("Internet Computer Protocol") => "ICP",
            Symbol("Picasso") => "PICA",
            Symbol("Crust Shadow") => "CSM",
            Symbol("Integritee") => "TEER",
            Symbol("Parallel Finance") => "PARA",
            Symbol("HydraDX") => "HDX",
            Symbol("Interlay") => "INTR",
            Symbol("Fetch.ai") => "FET",
            Symbol("NYM") => "NYM",
            Symbol("Terra 2.0") => "LUNA2",
            Symbol("Juno") => "JUNO",
            Symbol("Nodle") => "NODL",
            Symbol("Stacks") => "STX",
            Symbol("Ethereum PoW") => "ETHW",
            Symbol("Aptos") => "APT",
            Symbol("Sui") => "SUI",
            Symbol("Genshiro") => "GENS",
            Symbol("Aventus") => "AVT",
            Symbol("Sei") => "SEI",
            Symbol("OriginTrail") => "OTP",
            Symbol("Celestia") => "TIA"
        ),
        Symbol("marketHelperProps") => ["marketsByAltname", "delistedMarketsById"]
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("sandbox") => false,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("triggerPrice") => false,
                Symbol("triggerPriceType") => nothing,
                Symbol("triggerDirection") => false,
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
                Symbol("trailing") => true,
                Symbol("leverage") => false,
                Symbol("marketBuyByCost") => true,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("selfTradePrevention") => true,
                Symbol("iceberg") => true
            ),
            Symbol("createOrders") => Dict{Symbol, Any}(
                Symbol("min") => 2,
                Symbol("max") => 15,
                Symbol("sameSymbolOnly") => true
            ),
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => nothing,
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => nothing,
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
                Symbol("limit") => nothing,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => nothing,
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => nothing,
                Symbol("daysBack") => nothing,
                Symbol("daysBackCanceled") => nothing,
                Symbol("untilDays") => 100000,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 720
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
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("rollingWindowSize") => 10000,
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("EQuery:Invalid asset pair") => BadSymbol,
            Symbol("EAPI:Invalid key") => AuthenticationError,
            Symbol("EFunding:Unknown withdraw key") => InvalidAddress,
            Symbol("EFunding:Invalid amount") => InsufficientFunds,
            Symbol("EService:Unavailable") => ExchangeNotAvailable,
            Symbol("EDatabase:Internal error") => ExchangeNotAvailable,
            Symbol("EService:Busy") => ExchangeNotAvailable,
            Symbol("EQuery:Unknown asset") => BadSymbol,
            Symbol("EAPI:Rate limit exceeded") => DDoSProtection,
            Symbol("EOrder:Rate limit exceeded") => DDoSProtection,
            Symbol("EGeneral:Internal error") => ExchangeNotAvailable,
            Symbol("EGeneral:Temporary lockout") => DDoSProtection,
            Symbol("EGeneral:Permission denied") => PermissionDenied,
            Symbol("EGeneral:Invalid arguments:price") => InvalidOrder,
            Symbol("EOrder:Unknown order") => InvalidOrder,
            Symbol("EOrder:Invalid price:Invalid price argument") => InvalidOrder,
            Symbol("EOrder:Order minimum not met") => InvalidOrder,
            Symbol("EOrder:Insufficient funds") => InsufficientFunds,
            Symbol("EGeneral:Invalid arguments") => BadRequest,
            Symbol("ESession:Invalid session") => AuthenticationError,
            Symbol("EAPI:Invalid nonce") => InvalidNonce,
            Symbol("EFunding:No funding method") => BadRequest,
            Symbol("EFunding:Unknown asset") => BadSymbol,
            Symbol("EService:Market in post_only mode") => OnMaintenance,
            Symbol("EService:Market in cancel_only mode") => OnMaintenance,
            Symbol("EGeneral:Too many requests") => DDoSProtection,
            Symbol("ETrade:User Locked") => AccountSuspended
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol(":Invalid order") => InvalidOrder,
            Symbol(":Invalid arguments:volume") => InvalidOrder,
            Symbol(":Invalid arguments:viqc") => InvalidOrder,
            Symbol(":Invalid nonce") => InvalidNonce,
            Symbol(":IInsufficient funds") => InsufficientFunds,
            Symbol(":Cancel pending") => CancelPending,
            Symbol(":Rate limit exceeded") => RateLimitExceeded
        )
    )
))

end
function feeToPrecision(self::Kraken, symbol, fee)
    return decimalToPrecision(fee, TRUNCATE, get(get(self.market(symbol), Symbol("precision"), nothing), Symbol("amount"), nothing), self.precisionMode)

end
function fetchMarkets(self::Kraken, params=Dict())
    promises = [];
    push!(promises, self.publicGetAssetPairs(params));
    if functions.ccxtruthy(get(self.options, Symbol("adjustForTimeDifference"), nothing))
                push!(promises, self.loadTimeDifference());
    end
    responses = Base.fetch(asyncmap(Base.fetch, promises));
    assetsResponse = get(responses, 1, nothing);
    markets = self.safeDict(assetsResponse, "result", Dict{Symbol, Any}());
    cachedCurrencies = self.safeDict(self.options, "cachedCurrencies", Dict{Symbol, Any}());
    keys_var = objectKeys(markets);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
        id = get(keys_var, i + 1, nothing);
        isSynthetic = false;
        if functions.ccxtruthy(findfirst(":BTNL", id) !== nothing)
            isSynthetic = true;
        end
        market = get(markets, Symbol(id), nothing);
        baseIdRaw = safeString(market, "base");
        quoteIdRaw = safeString(market, "quote");
        baseId = self.safeCurrencyCode(baseIdRaw);
        quoteId = self.safeCurrencyCode(quoteIdRaw);
        base = baseId;
        quote_var = quoteId;
        makerFees = self.safeList(market, "fees_maker", []);
        firstMakerFee = self.safeList(makerFees, 0, []);
        firstMakerFeeRate = safeString(firstMakerFee, 1);
        maker = nothing;
        if functions.ccxtruthy(firstMakerFeeRate != nothing)
            maker = self.parseNumber(stringDiv(firstMakerFeeRate, "100"));
        end
        takerFees = self.safeList(market, "fees", []);
        firstTakerFee = self.safeList(takerFees, 0, []);
        firstTakerFeeRate = safeString(firstTakerFee, 1);
        taker = nothing;
        if functions.ccxtruthy(firstTakerFeeRate != nothing)
            taker = self.parseNumber(stringDiv(firstTakerFeeRate, "100"));
        end
        leverageBuy = self.safeList(market, "leverage_buy", []);
        leverageBuyLength = length(leverageBuy);
        precisionPrice = self.parseNumber(self.parsePrecision(safeString(market, "pair_decimals")));
        precisionAmount = self.parseNumber(self.parsePrecision(safeString(market, "lot_decimals")));
        spot = true;
        if functions.ccxtruthy(base == nothing)
            throw(ExchangeError(string(self.id, " method() missing base")));
        end
        if functions.ccxtruthy(@functions.ccxt_and(spot, (ccxt_in(base, cachedCurrencies))))
            currency = safeValue(cachedCurrencies, base);
            currencyPrecision = self.safeNumber(currency, "precision");
            if functions.ccxtruthy(currencyPrecision == nothing)
                throw(ExchangeError(string(self.id, " method() missing currencyPrecision")));
            end
            if functions.ccxtruthy(functions.ccxt_gt(currencyPrecision, precisionAmount))
                precisionAmount = currencyPrecision;
            end
        end
        status = safeString(market, "status");
        isActive = status == "online";
        symbol = functions.ccxtruthy((!functions.ccxtruthy(isSynthetic))) ? (string(base, "/", quote_var)) : id;
        push!(result, Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("wsId") => safeString(market, "wsname"),
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => nothing,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => nothing,
    Symbol("altname") => get(market, Symbol("altname"), nothing),
    Symbol("type") => "spot",
    Symbol("spot") => spot,
    Symbol("margin") => (functions.ccxt_gt(leverageBuyLength, 0)),
    Symbol("swap") => false,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => isActive,
    Symbol("contract") => false,
    Symbol("linear") => nothing,
    Symbol("inverse") => nothing,
    Symbol("taker") => taker,
    Symbol("maker") => maker,
    Symbol("contractSize") => nothing,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => precisionAmount,
        Symbol("price") => precisionPrice
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => self.parseNumber("1"),
            Symbol("max") => self.safeNumber(leverageBuy, leverageBuyLength - 1, 1)
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "ordermin"),
            Symbol("max") => nothing
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "costmin"),
            Symbol("max") => nothing
        )
    ),
    Symbol("created") => nothing,
    Symbol("info") => market
));
        i += 1
    end
    self.options[Symbol("marketsByAltname")] = indexBy(result, "altname");
    return result

end
function fetchStatus(self::Kraken, params=Dict())
    response = Base.fetch(self.publicGetSystemStatus(params));
    result = self.safeDict(response, "result");
    statusRaw = safeString(result, "status");
    return Dict{Symbol, Any}(
    Symbol("status") => functions.ccxtruthy((statusRaw == "online")) ? "ok" : "maintenance",
    Symbol("updated") => nothing,
    Symbol("eta") => nothing,
    Symbol("url") => nothing,
    Symbol("info") => response
)

end
function fetchCurrencies(self::Kraken, params=Dict())
    response = Base.fetch(self.publicGetAssets(params));
    currencies = self.safeDict(response, "result", Dict{Symbol, Any}());
    enhancedArray = self.addKeyInArrayItems(currencies, "_coin_id");
    return self.parseCurrencies(enhancedArray)

end
function parseCurrency(self::Kraken, rawCurrency)
    id = safeString(rawCurrency, "_coin_id");
    code = self.safeCurrencyCode(id);
    if functions.ccxtruthy(id == nothing)
        throw(ExchangeError(string(self.id, " parseCurrency() missing id")));
    end
    if functions.ccxtruthy(findfirst(".", id) === nothing)
        altName = safeString(rawCurrency, "altname");
        if functions.ccxtruthy(id == nothing)
            throw(ExchangeError(string(self.id, " parseCurrency() missing id")));
        end
        if functions.ccxtruthy(@functions.ccxt_and(id != altName, (@functions.ccxt_or(startswith(id, "X"), startswith(id, "Z")))))
            code = self.safeCurrencyCode(altName);
            if functions.ccxtruthy(@functions.ccxt_and((id != nothing), (code != nothing)))
                self.commonCurrencies[Symbol(id)] = code;
            end
        else
            code = self.safeCurrencyCode(id);
        end
    end
    if functions.ccxtruthy(code == nothing)
        throw(ExchangeError(string(self.id, " parseCurrency() missing code")));
    end
    isFiat = findfirst(".HOLD", code) !== nothing;
    rawCurrency = omit(rawCurrency, "_coin_id");
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("code") => code,
    Symbol("info") => rawCurrency,
    Symbol("name") => safeString(rawCurrency, "altname"),
    Symbol("active") => safeString(rawCurrency, "status") == "enabled",
    Symbol("type") => functions.ccxtruthy(isFiat) ? "fiat" : "crypto",
    Symbol("deposit") => nothing,
    Symbol("withdraw") => nothing,
    Symbol("fee") => nothing,
    Symbol("precision") => self.parseNumber(self.parsePrecision(safeString(rawCurrency, "decimals"))),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    ),
    Symbol("networks") => Dict{Symbol, Any}()
))

end
function safeCurrencyCode(self::Kraken, currencyId, currency=nothing)
    if functions.ccxtruthy(currencyId == nothing)
            return currencyId
    end
    if functions.ccxtruthy(findfirst(".", currencyId) !== nothing)
        parts = split(currencyId, ".");
        firstPart = safeString(parts, 0);
        secondPart = safeString(parts, 1);
            return string(safeCurrencyCode(self.parent, firstPart, currency), ".", secondPart)
    end
    return safeCurrencyCode(self.parent, currencyId, currency)

end
function fetchTradingFee(self::Kraken, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing),
        Symbol("fee-info") => true
    );
    response = Base.fetch(self.privatePostTradeVolume(extend(request, params)));
    result = safeValue(response, "result", Dict{Symbol, Any}());
    return self.parseTradingFee(result, market)

end
function parseTradingFee(self::Kraken, response, market)
    makerFees = safeValue(response, "fees_maker", Dict{Symbol, Any}());
    takerFees = safeValue(response, "fees", Dict{Symbol, Any}());
    symbolMakerFee = safeValue(makerFees, get(market, Symbol("id"), nothing), Dict{Symbol, Any}());
    symbolTakerFee = safeValue(takerFees, get(market, Symbol("id"), nothing), Dict{Symbol, Any}());
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("maker") => self.parseNumber(stringDiv(safeString(symbolMakerFee, "fee"), "100")),
    Symbol("taker") => self.parseNumber(stringDiv(safeString(symbolTakerFee, "fee"), "100")),
    Symbol("percentage") => true,
    Symbol("tierBased") => true
)

end
function parseOrderBookBidAsk(self::Kraken, bidask, priceKey=0, amountKey=1, countOrIdKey=2)
    price = self.safeNumber(bidask, priceKey);
    amount = self.safeNumber(bidask, amountKey);
    timestamp = safeInteger(bidask, 2);
    return [price, amount, timestamp]

end
function fetchOrderBook(self::Kraken, symbol, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("count")] = limit;
    end
    response = Base.fetch(self.publicGetDepth(extend(request, params)));
    result = safeValue(response, "result", Dict{Symbol, Any}());
    orderbook = safeValue(result, get(market, Symbol("id"), nothing));
    marketInfo = safeValue(market, "info", Dict{Symbol, Any}());
    wsName = safeValue(marketInfo, "wsname");
    if functions.ccxtruthy(wsName != nothing)
        orderbook = safeValue(result, wsName, orderbook);
    end
    return self.parseOrderBook(orderbook, symbol)

end
function parseTicker(self::Kraken, ticker, market=nothing)
    symbol = self.safeSymbol(nothing, market);
    v = safeValue(ticker, "v", []);
    baseVolume = safeString(v, 1);
    p = safeValue(ticker, "p", []);
    vwap = safeString(p, 1);
    quoteVolume = stringMul(baseVolume, vwap);
    c = safeValue(ticker, "c", []);
    last_var = safeString(c, 0);
    high = safeValue(ticker, "h", []);
    low = safeValue(ticker, "l", []);
    bid = safeValue(ticker, "b", []);
    ask = safeValue(ticker, "a", []);
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("high") => safeString(high, 1),
    Symbol("low") => safeString(low, 1),
    Symbol("bid") => safeString(bid, 0),
    Symbol("bidVolume") => safeString(bid, 2),
    Symbol("ask") => safeString(ask, 0),
    Symbol("askVolume") => safeString(ask, 2),
    Symbol("vwap") => vwap,
    Symbol("open") => safeString(ticker, "o"),
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
function fetchTickers(self::Kraken, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbols != nothing)
        symbols = self.marketSymbols(symbols);
        marketIds = [];
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(symbols)))
            symbol = get(symbols, i + 1, nothing);
            market = self.market(symbol);
            if functions.ccxtruthy(get(market, Symbol("active"), nothing))
                                push!(marketIds, get(market, Symbol("id"), nothing));
            end
            i += 1
        end

        request[Symbol("pair")] =         join(marketIds, ",");
    end
    response = Base.fetch(self.publicGetTicker(extend(request, params)));
    tickers = self.safeDict(response, "result", Dict{Symbol, Any}());
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
function fetchTicker(self::Kraken, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetTicker(extend(request, params)));
    tickerResult = self.safeDict(response, "result", Dict{Symbol, Any}());
    ticker = safeValue(tickerResult, get(market, Symbol("id"), nothing));
    return self.parseTicker(ticker, market)

end
function parseOHLCV(self::Kraken, ohlcv, market=nothing)
    return [safeTimestamp(ohlcv, 0), self.safeNumber(ohlcv, 1), self.safeNumber(ohlcv, 2), self.safeNumber(ohlcv, 3), self.safeNumber(ohlcv, 4), self.safeNumber(ohlcv, 6)]

end
function fetchOHLCV(self::Kraken, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOHLCV", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchOHLCV", symbol, since, limit, timeframe, params, 720))
    end
    market = self.market(symbol);
    parsedTimeframe = safeInteger(self.timeframes, timeframe);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(parsedTimeframe != nothing)
        request[Symbol("interval")] = parsedTimeframe;
    else
        request[Symbol("interval")] = timeframe;
    end
    if functions.ccxtruthy(since != nothing)
        scaledSince = self.parseToInt(since / 1000);
        if functions.ccxtruthy(parsedTimeframe == nothing)
            throw(ExchangeError(string(self.id, " fetchOHLCV() missing parsedTimeframe")));
        end
        timeFrameInSeconds = parsedTimeframe * 60;
        request[Symbol("since")] = numberToString(scaledSince - timeFrameInSeconds);
    end
    response = Base.fetch(self.publicGetOHLC(extend(request, params)));
    result = safeValue(response, "result", Dict{Symbol, Any}());
    ohlcvs = self.safeList(result, get(market, Symbol("id"), nothing), []);
    return self.parseOHLCVs(ohlcvs, market, timeframe, since, limit)

end
function parseLedgerEntryType(self::Kraken, type_var)
    types = Dict{Symbol, Any}(
        Symbol("trade") => "trade",
        Symbol("withdrawal") => "transaction",
        Symbol("deposit") => "transaction",
        Symbol("transfer") => "transfer",
        Symbol("margin") => "margin"
    );
    return safeString(types, type_var, type_var)

end
function parseLedgerEntry(self::Kraken, item, currency=nothing)
    id = safeString(item, "id");
    direction = nothing;
    account = nothing;
    referenceId = safeString(item, "refid");
    referenceAccount = nothing;
    type_var = self.parseLedgerEntryType(safeString(item, "type"));
    currencyId = safeString(item, "asset");
    code = self.safeCurrencyCode(currencyId, currency);
    currency = self.safeCurrency(currencyId, currency);
    amount = safeString(item, "amount");
    if functions.ccxtruthy(stringLt(amount, "0"))
        direction = "out";
        amount = stringAbs(amount);
    else
        direction = "in";
    end
    timestamp = safeIntegerProduct(item, "time", 1000);
    return self.safeLedgerEntry(Dict{Symbol, Any}(
    Symbol("info") => item,
    Symbol("id") => id,
    Symbol("direction") => direction,
    Symbol("account") => account,
    Symbol("referenceId") => referenceId,
    Symbol("referenceAccount") => referenceAccount,
    Symbol("type") => type_var,
    Symbol("currency") => code,
    Symbol("amount") => self.parseNumber(amount),
    Symbol("before") => nothing,
    Symbol("after") => self.safeNumber(item, "balance"),
    Symbol("status") => "ok",
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("cost") => self.safeNumber(item, "fee"),
        Symbol("currency") => code
    )
), currency)

end
function fetchLedger(self::Kraken, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("asset")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start")] = self.parseToInt(since / 1000);
    end
    until = safeString2(params, "until", "till");
    if functions.ccxtruthy(until != nothing)
        params = omit(params, ["until", "till"]);
        untilDivided = stringDiv(until, "1000");
        request[Symbol("end")] = self.parseToInt(stringAdd(untilDivided, "1"));
    end
    response = Base.fetch(self.privatePostLedgers(extend(request, params)));
    result = safeValue(response, "result", Dict{Symbol, Any}());
    ledger = safeValue(result, "ledger", Dict{Symbol, Any}());
    keys_var = objectKeys(ledger);
    items = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
        key = get(keys_var, i + 1, nothing);
        value = get(ledger, Symbol(key), nothing);
        value[Symbol("id")] = key;
        push!(items, value);
        i += 1
    end
    return self.parseLedger(items, currency, since, limit)

end
function fetchLedgerEntriesByIds(self::Kraken, ids, code=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    ids = join(ids, ",");
    request = extend(Dict{Symbol, Any}(
        Symbol("id") => ids
    ), params);
    response = Base.fetch(self.privatePostQueryLedgers(request));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    keys_var = objectKeys(result);
    items = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
        key = get(keys_var, i + 1, nothing);
        value = get(result, Symbol(key), nothing);
        value[Symbol("id")] = key;
        push!(items, value);
        i += 1
    end
    return self.parseLedger(items)

end
function fetchLedgerEntry(self::Kraken, id, code=nothing, params=Dict())
    items = Base.fetch(self.fetchLedgerEntriesByIds([id], code, params));
    return get(items, 1, nothing)

end
function parseTrade(self::Kraken, trade, market=nothing)
    timestamp = nothing;
    datetime = nothing;
    side = nothing;
    type_var = nothing;
    price = nothing;
    amount = nothing;
    id = nothing;
    orderId = nothing;
    fee = nothing;
    symbol = nothing;
    if functions.ccxtruthy(functions.ccxt_isArray(trade))
        timestamp = safeTimestamp(trade, 2);
        side = functions.ccxtruthy((get(trade, 4, nothing) == "s")) ? "sell" : "buy";
        type_var = functions.ccxtruthy((get(trade, 5, nothing) == "l")) ? "limit" : "market";
        price = safeString(trade, 0);
        amount = safeString(trade, 1);
        tradeLength = length(trade);
        if functions.ccxtruthy(functions.ccxt_gt(tradeLength, 6))
            id = safeString(trade, 6);
        end
    elseif functions.ccxtruthy(isa(trade, AbstractString))
        id = trade;
    else
        if functions.ccxtruthy(ccxt_in("ordertxid", trade))
            marketId = safeString(trade, "pair");
            foundMarket = self.findMarketByAltnameOrId(marketId);
            if functions.ccxtruthy(foundMarket != nothing)
                market = foundMarket;
            elseif functions.ccxtruthy(marketId != nothing)
                market = self.getDelistedMarketById(marketId);
            end
            orderId = safeString(trade, "ordertxid");
            id = safeString2(trade, "id", "postxid");
            timestamp = safeTimestamp(trade, "time");
            side = safeString(trade, "type");
            type_var = safeString(trade, "ordertype");
            price = safeString(trade, "price");
            amount = safeString(trade, "vol");
            if functions.ccxtruthy(ccxt_in("fee", trade))
                currency = nothing;
                if functions.ccxtruthy(market != nothing)
                    currency = get(market, Symbol("quote"), nothing);
                end
                fee = Dict{Symbol, Any}(
                    Symbol("cost") => safeString(trade, "fee"),
                    Symbol("currency") => currency
                );
            end
        else
            symbol = safeString(trade, "symbol");
            datetime = safeString(trade, "timestamp");
            id = safeString(trade, "trade_id");
            side = safeString(trade, "side");
            type_var = safeString(trade, "ord_type");
            price = safeString(trade, "price");
            amount = safeString(trade, "qty");
        end

    end
    if functions.ccxtruthy(market != nothing)
        symbol = get(market, Symbol("symbol"), nothing);
    end
    cost = safeString(trade, "cost");
    maker = self.safeBool(trade, "maker");
    takerOrMaker = nothing;
    if functions.ccxtruthy(maker != nothing)
        takerOrMaker = functions.ccxtruthy(maker) ? "maker" : "taker";
    end
    if functions.ccxtruthy(datetime == nothing)
        datetime = self.iso8601(timestamp);
    else
        timestamp = self.parse8601(datetime);
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("order") => orderId,
    Symbol("info") => trade,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => datetime,
    Symbol("symbol") => symbol,
    Symbol("type") => type_var,
    Symbol("side") => side,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("price") => price,
    Symbol("amount") => amount,
    Symbol("cost") => cost,
    Symbol("fee") => fee
), market)

end
function fetchTrades(self::Kraken, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    id = get(market, Symbol("id"), nothing);
    request = Dict{Symbol, Any}(
        Symbol("pair") => id
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("since")] = numberToString(self.parseToInt(since / 1000));
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("count")] = limit;
    end
    response = Base.fetch(self.publicGetTrades(extend(request, params)));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    trades = safeValue(result, id);
    len = length(trades);
    if functions.ccxtruthy(functions.ccxt_le(len, 0))
            return []
    end
    lastTrade = get(trades, len - 1 + 1, nothing);
    lastTradeId = safeString(result, "last");
    push!(lastTrade, lastTradeId);
    trades[len - 1 + 1] = lastTrade;
    return self.parseTrades(trades, market, since, limit)

end
function parseBalance(self::Kraken, response)
    balances = safeValue(response, "result", Dict{Symbol, Any}());
    result = Dict{Symbol, Any}(
        Symbol("info") => response,
        Symbol("timestamp") => nothing,
        Symbol("datetime") => nothing
    );
    currencyIds = objectKeys(balances);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(currencyIds)))
        currencyId = get(currencyIds, i + 1, nothing);
        code = self.safeCurrencyCode(currencyId);
        balance = safeValue(balances, currencyId, Dict{Symbol, Any}());
        account = self.account();
        account[Symbol("used")] = safeString(balance, "hold_trade");
        account[Symbol("total")] = safeString(balance, "balance");
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
function fetchBalance(self::Kraken, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privatePostBalanceEx(params));
    return self.parseBalance(response)

end
function createMarketOrderWithCost(self::Kraken, symbol, side, cost, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    req = Dict{Symbol, Any}(
        Symbol("cost") => cost
    );
    return Base.fetch(self.createOrder(symbol, "market", side, cost, nothing, extend(req, params)))

end
function createMarketBuyOrderWithCost(self::Kraken, symbol, cost, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    return Base.fetch(self.createMarketOrderWithCost(symbol, "buy", cost, params))

end
function createOrder(self::Kraken, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing),
        Symbol("type") => side,
        Symbol("ordertype") => type_var,
        Symbol("volume") => self.amountToPrecision(symbol, amount)
    );
    orderRequest = self.orderRequest("createOrder", symbol, type_var, request, amount, price, params);
    flags = safeString(get(orderRequest, 1, nothing), "oflags", "");
    isUsingCost = findfirst("viqc", flags) !== nothing;
    response = Base.fetch(self.privatePostAddOrder(extend(get(orderRequest, 1, nothing), get(orderRequest, 2, nothing))));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    result[Symbol("usingCost")] = isUsingCost;
    return self.parseOrder(result)

end
function createOrders(self::Kraken, orders, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    ordersRequests = [];
    orderSymbols = [];
    symbol = nothing;
    market = nothing;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        rawOrder = get(orders, i + 1, nothing);
        marketId = safeString(rawOrder, "symbol");
        if functions.ccxtruthy(symbol == nothing)
            symbol = marketId;
        else
            if functions.ccxtruthy(symbol != marketId)
                throw(BadRequest(string(self.id, " createOrders() requires all orders to have the same symbol")));
            end
        end
        market = self.market(marketId);
        push!(orderSymbols, marketId);
        type_var = safeString(rawOrder, "type");
        side = safeString(rawOrder, "side");
        amount = safeValue(rawOrder, "amount");
        price = safeValue(rawOrder, "price");
        orderParams = self.safeDict(rawOrder, "params", Dict{Symbol, Any}());
        parsedAmount = self.amountToPrecision(get(market, Symbol("symbol"), nothing), amount);
        req = Dict{Symbol, Any}(
            Symbol("type") => side,
            Symbol("ordertype") => type_var,
            Symbol("volume") => parsedAmount
        );
        orderRequest = self.orderRequest("createOrders", marketId, type_var, req, amount, price, orderParams);
        push!(ordersRequests, get(orderRequest, 1, nothing));
        i += 1
    end
    orderSymbols = self.marketSymbols(orderSymbols, nothing, false, true, true);
    response = nothing;
    request = Dict{Symbol, Any}(
        Symbol("orders") => ordersRequests,
        Symbol("pair") => safeString(market, "id")
    );
    request = extend(request, params);
    response = Base.fetch(self.privatePostAddOrderBatch(request));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    return self.parseOrders(self.safeList(result, "orders"))

end
function findMarketByAltnameOrId(self::Kraken, id)
    marketsByAltname = safeValue(self.options, "marketsByAltname", Dict{Symbol, Any}());
    if functions.ccxtruthy(ccxt_in(id, marketsByAltname))
            return get(marketsByAltname, Symbol(id), nothing)
    else
        return self.safeMarket(id)
    end

end
function getDelistedMarketById(self::Kraken, id)
    if functions.ccxtruthy(id == nothing)
            return id
    end
    market = safeValue(get(self.options, Symbol("delistedMarketsById"), nothing), id);
    if functions.ccxtruthy(market != nothing)
            return market
    end
    baseIdStart = 0;
    baseIdEnd = 3;
    quoteIdStart = 3;
    quoteIdEnd = 6;
    if functions.ccxtruthy(length(id) == 8)
        baseIdEnd = 4;
        quoteIdStart = 4;
        quoteIdEnd = 8;
    elseif functions.ccxtruthy(length(id) == 7)
        baseIdEnd = 4;
        quoteIdStart = 4;
        quoteIdEnd = 7;
    end
    baseId = functions.ccxt_slice(id, baseIdStart, baseIdEnd);
    quoteId = functions.ccxt_slice(id, quoteIdStart, quoteIdEnd);
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    symbol = string(base, "/", quote_var);
    market = Dict{Symbol, Any}(
        Symbol("symbol") => symbol,
        Symbol("base") => base,
        Symbol("quote") => quote_var,
        Symbol("baseId") => baseId,
        Symbol("quoteId") => quoteId
    );
    self.options[Symbol("delistedMarketsById")][Symbol(id)] = market;
    return market

end
function parseOrderStatus(self::Kraken, status)
    statuses = Dict{Symbol, Any}(
        Symbol("pending") => "open",
        Symbol("open") => "open",
        Symbol("pending_new") => "open",
        Symbol("new") => "open",
        Symbol("partially_filled") => "open",
        Symbol("filled") => "closed",
        Symbol("closed") => "closed",
        Symbol("canceled") => "canceled",
        Symbol("expired") => "expired"
    );
    return safeString(statuses, status, status)

end
function parseOrderType(self::Kraken, status)
    statuses = Dict{Symbol, Any}(
        Symbol("take-profit") => "market",
        Symbol("stop-loss") => "market",
        Symbol("stop-loss-limit") => "limit",
        Symbol("take-profit-limit") => "limit",
        Symbol("trailing-stop-limit") => "limit"
    );
    return safeString(statuses, status, status)

end
function parseOrder(self::Kraken, order, market=nothing)
    isUsingCost = self.safeBool(order, "usingCost", false);
    order = omit(order, "usingCost");
    description = self.safeDict(order, "descr", Dict{Symbol, Any}());
    orderDescriptionObj = self.safeDict(order, "descr");
    orderDescription = nothing;
    if functions.ccxtruthy(orderDescriptionObj != nothing)
        orderDescription = safeString(orderDescriptionObj, "order");
    else
        orderDescription = safeString(order, "descr");
    end
    side = nothing;
    rawType = nothing;
    marketId = nothing;
    price = nothing;
    amount = nothing;
    cost = nothing;
    triggerPrice = nothing;
    if functions.ccxtruthy(orderDescription != nothing)
        parts = split(orderDescription, " ");
        side = safeString(parts, 0);
        if functions.ccxtruthy(!functions.ccxtruthy(isUsingCost))
            amount = safeString(parts, 1);
        else
            cost = safeString(parts, 1);
        end
        marketId = safeString(parts, 2);
        part4 = safeString(parts, 4);
        part5 = safeString(parts, 5);
        if functions.ccxtruthy(@functions.ccxt_or(part4 == "limit", part4 == "market"))
            rawType = part4;
        else
            rawType = string(part4, " ", part5);
        end
        if functions.ccxtruthy(@functions.ccxt_or(rawType == "stop loss", rawType == "take profit"))
            triggerPrice = safeString(parts, 6);
            price = safeString(parts, 9);
        elseif functions.ccxtruthy(rawType == "limit")
            price = safeString(parts, 5);
        end
    end
    side = safeString(description, "type", side);
    rawType = safeString(description, "ordertype", rawType);
    marketId = safeString(description, "pair", marketId);
    foundMarket = self.findMarketByAltnameOrId(marketId);
    symbol = nothing;
    if functions.ccxtruthy(foundMarket != nothing)
        market = foundMarket;
    elseif functions.ccxtruthy(marketId != nothing)
        market = self.getDelistedMarketById(marketId);
    end
    timestamp = safeTimestamp(order, "opentm");
    amount = safeString(order, "vol", amount);
    filled = safeString(order, "vol_exec");
    fee = nothing;
    price = safeString(description, "price", price);
    if functions.ccxtruthy(@functions.ccxt_and((price != nothing), (@functions.ccxt_or(@functions.ccxt_or(endswith(price, "%"), stringEquals(price, "0.00000")), stringEquals(price, "0")))))
        price = nothing;
    end
    if functions.ccxtruthy(price == nothing)
        price = safeString(description, "price2");
        price = safeString2(order, "limitprice", "price", price);
    end
    flags = safeString(order, "oflags", "");
    isPostOnly = findfirst("post", flags) !== nothing;
    average = self.safeNumber(order, "price");
    if functions.ccxtruthy(market != nothing)
        symbol = get(market, Symbol("symbol"), nothing);
        if functions.ccxtruthy(ccxt_in("fee", order))
            feeCost = safeString(order, "fee");
            fee = Dict{Symbol, Any}(
                Symbol("cost") => feeCost,
                Symbol("rate") => nothing
            );
            if functions.ccxtruthy(findfirst("fciq", flags) !== nothing)
                fee[Symbol("currency")] = get(market, Symbol("quote"), nothing);
            elseif functions.ccxtruthy(findfirst("fcib", flags) !== nothing)
                fee[Symbol("currency")] = get(market, Symbol("base"), nothing);
            end
        end
    end
    status = self.parseOrderStatus(safeString(order, "status"));
    id = safeStringN(order, ["id", "txid", "order_id", "amend_id"]);
    if functions.ccxtruthy(@functions.ccxt_or((id == nothing), (startswith(id, "["))))
        txid = self.safeList(order, "txid");
        id = safeString(txid, 0);
    end
    userref = safeString(order, "userref");
    clientOrderId = safeString(order, "cl_ord_id", userref);
    rawTrades = safeValue(order, "trades", []);
    trades = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(rawTrades)))
        rawTrade = get(rawTrades, i + 1, nothing);
        if functions.ccxtruthy(isa(rawTrade, AbstractString))
                        push!(trades, self.safeTrade(Dict{Symbol, Any}(
    Symbol("id") => rawTrade,
    Symbol("orderId") => id,
    Symbol("symbol") => symbol,
    Symbol("info") => Dict{Symbol, Any}()
)));
        else
            push!(trades, rawTrade);
        end
        i += 1
    end
    stopLossPrice = nothing;
    takeProfitPrice = nothing;
    if functions.ccxtruthy(rawType != nothing)
        if functions.ccxtruthy(startswith(rawType, "take-profit"))
            takeProfitPrice = safeString(description, "price");
            price = omitZero(safeString(description, "price2"));
        elseif functions.ccxtruthy(startswith(rawType, "stop-loss"))
            stopLossPrice = safeString(description, "price");
            price = omitZero(safeString(description, "price2"));
        else
            if functions.ccxtruthy(rawType == "take profit")
                takeProfitPrice = triggerPrice;
            elseif functions.ccxtruthy(rawType == "stop loss")
                stopLossPrice = triggerPrice;
            end

        end
    end
    typeParsed = self.parseOrderType(rawType);
    if functions.ccxtruthy(inArray(typeParsed, ["stop loss", "take profit"]))
        typeParsed = functions.ccxtruthy((price == nothing)) ? "market" : "limit";
    end
    amendId = safeString(order, "amend_id");
    if functions.ccxtruthy(amendId != nothing)
        isPostOnly = nothing;
    end
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("clientOrderId") => clientOrderId,
    Symbol("info") => order,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("lastUpdateTimestamp") => safeTimestamp(order, "closetm"),
    Symbol("status") => status,
    Symbol("symbol") => symbol,
    Symbol("type") => typeParsed,
    Symbol("timeInForce") => nothing,
    Symbol("postOnly") => isPostOnly,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("triggerPrice") => triggerPrice,
    Symbol("takeProfitPrice") => takeProfitPrice,
    Symbol("stopLossPrice") => stopLossPrice,
    Symbol("cost") => cost,
    Symbol("amount") => amount,
    Symbol("filled") => filled,
    Symbol("average") => average,
    Symbol("remaining") => nothing,
    Symbol("reduceOnly") => self.safeBool2(order, "reduceOnly", "reduce_only"),
    Symbol("fee") => fee,
    Symbol("trades") => trades
), market)

end
function orderRequest(self::Kraken, method, symbol, type_var, request, amount, price=nothing, params=Dict())
    clientOrderId = safeString(params, "clientOrderId");
    params = omit(params, ["clientOrderId"]);
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("cl_ord_id")] = clientOrderId;
    end
    stopLossTriggerPrice = safeString(params, "stopLossPrice");
    takeProfitTriggerPrice = safeString(params, "takeProfitPrice");
    isStopLossTriggerOrder = stopLossTriggerPrice != nothing;
    isTakeProfitTriggerOrder = takeProfitTriggerPrice != nothing;
    isStopLossOrTakeProfitTrigger = @functions.ccxt_or(isStopLossTriggerOrder, isTakeProfitTriggerOrder);
    trailingAmount = safeString(params, "trailingAmount");
    trailingPercent = safeString(params, "trailingPercent");
    trailingLimitAmount = safeString(params, "trailingLimitAmount");
    trailingLimitPercent = safeString(params, "trailingLimitPercent");
    isTrailingAmountOrder = trailingAmount != nothing;
    isTrailingPercentOrder = trailingPercent != nothing;
    isLimitOrder = @functions.ccxt_and((type_var != nothing), endswith(type_var, "limit"));
    isMarketOrder = type_var == "market";
    cost = safeString(params, "cost");
    flags = safeString(params, "oflags");
    params = omit(params, ["cost", "oflags"]);
    isViqcOrder = @functions.ccxt_and((flags != nothing), (findfirst("viqc", flags) !== nothing));
    if functions.ccxtruthy(@functions.ccxt_and(isMarketOrder, (@functions.ccxt_or(cost != nothing, isViqcOrder))))
        if functions.ccxtruthy(@functions.ccxt_and(cost == nothing, (amount != nothing)))
            request[Symbol("volume")] = self.costToPrecision(symbol, numberToString(amount));
        else
            request[Symbol("volume")] = self.costToPrecision(symbol, cost);
        end
        extendedOflags = functions.ccxtruthy((flags != nothing)) ? string(flags, ",viqc") : "viqc";
        request[Symbol("oflags")] = extendedOflags;
    elseif functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(isLimitOrder, !functions.ccxtruthy(isTrailingAmountOrder)), !functions.ccxtruthy(isTrailingPercentOrder)))
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    reduceOnly = self.safeBool2(params, "reduceOnly", "reduce_only");
    if functions.ccxtruthy(isStopLossOrTakeProfitTrigger)
        if functions.ccxtruthy(isStopLossTriggerOrder)
            request[Symbol("price")] = self.priceToPrecision(symbol, stopLossTriggerPrice);
            if functions.ccxtruthy(isLimitOrder)
                request[Symbol("ordertype")] = "stop-loss-limit";
            else
                request[Symbol("ordertype")] = "stop-loss";
            end
        elseif functions.ccxtruthy(isTakeProfitTriggerOrder)
            request[Symbol("price")] = self.priceToPrecision(symbol, takeProfitTriggerPrice);
            if functions.ccxtruthy(isLimitOrder)
                request[Symbol("ordertype")] = "take-profit-limit";
            else
                request[Symbol("ordertype")] = "take-profit";
            end
        end
        if functions.ccxtruthy(isLimitOrder)
            request[Symbol("price2")] = self.priceToPrecision(symbol, price);
        end
    elseif functions.ccxtruthy(@functions.ccxt_or(isTrailingAmountOrder, isTrailingPercentOrder))
        trailingPercentString = nothing;
        if functions.ccxtruthy(trailingPercent != nothing)
            trailingPercentString = functions.ccxtruthy((endswith(trailingPercent, "%"))) ? (string("+", trailingPercent)) : (string("+", trailingPercent, "%"));
        end
        trailingAmountString = functions.ccxtruthy((trailingAmount != nothing)) ? string("+", trailingAmount) : nothing;
        offset = safeString(params, "offset", "-");
        trailingLimitAmountString = functions.ccxtruthy((trailingLimitAmount != nothing)) ? string(offset, numberToString(trailingLimitAmount)) : nothing;
        trailingActivationPriceType = safeString(params, "trigger", "last");
        request[Symbol("trigger")] = trailingActivationPriceType;
        if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(isLimitOrder, (trailingLimitAmount != nothing)), (trailingLimitPercent != nothing)))
            request[Symbol("ordertype")] = "trailing-stop-limit";
            if functions.ccxtruthy(trailingLimitPercent != nothing)
                trailingLimitPercentString = functions.ccxtruthy((endswith(trailingLimitPercent, "%"))) ? (string(offset, trailingLimitPercent)) : (string(offset, trailingLimitPercent, "%"));
                request[Symbol("price")] = trailingPercentString;
                request[Symbol("price2")] = trailingLimitPercentString;
            elseif functions.ccxtruthy(trailingLimitAmount != nothing)
                request[Symbol("price")] = trailingAmountString;
                request[Symbol("price2")] = trailingLimitAmountString;
            end
        else
            request[Symbol("ordertype")] = "trailing-stop";
            if functions.ccxtruthy(trailingPercent != nothing)
                request[Symbol("price")] = trailingPercentString;
            else
                request[Symbol("price")] = trailingAmountString;
            end
        end
    end
    if functions.ccxtruthy(reduceOnly)
        if functions.ccxtruthy(method == "createOrderWs")
            request[Symbol("reduce_only")] = true;
        else
            request[Symbol("reduce_only")] = "true";
        end
    end
    close = self.safeDict(params, "close");
    if functions.ccxtruthy(close != nothing)
        close = extend(Dict{Symbol, Any}(), close);
        close = functions.ccxtruthy((close == nothing)) ? Dict{Symbol, Any}() : close;
        closePrice = safeValue(close, "price");
        if functions.ccxtruthy(closePrice != nothing)
            close[Symbol("price")] = self.priceToPrecision(symbol, closePrice);
        end
        closePrice2 = safeValue(close, "price2");
        if functions.ccxtruthy(closePrice2 != nothing)
            close[Symbol("price2")] = self.priceToPrecision(symbol, closePrice2);
        end
        request[Symbol("close")] = close;
    end
    timeInForce = safeString2(params, "timeInForce", "timeinforce");
    if functions.ccxtruthy(timeInForce != nothing)
        request[Symbol("timeinforce")] = timeInForce;
    end
    isMarket = (type_var == "market");
    postOnly = nothing;
    (postOnly, params) = self.handlePostOnly(isMarket, false, params);
    if functions.ccxtruthy(postOnly)
        extendedPostFlags = functions.ccxtruthy((flags != nothing)) ? string(flags, ",post") : "post";
        request[Symbol("oflags")] = extendedPostFlags;
    end
    if functions.ccxtruthy(@functions.ccxt_and((flags != nothing), !functions.ccxtruthy((ccxt_in("oflags", request)))))
        request[Symbol("oflags")] = flags;
    end
    params = omit(params, ["timeInForce", "reduceOnly", "stopLossPrice", "takeProfitPrice", "trailingAmount", "trailingPercent", "trailingLimitAmount", "trailingLimitPercent", "offset"]);
    return [request, params]

end
function editOrder(self::Kraken, id, symbol, type_var, side, amount=nothing, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("spot"), nothing)))
        throw(NotSupported(string(self.id, " editOrder() does not support ", get(market, Symbol("type"), nothing), " orders, only spot orders are accepted")));
    end
    request = Dict{Symbol, Any}(
        Symbol("txid") => id
    );
    clientOrderId = safeString2(params, "clientOrderId", "cl_ord_id");
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("cl_ord_id")] = clientOrderId;
        params = omit(params, ["clientOrderId", "cl_ord_id"]);
        request = omit(request, "txid");
    end
    isMarket = (type_var == "market");
    postOnly = nothing;
    (postOnly, params) = self.handlePostOnly(isMarket, false, params);
    if functions.ccxtruthy(postOnly)
        request[Symbol("post_only")] = "true";
    end
    if functions.ccxtruthy(amount != nothing)
        request[Symbol("order_qty")] = self.amountToPrecision(symbol, amount);
    end
    if functions.ccxtruthy(price != nothing)
        request[Symbol("limit_price")] = self.priceToPrecision(symbol, price);
    end
    allTriggerPrices = safeStringN(params, ["stopLossPrice", "takeProfitPrice", "trailingAmount", "trailingPercent", "trailingLimitAmount", "trailingLimitPercent"]);
    if functions.ccxtruthy(allTriggerPrices != nothing)
        offset = safeString(params, "offset");
        params = omit(params, ["stopLossPrice", "takeProfitPrice", "trailingAmount", "trailingPercent", "trailingLimitAmount", "trailingLimitPercent", "offset"]);
        if functions.ccxtruthy(offset != nothing)
            allTriggerPrices = string(offset, allTriggerPrices);
            request[Symbol("trigger_price")] = allTriggerPrices;
        else
            request[Symbol("trigger_price")] = self.priceToPrecision(symbol, allTriggerPrices);
        end
    end
    response = Base.fetch(self.privatePostAmendOrder(extend(request, params)));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    return self.parseOrder(result, market)

end
function fetchOrder(self::Kraken, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    clientOrderId = safeValue2(params, "userref", "clientOrderId");
    request = Dict{Symbol, Any}(
        Symbol("trades") => true,
        Symbol("txid") => id
    );
    query = params;
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("userref")] = clientOrderId;
        query = omit(params, ["userref", "clientOrderId"]);
    end
    response = Base.fetch(self.privatePostQueryOrders(extend(request, query)));
    result = safeValue(response, "result", []);
    if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in(id, result))))
        throw(OrderNotFound(string(self.id, " fetchOrder() could not find order id ", id)));
    end
    return self.parseOrder(extend(Dict{Symbol, Any}(
    Symbol("id") => id
), get(result, Symbol(id), nothing)))

end
function fetchOrderTrades(self::Kraken, id, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    orderTrades = safeValue(params, "trades");
    tradeIds = [];
    if functions.ccxtruthy(orderTrades == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOrderTrades() requires a unified order structure in the params argument or a 'trades' param (an array of trade id strings)")));
    else
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(orderTrades)))
            orderTrade = get(orderTrades, i + 1, nothing);
            if functions.ccxtruthy(isa(orderTrade, AbstractString))
                                push!(tradeIds, orderTrade);
            else
                push!(tradeIds, get(orderTrade, Symbol("id"), nothing));
            end
            i += 1
        end
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(symbol != nothing)
        symbol = self.symbol(symbol);
    end
    options = safeValue(self.options, "fetchOrderTrades", Dict{Symbol, Any}());
    batchSize = safeInteger(options, "batchSize", 20);
    numTradeIds = length(tradeIds);
    numBatches = self.parseToInt(numTradeIds / batchSize);
    numBatches = self.sum(numBatches, 1);
    result = [];
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, numBatches))
        requestIds = [];
        k = 0
        while functions.ccxtruthy(functions.ccxt_lt(k, batchSize))
            index = self.sum(j * batchSize, k);
            if functions.ccxtruthy(functions.ccxt_lt(index, numTradeIds))
                                push!(requestIds, get(tradeIds, index + 1, nothing));
            end
            k += 1
        end
        request = Dict{Symbol, Any}(
            Symbol("txid") => join(requestIds, ",")
        );
        response = Base.fetch(self.privatePostQueryTrades(request));
        rawTrades = safeValue(response, "result");
        ids = objectKeys(rawTrades);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(ids)))
            rawTrades[Symbol(ids[i + 1])][Symbol("id")] = get(ids, i + 1, nothing);
            i += 1
        end
        trades = self.parseTrades(rawTrades, nothing, since, limit);
        tradesFilteredBySymbol = self.filterBySymbol(trades, symbol);
        result = arrayConcat(result, tradesFilteredBySymbol);
        j += 1
    end
    return result

end
function fetchOrdersByIds(self::Kraken, ids, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privatePostQueryOrders(extend(Dict{Symbol, Any}(
        Symbol("trades") => true,
        Symbol("txid") => join(ids, ",")
    ), params)));
    result = safeValue(response, "result", Dict{Symbol, Any}());
    orders = [];
    orderIds = objectKeys(result);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orderIds)))
        id = get(orderIds, i + 1, nothing);
        item = get(result, Symbol(id), nothing);
        order = self.parseOrder(extend(Dict{Symbol, Any}(
            Symbol("id") => id
        ), item));
        push!(orders, order);
        i += 1
    end
    return orders

end
function fetchMyTrades(self::Kraken, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start")] = self.parseToInt(since / 1000);
    end
    until = safeString2(params, "until", "till");
    if functions.ccxtruthy(until != nothing)
        params = omit(params, ["until", "till"]);
        untilDivided = stringDiv(until, "1000");
        request[Symbol("end")] = self.parseToInt(stringAdd(untilDivided, "1"));
    end
    response = Base.fetch(self.privatePostTradesHistory(extend(request, params)));
    tradesResult = self.safeDict(response, "result", Dict{Symbol, Any}());
    trades = self.safeDict(tradesResult, "trades", Dict{Symbol, Any}());
    ids = objectKeys(trades);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(ids)))
        trades[Symbol(ids[i + 1])][Symbol("id")] = get(ids, i + 1, nothing);
        i += 1
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    tradesList = toArray(trades);
    return self.parseTrades(tradesList, market, since, limit)

end
function cancelOrder(self::Kraken, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = nothing;
    requestId = safeValue(params, "userref", id);
    params = omit(params, "userref");
    request = Dict{Symbol, Any}(
        Symbol("txid") => requestId
    );
    clientOrderId = safeString2(params, "clientOrderId", "cl_ord_id");
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("cl_ord_id")] = clientOrderId;
        params = omit(params, ["clientOrderId", "cl_ord_id"]);
        request = omit(request, "txid");
    end
    try
        response = Base.fetch(self.privatePostCancelOrder(extend(request, params)));
    catch e
        if functions.ccxtruthy(self.last_http_response)
            if functions.ccxtruthy(findfirst("EOrder:Unknown order", self.last_http_response) !== nothing)
                throw(OrderNotFound(string(self.id, " cancelOrder() error ", self.last_http_response)));
            end
        end
        throw(e);

    end
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response
))

end
function cancelOrders(self::Kraken, ids, symbol=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("orders") => ids
    );
    response = Base.fetch(self.privatePostCancelOrderBatch(extend(request, params)));
    return [self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response
))]

end
function cancelAllOrders(self::Kraken, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privatePostCancelAll(params));
    return [self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response
))]

end
function cancelAllOrdersAfter(self::Kraken, timeout, params=Dict())
    if functions.ccxtruthy(timeout == nothing)
        throw(ExchangeError(string(self.id, " cancelAllOrdersAfter() missing timeout")));
    end
    if functions.ccxtruthy(functions.ccxt_gt(timeout, 86400000))
        throw(BadRequest(string(self.id, " cancelAllOrdersAfter timeout should be less than 86400000 milliseconds")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(timeout == nothing)
        throw(ExchangeError(string(self.id, " cancelAllOrdersAfter() missing timeout")));
    end
    request = Dict{Symbol, Any}(
        Symbol("timeout") => functions.ccxtruthy((functions.ccxt_gt(timeout, 0))) ? (self.parseToInt(timeout / 1000)) : 0
    );
    response = Base.fetch(self.privatePostCancelAllOrdersAfter(extend(request, params)));
    return response

end
function fetchOpenOrders(self::Kraken, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start")] = self.parseToInt(since / 1000);
    end
    userref = safeInteger(params, "userref");
    if functions.ccxtruthy(userref != nothing)
        request[Symbol("userref")] = userref;
        params = omit(params, "userref");
    end
    clientOrderId = safeString(params, "clientOrderId");
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("cl_ord_id")] = clientOrderId;
        params = omit(params, "clientOrderId");
    end
    response = Base.fetch(self.privatePostOpenOrders(extend(request, params)));
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    open = self.safeDict(result, "open", Dict{Symbol, Any}());
    orders = [];
    orderIds = objectKeys(open);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orderIds)))
        id = get(orderIds, i + 1, nothing);
        item = get(open, Symbol(id), nothing);
        push!(orders, extend(Dict{Symbol, Any}(
    Symbol("id") => id
), item));
        i += 1
    end
    return self.parseOrders(orders, market, since, limit)

end
function fetchClosedOrders(self::Kraken, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start")] = self.parseToInt(since / 1000);
    end
    userref = safeInteger(params, "userref");
    if functions.ccxtruthy(userref != nothing)
        request[Symbol("userref")] = userref;
        params = omit(params, "userref");
    end
    clientOrderId = safeString(params, "clientOrderId");
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("cl_ord_id")] = clientOrderId;
        params = omit(params, "clientOrderId");
    end
    (request, params) = self.handleUntilOption("end", request, params);
    response = Base.fetch(self.privatePostClosedOrders(extend(request, params)));
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    closed = self.safeDict(result, "closed", Dict{Symbol, Any}());
    orders = [];
    orderIds = objectKeys(closed);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orderIds)))
        id = get(orderIds, i + 1, nothing);
        item = get(closed, Symbol(id), nothing);
        push!(orders, extend(Dict{Symbol, Any}(
    Symbol("id") => id
), item));
        i += 1
    end
    return self.parseOrders(orders, market, since, limit)

end
function parseTransactionStatus(self::Kraken, status)
    statuses = Dict{Symbol, Any}(
        Symbol("Initial") => "pending",
        Symbol("Pending") => "pending",
        Symbol("Success") => "ok",
        Symbol("Settled") => "pending",
        Symbol("Failure") => "failed",
        Symbol("Partial") => "ok"
    );
    return safeString(statuses, status, status)

end
function parseNetwork(self::Kraken, network)
    withdrawMethods = safeValue(self.options, "withdrawMethods", Dict{Symbol, Any}());
    return safeString(withdrawMethods, network, network)

end
function parseTransaction(self::Kraken, transaction, currency=nothing)
    id = safeString(transaction, "refid");
    txid = safeString(transaction, "txid");
    timestamp = safeTimestamp(transaction, "time");
    currencyId = safeString(transaction, "asset");
    code = self.safeCurrencyCode(currencyId, currency);
    address = safeString(transaction, "info");
    amount = self.safeNumber(transaction, "amount");
    status = self.parseTransactionStatus(safeString(transaction, "status"));
    statusProp = safeString(transaction, "status-prop");
    isOnHoldDeposit = statusProp == "on-hold";
    isCancellationRequest = statusProp == "cancel-pending";
    isOnHoldWithdrawal = statusProp == "onhold";
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(isOnHoldDeposit, isCancellationRequest), isOnHoldWithdrawal))
        status = "pending";
    end
    type_var = safeString(transaction, "type");
    feeCost = self.safeNumber(transaction, "fee");
    if functions.ccxtruthy(feeCost == nothing)
        if functions.ccxtruthy(type_var == "deposit")
            feeCost = 0;
        end
    end
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => id,
    Symbol("currency") => code,
    Symbol("amount") => amount,
    Symbol("network") => self.parseNetwork(safeString(transaction, "network")),
    Symbol("address") => address,
    Symbol("addressTo") => nothing,
    Symbol("addressFrom") => nothing,
    Symbol("tag") => nothing,
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
        Symbol("cost") => feeCost
    )
)

end
function parseTransactionsByType(self::Kraken, type_var, transactions, code=nothing, since=nothing, limit=nothing)
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(transactions)))
        transaction = self.parseTransaction(extend(Dict{Symbol, Any}(
            Symbol("type") => type_var
        ), get(transactions, i + 1, nothing)));
        push!(result, transaction);
        i += 1
    end
    return self.filterByCurrencySinceLimit(result, code, since, limit)

end
function fetchDeposits(self::Kraken, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("asset")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        sinceString = numberToString(since);
        request[Symbol("start")] = stringDiv(sinceString, "1000");
    end
    until = safeString2(params, "until", "till");
    if functions.ccxtruthy(until != nothing)
        params = omit(params, ["until", "till"]);
        untilDivided = stringDiv(until, "1000");
        request[Symbol("end")] = stringAdd(untilDivided, "1");
    end
    response = Base.fetch(self.privatePostDepositStatus(extend(request, params)));
    depositResult = self.safeList(response, "result", []);
    return self.parseTransactionsByType("deposit", depositResult, code, since, limit)

end
function fetchTime(self::Kraken, params=Dict())
    response = Base.fetch(self.publicGetTime(params));
    result = safeValue(response, "result", Dict{Symbol, Any}());
    return safeTimestamp(result, "unixtime")

end
function fetchWithdrawals(self::Kraken, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchWithdrawals", "paginate");
    if functions.ccxtruthy(paginate)
        params[Symbol("cursor")] = true;
            return Base.fetch(self.fetchPaginatedCallCursor("fetchWithdrawals", code, since, limit, params, "next_cursor", "cursor"))
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("asset")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        sinceString = numberToString(since);
        request[Symbol("start")] = stringDiv(sinceString, "1000");
    end
    until = safeString2(params, "until", "till");
    if functions.ccxtruthy(until != nothing)
        params = omit(params, ["until", "till"]);
        untilDivided = stringDiv(until, "1000");
        request[Symbol("end")] = stringAdd(untilDivided, "1");
    end
    response = Base.fetch(self.privatePostWithdrawStatus(extend(request, params)));
    rawWithdrawals = nothing;
    result = safeValue(response, "result");
    if functions.ccxtruthy(!functions.ccxtruthy(functions.ccxt_isArray(result)))
        rawWithdrawals = self.addPaginationCursorToResult(result);
    else
        rawWithdrawals = result;
    end
    return self.parseTransactionsByType("withdrawal", rawWithdrawals, code, since, limit)

end
function addPaginationCursorToResult(self::Kraken, result)
    cursor = safeString(result, "next_cursor");
    data = safeValue(result, "withdrawals");
    dataLength = length(data);
    if functions.ccxtruthy(@functions.ccxt_and(cursor != nothing, functions.ccxt_gt(dataLength, 0)))
        last_var = get(data, dataLength - 1 + 1, nothing);
        last_var[Symbol("next_cursor")] = cursor;
        data[dataLength - 1 + 1] = last_var;
    end
    return data

end
function createDepositAddress(self::Kraken, code, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("new") => "true"
    );
    return Base.fetch(self.fetchDepositAddress(code, extend(request, params)))

end
function fetchDepositMethods(self::Kraken, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("asset") => get(currency, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privatePostDepositMethods(extend(request, params)));
    return safeValue(response, "result")

end
function fetchDepositAddress(self::Kraken, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    network = safeStringUpper(params, "network");
    networks = safeValue(self.options, "networks", Dict{Symbol, Any}());
    network = safeString(networks, network, network);
    params = omit(params, "network");
    if functions.ccxtruthy(@functions.ccxt_and((code == "USDT"), (network == "TRC20")))
        code = string(code, "-", network);
    end
    defaultDepositMethods = safeValue(self.options, "depositMethods", Dict{Symbol, Any}());
    defaultDepositMethod = safeString(defaultDepositMethods, code);
    depositMethod = safeString(params, "method", defaultDepositMethod);
    if functions.ccxtruthy(depositMethod == nothing)
        depositMethods = Base.fetch(self.fetchDepositMethods(code));
        if functions.ccxtruthy(network != nothing)
            i = 0
            while functions.ccxtruthy(functions.ccxt_lt(i, length(depositMethods)))
                entry = safeString(get(depositMethods, i + 1, nothing), "method");
                if functions.ccxtruthy(entry == nothing)
                    throw(ExchangeError(string(self.id, " fetchDepositAddress() missing entry")));
                end
                if functions.ccxtruthy(findfirst(network, entry) !== nothing)
                    depositMethod = entry;
                    break
                end
                i += 1
            end

        end
        if functions.ccxtruthy(depositMethod == nothing)
            firstDepositMethod = safeValue(depositMethods, 0, Dict{Symbol, Any}());
            depositMethod = safeString(firstDepositMethod, "method");
        end
    end
    request = Dict{Symbol, Any}(
        Symbol("asset") => get(currency, Symbol("id"), nothing),
        Symbol("method") => depositMethod
    );
    response = Base.fetch(self.privatePostDepositAddresses(extend(request, params)));
    result = safeValue(response, "result", []);
    firstResult = safeValue(result, 0, Dict{Symbol, Any}());
    if functions.ccxtruthy(firstResult == nothing)
        throw(InvalidAddress(string(self.id, " privatePostDepositAddresses() returned no addresses for ", code)));
    end
    return self.parseDepositAddress(firstResult, currency)

end
function parseDepositAddress(self::Kraken, depositAddress, currency=nothing)
    address = safeString(depositAddress, "address");
    tag = safeString(depositAddress, "tag");
    currency = self.safeCurrency(nothing, currency);
    code = get(currency, Symbol("code"), nothing);
    self.checkAddress(address);
    return Dict{Symbol, Any}(
    Symbol("info") => depositAddress,
    Symbol("currency") => code,
    Symbol("network") => nothing,
    Symbol("address") => address,
    Symbol("tag") => tag
)

end
function withdraw(self::Kraken, code, amount, address, tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    if functions.ccxtruthy(ccxt_in("key", params))
        Base.fetch(self.loadMarkets());
        currency = self.currency(code);
        request = Dict{Symbol, Any}(
            Symbol("asset") => get(currency, Symbol("id"), nothing),
            Symbol("amount") => amount
        );
        if functions.ccxtruthy(@functions.ccxt_and(address != nothing, address != ""))
            request[Symbol("address")] = address;
            self.checkAddress(address);
        end
        response = Base.fetch(self.privatePostWithdraw(extend(request, params)));
        result = self.safeDict(response, "result", Dict{Symbol, Any}());
            return self.parseTransaction(result, currency)
    end
    throw(ExchangeError(string(self.id, " withdraw() requires a 'key' parameter (withdrawal key name, as set up on your account)")));

end
function fetchPositions(self::Kraken, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("docalcs") => "true",
        Symbol("consolidation") => "market"
    );
    response = Base.fetch(self.privatePostOpenPositions(extend(request, params)));
    symbols = self.marketSymbols(symbols);
    result = self.safeList(response, "result");
    results = self.parsePositions(result, symbols);
    return self.filterByArrayPositions(results, "symbol", symbols, false)

end
function parsePosition(self::Kraken, position, market=nothing)
    marketId = safeString(position, "pair");
    rawSide = safeString(position, "type");
    side = functions.ccxtruthy((rawSide == "buy")) ? "long" : "short";
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => nothing,
    Symbol("symbol") => self.safeSymbol(marketId, market),
    Symbol("notional") => nothing,
    Symbol("marginMode") => nothing,
    Symbol("liquidationPrice") => nothing,
    Symbol("entryPrice") => nothing,
    Symbol("unrealizedPnl") => self.safeNumber(position, "net"),
    Symbol("realizedPnl") => nothing,
    Symbol("percentage") => nothing,
    Symbol("contracts") => self.safeNumber(position, "vol"),
    Symbol("contractSize") => nothing,
    Symbol("markPrice") => nothing,
    Symbol("lastPrice") => nothing,
    Symbol("side") => side,
    Symbol("hedged") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("lastUpdateTimestamp") => nothing,
    Symbol("maintenanceMargin") => nothing,
    Symbol("maintenanceMarginPercentage") => nothing,
    Symbol("collateral") => nothing,
    Symbol("initialMargin") => self.safeNumber(position, "margin"),
    Symbol("initialMarginPercentage") => nothing,
    Symbol("leverage") => self.safeNumber(position, "leverage"),
    Symbol("marginRatio") => nothing,
    Symbol("stopLossPrice") => nothing,
    Symbol("takeProfitPrice") => nothing
))

end
function parseAccountType(self::Kraken, account)
    accountByType = Dict{Symbol, Any}(
        Symbol("spot") => "Spot Wallet",
        Symbol("swap") => "Futures Wallet",
        Symbol("future") => "Futures Wallet"
    );
    return safeString(accountByType, account, account)

end
function transferOut(self::Kraken, code, amount, params=Dict())
    return Base.fetch(self.transfer(code, amount, "spot", "swap", params))

end
function transfer(self::Kraken, code, amount, fromAccount, toAccount, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    fromAccountParsed = self.parseAccountType(fromAccount);
    toAccountParsed = self.parseAccountType(toAccount);
    request = Dict{Symbol, Any}(
        Symbol("amount") => self.currencyToPrecision(code, amount),
        Symbol("from") => fromAccountParsed,
        Symbol("to") => toAccountParsed,
        Symbol("asset") => get(currency, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(fromAccountParsed != "Spot Wallet")
        throw(BadRequest(string(self.id, " transfer cannot transfer from ", fromAccountParsed, " to ", toAccountParsed, ". Use krakenfutures instead to transfer from the futures account.")));
    end
    response = Base.fetch(self.privatePostWalletTransfer(extend(request, params)));
    transfer = self.parseTransfer(response, currency);
    return extend(transfer, Dict{Symbol, Any}(
    Symbol("amount") => amount,
    Symbol("fromAccount") => fromAccountParsed,
    Symbol("toAccount") => toAccountParsed
))

end
function parseTransfer(self::Kraken, transfer, currency=nothing)
    result = safeValue(transfer, "result", Dict{Symbol, Any}());
    refid = safeString(result, "refid");
    return Dict{Symbol, Any}(
    Symbol("info") => transfer,
    Symbol("id") => refid,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("currency") => safeString(currency, "code"),
    Symbol("amount") => nothing,
    Symbol("fromAccount") => nothing,
    Symbol("toAccount") => nothing,
    Symbol("status") => "sucess"
)

end
function sign(self::Kraken, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    url = string("/", self.version, "/", api, "/", path);
    if functions.ccxtruthy(api == "public")
        if functions.ccxtruthy(length(objectKeys(params)))
            url += string("?", self.urlencodeNested(params));
        end
    elseif functions.ccxtruthy(api == "private")
        price = safeString(params, "price");
        isTriggerPercent = false;
        if functions.ccxtruthy(price != nothing)
            isTriggerPercent = functions.ccxtruthy((endswith(price, "%"))) ? true : false;
        end
        isCancelOrderBatch = (path == "CancelOrderBatch");
        isBatchOrder = (path == "AddOrderBatch");
        self.checkRequiredCredentials();
        nonce = string(self.nonce());
        if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(isCancelOrderBatch, isTriggerPercent), isBatchOrder))
            body = json(extend(Dict{Symbol, Any}(
    Symbol("nonce") => nonce
), params));
        else
            body = self.urlencodeNested(extend(Dict{Symbol, Any}(
    Symbol("nonce") => nonce
), params));
        end
        auth = self.encode(string(nonce, body));
        hash = Ccxt.hash(auth, sha256, "binary");
        binary = self.encode(url);
        binhash = binaryConcat(binary, hash);
        secret = self.base64ToBinary(self.secret);
        signature = self.hmac(binhash, secret, sha512, "base64");
        headers = Dict{Symbol, Any}(
            Symbol("API-Key") => self.apiKey,
            Symbol("API-Sign") => signature
        );
        if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(isCancelOrderBatch, isTriggerPercent), isBatchOrder))
            headers[Symbol("Content-Type")] = "application/json";
        else
            headers[Symbol("Content-Type")] = "application/x-www-form-urlencoded";
        end
    else
        url = string("/", path);
    end
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing), url);
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function nonce(self::Kraken, )
    return milliseconds() - get(self.options, Symbol("timeDifference"), nothing)

end
function handleErrors(self::Kraken, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(code == 520)
        throw(ExchangeNotAvailable(string(self.id, " ", code, " ", reason)));
    end
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    if functions.ccxtruthy(get(body, 1, nothing) == "{")
        if functions.ccxtruthy(!isa(response, AbstractString))
            message = string(self.id, " ", body);
            if functions.ccxtruthy(ccxt_in("error", response))
                numErrors = length(get(response, Symbol("error"), nothing));
                if functions.ccxtruthy(numErrors)
                    i = 0
                    while functions.ccxtruthy(functions.ccxt_lt(i, length(get(response, Symbol("error"), nothing))))
                        error = get(get(response, Symbol("error"), nothing), i + 1, nothing);
                        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), error, message);
                        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), error, message);
                        i += 1
                    end

                    throw(ExchangeError(message));
                end
            end
            if functions.ccxtruthy(ccxt_in("result", response))
                result = self.safeDict(response, "result", Dict{Symbol, Any}());
                if functions.ccxtruthy(ccxt_in("orders", result))
                    orders = self.safeList(result, "orders", []);
                    i = 0
                    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
                        order = get(orders, i + 1, nothing);
                        error = safeString(order, "error");
                        if functions.ccxtruthy(error != nothing)
                            self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), error, message);
                            self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), error, message);
                            throw(ExchangeError(message));
                        end
                        i += 1
                    end

                end
            end
        end
    end
    return nothing

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Kraken, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function zendeskGet360000292886(self::Kraken, params=Dict(), context=Dict())
    return request(self, "360000292886", "zendesk", "GET", params, nothing, nothing, Dict())
end

function zendeskGet201893608(self::Kraken, params=Dict(), context=Dict())
    return request(self, "201893608", "zendesk", "GET", params, nothing, nothing, Dict())
end

function publicGetTime(self::Kraken, params=Dict(), context=Dict())
    return request(self, "Time", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetSystemStatus(self::Kraken, params=Dict(), context=Dict())
    return request(self, "SystemStatus", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetAssets(self::Kraken, params=Dict(), context=Dict())
    return request(self, "Assets", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetAssetPairs(self::Kraken, params=Dict(), context=Dict())
    return request(self, "AssetPairs", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTicker(self::Kraken, params=Dict(), context=Dict())
    return request(self, "Ticker", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetOHLC(self::Kraken, params=Dict(), context=Dict())
    return request(self, "OHLC", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetDepth(self::Kraken, params=Dict(), context=Dict())
    return request(self, "Depth", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetGroupedBook(self::Kraken, params=Dict(), context=Dict())
    return request(self, "GroupedBook", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTrades(self::Kraken, params=Dict(), context=Dict())
    return request(self, "Trades", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetSpread(self::Kraken, params=Dict(), context=Dict())
    return request(self, "Spread", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPreTrade(self::Kraken, params=Dict(), context=Dict())
    return request(self, "PreTrade", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPostTrade(self::Kraken, params=Dict(), context=Dict())
    return request(self, "PostTrade", "public", "GET", params, nothing, nothing, Dict())
end

function privatePostLevel3(self::Kraken, params=Dict(), context=Dict())
    return request(self, "Level3", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostBalance(self::Kraken, params=Dict(), context=Dict())
    return request(self, "Balance", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostBalanceEx(self::Kraken, params=Dict(), context=Dict())
    return request(self, "BalanceEx", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostCreditLines(self::Kraken, params=Dict(), context=Dict())
    return request(self, "CreditLines", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradeBalance(self::Kraken, params=Dict(), context=Dict())
    return request(self, "TradeBalance", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOpenOrders(self::Kraken, params=Dict(), context=Dict())
    return request(self, "OpenOrders", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostClosedOrders(self::Kraken, params=Dict(), context=Dict())
    return request(self, "ClosedOrders", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostQueryOrders(self::Kraken, params=Dict(), context=Dict())
    return request(self, "QueryOrders", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOrderAmends(self::Kraken, params=Dict(), context=Dict())
    return request(self, "OrderAmends", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradesHistory(self::Kraken, params=Dict(), context=Dict())
    return request(self, "TradesHistory", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostQueryTrades(self::Kraken, params=Dict(), context=Dict())
    return request(self, "QueryTrades", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOpenPositions(self::Kraken, params=Dict(), context=Dict())
    return request(self, "OpenPositions", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostLedgers(self::Kraken, params=Dict(), context=Dict())
    return request(self, "Ledgers", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostQueryLedgers(self::Kraken, params=Dict(), context=Dict())
    return request(self, "QueryLedgers", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradeVolume(self::Kraken, params=Dict(), context=Dict())
    return request(self, "TradeVolume", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAddExport(self::Kraken, params=Dict(), context=Dict())
    return request(self, "AddExport", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostExportStatus(self::Kraken, params=Dict(), context=Dict())
    return request(self, "ExportStatus", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostRetrieveExport(self::Kraken, params=Dict(), context=Dict())
    return request(self, "RetrieveExport", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostRemoveExport(self::Kraken, params=Dict(), context=Dict())
    return request(self, "RemoveExport", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostGetApiKeyInfo(self::Kraken, params=Dict(), context=Dict())
    return request(self, "GetApiKeyInfo", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAddOrder(self::Kraken, params=Dict(), context=Dict())
    return request(self, "AddOrder", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAmendOrder(self::Kraken, params=Dict(), context=Dict())
    return request(self, "AmendOrder", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostCancelOrder(self::Kraken, params=Dict(), context=Dict())
    return request(self, "CancelOrder", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostCancelAll(self::Kraken, params=Dict(), context=Dict())
    return request(self, "CancelAll", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostCancelAllOrdersAfter(self::Kraken, params=Dict(), context=Dict())
    return request(self, "CancelAllOrdersAfter", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostGetWebSocketsToken(self::Kraken, params=Dict(), context=Dict())
    return request(self, "GetWebSocketsToken", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAddOrderBatch(self::Kraken, params=Dict(), context=Dict())
    return request(self, "AddOrderBatch", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostCancelOrderBatch(self::Kraken, params=Dict(), context=Dict())
    return request(self, "CancelOrderBatch", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostEditOrder(self::Kraken, params=Dict(), context=Dict())
    return request(self, "EditOrder", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostDepositMethods(self::Kraken, params=Dict(), context=Dict())
    return request(self, "DepositMethods", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostDepositAddresses(self::Kraken, params=Dict(), context=Dict())
    return request(self, "DepositAddresses", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostDepositStatus(self::Kraken, params=Dict(), context=Dict())
    return request(self, "DepositStatus", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostWithdrawMethods(self::Kraken, params=Dict(), context=Dict())
    return request(self, "WithdrawMethods", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostWithdrawAddresses(self::Kraken, params=Dict(), context=Dict())
    return request(self, "WithdrawAddresses", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostWithdrawInfo(self::Kraken, params=Dict(), context=Dict())
    return request(self, "WithdrawInfo", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostWithdraw(self::Kraken, params=Dict(), context=Dict())
    return request(self, "Withdraw", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostWithdrawStatus(self::Kraken, params=Dict(), context=Dict())
    return request(self, "WithdrawStatus", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostWithdrawCancel(self::Kraken, params=Dict(), context=Dict())
    return request(self, "WithdrawCancel", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostWalletTransfer(self::Kraken, params=Dict(), context=Dict())
    return request(self, "WalletTransfer", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostCreateSubaccount(self::Kraken, params=Dict(), context=Dict())
    return request(self, "CreateSubaccount", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountTransfer(self::Kraken, params=Dict(), context=Dict())
    return request(self, "AccountTransfer", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostEarnAllocate(self::Kraken, params=Dict(), context=Dict())
    return request(self, "Earn/Allocate", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostEarnDeallocate(self::Kraken, params=Dict(), context=Dict())
    return request(self, "Earn/Deallocate", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostEarnAllocateStatus(self::Kraken, params=Dict(), context=Dict())
    return request(self, "Earn/AllocateStatus", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostEarnDeallocateStatus(self::Kraken, params=Dict(), context=Dict())
    return request(self, "Earn/DeallocateStatus", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostEarnStrategies(self::Kraken, params=Dict(), context=Dict())
    return request(self, "Earn/Strategies", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostEarnAllocations(self::Kraken, params=Dict(), context=Dict())
    return request(self, "Earn/Allocations", "private", "POST", params, nothing, nothing, Dict())
end

function Kraken(; kwargs...)
    inst = Kraken(Exchange(), describe, feeToPrecision, fetchMarkets, fetchStatus, fetchCurrencies, parseCurrency, safeCurrencyCode, fetchTradingFee, parseTradingFee, parseOrderBookBidAsk, fetchOrderBook, parseTicker, fetchTickers, fetchTicker, parseOHLCV, fetchOHLCV, parseLedgerEntryType, parseLedgerEntry, fetchLedger, fetchLedgerEntriesByIds, fetchLedgerEntry, parseTrade, fetchTrades, parseBalance, fetchBalance, createMarketOrderWithCost, createMarketBuyOrderWithCost, createOrder, createOrders, findMarketByAltnameOrId, getDelistedMarketById, parseOrderStatus, parseOrderType, parseOrder, orderRequest, editOrder, fetchOrder, fetchOrderTrades, fetchOrdersByIds, fetchMyTrades, cancelOrder, cancelOrders, cancelAllOrders, cancelAllOrdersAfter, fetchOpenOrders, fetchClosedOrders, parseTransactionStatus, parseNetwork, parseTransaction, parseTransactionsByType, fetchDeposits, fetchTime, fetchWithdrawals, addPaginationCursorToResult, createDepositAddress, fetchDepositMethods, fetchDepositAddress, parseDepositAddress, withdraw, fetchPositions, parsePosition, parseAccountType, transferOut, transfer, parseTransfer, sign, nonce, handleErrors, zendeskGet360000292886, zendeskGet201893608, publicGetTime, publicGetSystemStatus, publicGetAssets, publicGetAssetPairs, publicGetTicker, publicGetOHLC, publicGetDepth, publicGetGroupedBook, publicGetTrades, publicGetSpread, publicGetPreTrade, publicGetPostTrade, privatePostLevel3, privatePostBalance, privatePostBalanceEx, privatePostCreditLines, privatePostTradeBalance, privatePostOpenOrders, privatePostClosedOrders, privatePostQueryOrders, privatePostOrderAmends, privatePostTradesHistory, privatePostQueryTrades, privatePostOpenPositions, privatePostLedgers, privatePostQueryLedgers, privatePostTradeVolume, privatePostAddExport, privatePostExportStatus, privatePostRetrieveExport, privatePostRemoveExport, privatePostGetApiKeyInfo, privatePostAddOrder, privatePostAmendOrder, privatePostCancelOrder, privatePostCancelAll, privatePostCancelAllOrdersAfter, privatePostGetWebSocketsToken, privatePostAddOrderBatch, privatePostCancelOrderBatch, privatePostEditOrder, privatePostDepositMethods, privatePostDepositAddresses, privatePostDepositStatus, privatePostWithdrawMethods, privatePostWithdrawAddresses, privatePostWithdrawInfo, privatePostWithdraw, privatePostWithdrawStatus, privatePostWithdrawCancel, privatePostWalletTransfer, privatePostCreateSubaccount, privatePostAccountTransfer, privatePostEarnAllocate, privatePostEarnDeallocate, privatePostEarnAllocateStatus, privatePostEarnDeallocateStatus, privatePostEarnStrategies, privatePostEarnAllocations)
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
