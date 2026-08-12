@kwdef mutable struct Bigone <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    fetchMarkets::Function = fetchMarkets
    parseTicker::Function = parseTicker
    fetchTicker::Function = fetchTicker
    fetchTickers::Function = fetchTickers
    fetchTime::Function = fetchTime
    fetchOrderBook::Function = fetchOrderBook
    parseContractBidsAsks::Function = parseContractBidsAsks
    parseContractOrderBook::Function = parseContractOrderBook
    parseTrade::Function = parseTrade
    fetchTrades::Function = fetchTrades
    parseOHLCV::Function = parseOHLCV
    fetchOHLCV::Function = fetchOHLCV
    parseBalance::Function = parseBalance
    fetchBalance::Function = fetchBalance
    parseType::Function = parseType
    parseOrder::Function = parseOrder
    createMarketBuyOrderWithCost::Function = createMarketBuyOrderWithCost
    createOrder::Function = createOrder
    cancelOrder::Function = cancelOrder
    cancelAllOrders::Function = cancelAllOrders
    fetchOrder::Function = fetchOrder
    fetchOrders::Function = fetchOrders
    fetchMyTrades::Function = fetchMyTrades
    parseOrderStatus::Function = parseOrderStatus
    fetchOpenOrders::Function = fetchOpenOrders
    fetchClosedOrders::Function = fetchClosedOrders
    nonce::Function = nonce
    sign::Function = sign
    fetchDepositAddress::Function = fetchDepositAddress
    parseTransactionStatus::Function = parseTransactionStatus
    parseTransaction::Function = parseTransaction
    fetchDeposits::Function = fetchDeposits
    fetchWithdrawals::Function = fetchWithdrawals
    transfer::Function = transfer
    parseTransfer::Function = parseTransfer
    parseTransferStatus::Function = parseTransferStatus
    withdraw::Function = withdraw
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    publicGetPing::Function = publicGetPing
    publicGetAssetPairs::Function = publicGetAssetPairs
    publicGetAssetPairsAssetPairNameDepth::Function = publicGetAssetPairsAssetPairNameDepth
    publicGetAssetPairsAssetPairNameTrades::Function = publicGetAssetPairsAssetPairNameTrades
    publicGetAssetPairsAssetPairNameTicker::Function = publicGetAssetPairsAssetPairNameTicker
    publicGetAssetPairsAssetPairNameCandles::Function = publicGetAssetPairsAssetPairNameCandles
    publicGetAssetPairsTickers::Function = publicGetAssetPairsTickers
    privateGetAccounts::Function = privateGetAccounts
    privateGetFundAccounts::Function = privateGetFundAccounts
    privateGetAssetsAssetSymbolAddress::Function = privateGetAssetsAssetSymbolAddress
    privateGetOrders::Function = privateGetOrders
    privateGetOrdersId::Function = privateGetOrdersId
    privateGetOrdersMulti::Function = privateGetOrdersMulti
    privateGetTrades::Function = privateGetTrades
    privateGetWithdrawals::Function = privateGetWithdrawals
    privateGetDeposits::Function = privateGetDeposits
    privatePostOrders::Function = privatePostOrders
    privatePostOrdersIdCancel::Function = privatePostOrdersIdCancel
    privatePostOrdersCancel::Function = privatePostOrdersCancel
    privatePostWithdrawals::Function = privatePostWithdrawals
    privatePostTransfer::Function = privatePostTransfer
    contractPublicGetSymbols::Function = contractPublicGetSymbols
    contractPublicGetInstruments::Function = contractPublicGetInstruments
    contractPublicGetDepthSymbolSnapshot::Function = contractPublicGetDepthSymbolSnapshot
    contractPublicGetInstrumentsDifference::Function = contractPublicGetInstrumentsDifference
    contractPublicGetInstrumentsPrices::Function = contractPublicGetInstrumentsPrices
    contractPrivateGetAccounts::Function = contractPrivateGetAccounts
    contractPrivateGetOrdersId::Function = contractPrivateGetOrdersId
    contractPrivateGetOrders::Function = contractPrivateGetOrders
    contractPrivateGetOrdersOpening::Function = contractPrivateGetOrdersOpening
    contractPrivateGetOrdersCount::Function = contractPrivateGetOrdersCount
    contractPrivateGetOrdersOpeningCount::Function = contractPrivateGetOrdersOpeningCount
    contractPrivateGetTrades::Function = contractPrivateGetTrades
    contractPrivateGetTradesCount::Function = contractPrivateGetTradesCount
    contractPrivatePostOrders::Function = contractPrivatePostOrders
    contractPrivatePostOrdersBatch::Function = contractPrivatePostOrdersBatch
    contractPrivatePutPositionsSymbolMargin::Function = contractPrivatePutPositionsSymbolMargin
    contractPrivatePutPositionsSymbolRiskLimit::Function = contractPrivatePutPositionsSymbolRiskLimit
    contractPrivateDeleteOrdersId::Function = contractPrivateDeleteOrdersId
    contractPrivateDeleteOrdersBatch::Function = contractPrivateDeleteOrdersBatch
    webExchangeGetV3Assets::Function = webExchangeGetV3Assets

end
function describe(self::Bigone, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "bigone",
    Symbol("name") => "BigONE",
    Symbol("countries") => ["CN"],
    Symbol("version") => "v3",
    Symbol("rateLimit") => 20,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => true,
        Symbol("margin") => false,
        Symbol("swap") => true,
        Symbol("future") => nothing,
        Symbol("option") => false,
        Symbol("borrowCrossMargin") => false,
        Symbol("borrowIsolatedMargin") => false,
        Symbol("borrowMargin") => false,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelOrder") => true,
        Symbol("createMarketBuyOrderWithCost") => true,
        Symbol("createMarketOrderWithCost") => false,
        Symbol("createMarketSellOrderWithCost") => false,
        Symbol("createOrder") => true,
        Symbol("createPostOnlyOrder") => true,
        Symbol("createStopLimitOrder") => true,
        Symbol("createStopMarketOrder") => true,
        Symbol("createStopOrder") => true,
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
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => false,
        Symbol("fetchDeposits") => true,
        Symbol("fetchFundingHistory") => false,
        Symbol("fetchFundingRate") => false,
        Symbol("fetchFundingRateHistory") => false,
        Symbol("fetchFundingRates") => false,
        Symbol("fetchGreeks") => false,
        Symbol("fetchIsolatedBorrowRate") => false,
        Symbol("fetchIsolatedBorrowRates") => false,
        Symbol("fetchMarkets") => true,
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
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => false,
        Symbol("fetchTradingFees") => false,
        Symbol("fetchTransactionFees") => false,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("fetchWithdrawals") => true,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("transfer") => true,
        Symbol("withdraw") => true
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "min1",
        Symbol("5m") => "min5",
        Symbol("15m") => "min15",
        Symbol("30m") => "min30",
        Symbol("1h") => "hour1",
        Symbol("3h") => "hour3",
        Symbol("4h") => "hour4",
        Symbol("6h") => "hour6",
        Symbol("12h") => "hour12",
        Symbol("1d") => "day1",
        Symbol("1w") => "week1",
        Symbol("1M") => "month1"
    ),
    Symbol("hostname") => "big.one",
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/4e5cfd53-98cc-4b90-92cd-0d7b512653d1",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => "https://{hostname}/api/v3",
            Symbol("private") => "https://{hostname}/api/v3/viewer",
            Symbol("contractPublic") => "https://{hostname}/api/contract/v2",
            Symbol("contractPrivate") => "https://{hostname}/api/contract/v2",
            Symbol("webExchange") => "https://{hostname}/api/"
        ),
        Symbol("www") => "https://big.one",
        Symbol("doc") => "https://open.big.one/docs/api.html",
        Symbol("fees") => "https://bigone.zendesk.com/hc/en-us/articles/115001933374-BigONE-Fee-Policy",
        Symbol("referral") => "https://b1.run/users/new?code=D3LLBVFT"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("ping") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("asset_pairs") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("asset_pairs/{asset_pair_name}/depth") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("asset_pairs/{asset_pair_name}/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("asset_pairs/{asset_pair_name}/ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("asset_pairs/{asset_pair_name}/candles") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("asset_pairs/tickers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("accounts") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("fund/accounts") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("assets/{asset_symbol}/address") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/multi") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("withdrawals") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("deposits") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/{id}/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("withdrawals") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("contractPublic") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("symbols") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("instruments") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("depth@{symbol}/snapshot") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("instruments/difference") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("instruments/prices") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("contractPrivate") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("accounts") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/opening") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/count") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/opening/count") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trades/count") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/batch") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("put") => Dict{Symbol, Any}(
                Symbol("positions/{symbol}/margin") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("positions/{symbol}/risk-limit") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("orders/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/batch") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("webExchange") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("v3/assets") => Dict{Symbol, Any}(
    Symbol("cost") => 1
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
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("createOrder") => Dict{Symbol, Any}(
            Symbol("createMarketBuyOrderRequiresPrice") => true
        ),
        Symbol("accountsByType") => Dict{Symbol, Any}(
            Symbol("spot") => "SPOT",
            Symbol("fund") => "FUND",
            Symbol("funding") => "FUND",
            Symbol("future") => "CONTRACT",
            Symbol("swap") => "CONTRACT"
        ),
        Symbol("transfer") => Dict{Symbol, Any}(
            Symbol("fillResponseFromRequest") => true
        ),
        Symbol("exchangeMillisecondsCorrection") => -100,
        Symbol("fetchCurrencies") => Dict{Symbol, Any}(
            Symbol("webApiEnable") => true,
            Symbol("webApiRetries") => 5,
            Symbol("webApiMuteFailure") => true
        ),
        Symbol("defaultNetwork") => "ERC20",
        Symbol("defaultNetworks") => Dict{Symbol, Any}(
            Symbol("USDT") => "TRC20"
        ),
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("ABBC") => "ABBC",
            Symbol("ACA") => "Acala",
            Symbol("AE") => "Aeternity",
            Symbol("ALGO") => "Algorand",
            Symbol("APT") => "Aptos",
            Symbol("AR") => "Arweave",
            Symbol("ASTR") => "Astar",
            Symbol("AVAXC") => "Avax",
            Symbol("AVAXX") => "AvaxChain",
            Symbol("BEAM") => "Beam",
            Symbol("BEP20") => "BinanceSmartChain",
            Symbol("BITCI") => "BitciChain",
            Symbol("BTC") => "Bitcoin",
            Symbol("BCH") => "BitcoinCash",
            Symbol("BSV") => "BitcoinSV",
            Symbol("CELO") => "Celo",
            Symbol("CKKB") => "CKB",
            Symbol("ATOM") => "Cosmos",
            Symbol("CRC20") => "CRO",
            Symbol("DASH") => "Dash",
            Symbol("DOGE") => "Dogecoin",
            Symbol("XEC") => "ECash",
            Symbol("EOS") => "EOS",
            Symbol("ETH") => "Ethereum",
            Symbol("ETC") => "EthereumClassic",
            Symbol("ETHW") => "EthereumPow",
            Symbol("FTM") => "Fantom",
            Symbol("FIL") => "Filecoin",
            Symbol("FSN") => "Fusion",
            Symbol("GRIN") => "Grin",
            Symbol("ONE") => "Harmony",
            Symbol("HRC20") => "Hecochain",
            Symbol("HBAR") => "Hedera",
            Symbol("HNT") => "Helium",
            Symbol("ZEN") => "Horizen",
            Symbol("IOST") => "IOST",
            Symbol("IRIS") => "IRIS",
            Symbol("KLAY") => "Klaytn",
            Symbol("KSM") => "Kusama",
            Symbol("LTC") => "Litecoin",
            Symbol("XMR") => "Monero",
            Symbol("GLMR") => "Moonbeam",
            Symbol("NEAR") => "Near",
            Symbol("NEO") => "Neo",
            Symbol("NEON3") => "NeoN3",
            Symbol("OASIS") => "Oasis",
            Symbol("OKC") => "Okexchain",
            Symbol("ONT") => "Ontology",
            Symbol("OPTIMISM") => "Optimism",
            Symbol("DOT") => "Polkadot",
            Symbol("MATIC") => "Polygon",
            Symbol("QTUM") => "Qtum",
            Symbol("REI") => "REI",
            Symbol("XRP") => "Ripple",
            Symbol("SGB") => "SGB",
            Symbol("SDN") => "Shiden",
            Symbol("SOL") => "Solana",
            Symbol("XLM") => "Stellar",
            Symbol("TERA") => "Tera",
            Symbol("XTZ") => "Tezos",
            Symbol("TRC20") => "Tron",
            Symbol("VET") => "Vechain",
            Symbol("VSYS") => "VSystems",
            Symbol("WAX") => "WAX",
            Symbol("ZEC") => "Zcash"
        )
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("default") => Dict{Symbol, Any}(
            Symbol("sandbox") => false,
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
                    Symbol("FOK") => false,
                    Symbol("PO") => true,
                    Symbol("GTD") => false
                ),
                Symbol("hedged") => false,
                Symbol("trailing") => false,
                Symbol("leverage") => false,
                Symbol("marketBuyRequiresPrice") => true,
                Symbol("marketBuyByCost") => true,
                Symbol("selfTradePrevention") => false,
                Symbol("iceberg") => false
            ),
            Symbol("createOrders") => nothing,
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 200,
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
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 200,
                Symbol("daysBack") => nothing,
                Symbol("daysBackCanceled") => nothing,
                Symbol("untilDays") => nothing,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 500
            )
        ),
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("extends") => "default"
        ),
        Symbol("forDerivatives") => Dict{Symbol, Any}(
            Symbol("extends") => "default",
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("triggerPriceType") => Dict{Symbol, Any}(
                    Symbol("mark") => true,
                    Symbol("index") => true,
                    Symbol("last") => true
                )
            ),
            Symbol("fetchOrders") => Dict{Symbol, Any}(
                Symbol("daysBack") => 100000,
                Symbol("untilDays") => 100000
            ),
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("daysBack") => 100000,
                Symbol("untilDays") => 100000
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
            Symbol("linear") => nothing,
            Symbol("inverse") => nothing
        )
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("10001") => BadRequest,
            Symbol("10005") => ExchangeError,
            Symbol("Amount's scale must greater than AssetPair's base scale") => InvalidOrder,
            Symbol("Price mulit with amount should larger than AssetPair's min_quote_value") => InvalidOrder,
            Symbol("10007") => BadRequest,
            Symbol("10011") => ExchangeError,
            Symbol("10013") => BadSymbol,
            Symbol("10014") => InsufficientFunds,
            Symbol("10403") => PermissionDenied,
            Symbol("10429") => RateLimitExceeded,
            Symbol("40004") => AuthenticationError,
            Symbol("40103") => AuthenticationError,
            Symbol("40104") => AuthenticationError,
            Symbol("40301") => PermissionDenied,
            Symbol("40302") => ExchangeError,
            Symbol("40601") => ExchangeError,
            Symbol("40602") => ExchangeError,
            Symbol("40603") => InsufficientFunds,
            Symbol("40604") => InvalidOrder,
            Symbol("40605") => InvalidOrder,
            Symbol("40120") => InvalidOrder,
            Symbol("40121") => InvalidOrder,
            Symbol("60100") => BadSymbol
        ),
        Symbol("broad") => Dict{Symbol, Any}()
    ),
    Symbol("commonCurrencies") => Dict{Symbol, Any}(
        Symbol("CRE") => "Cybereits",
        Symbol("FXT") => "FXTTOKEN",
        Symbol("FREE") => "FreeRossDAO",
        Symbol("MBN") => "Mobilian Coin",
        Symbol("ONE") => "BigONE Token"
    )
))

end
"""
fetches all available currencies on an exchange

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
function fetchCurrencies(self::Bigone; params=Dict())
    data = Base.fetch(self.fetchWebEndpoint("fetchCurrencies", "webExchangeGetV3Assets", true));
    if functions.ccxtruthy(data == nothing)
            return Dict{Symbol, Any}()
    end
    currenciesData = self.safeList(data, "data", defaultValue = []);
    return self.parseCurrencies(currenciesData)

end
function parseCurrency(self::Bigone, rawCurrency)
    id = safeString(rawCurrency, "symbol");
    code = self.safeCurrencyCode(id);
    name = safeString(rawCurrency, "name");
    networks = Dict{Symbol, Any}();
    chains = self.safeList(rawCurrency, "binding_gateways", defaultValue = []);
    currencyMaxPrecision = self.parsePrecision(precision = safeString2(rawCurrency, "withdrawal_scale", "scale"));
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(chains)))
        chain = get(chains, j + 1, nothing);
        networkId = safeString(chain, "gateway_name");
        networkCode = self.networkIdToCode(networkId = networkId, currencyCode = code);
        deposit = self.safeBool(chain, "is_deposit_enabled");
        withdraw = self.safeBool(chain, "is_withdrawal_enabled");
        minDepositAmount = safeString(chain, "min_deposit_amount");
        minWithdrawalAmount = safeString(chain, "min_withdrawal_amount");
        withdrawalFee = safeString(chain, "withdrawal_fee");
        precision = self.parsePrecision(precision = safeString2(chain, "withdrawal_scale", "scale"));
        if functions.ccxtruthy(networkCode != nothing)
            networks[Symbol(networkCode)] = Dict{Symbol, Any}(
                Symbol("id") => networkId,
                Symbol("network") => networkCode,
                Symbol("margin") => nothing,
                Symbol("deposit") => deposit,
                Symbol("withdraw") => withdraw,
                Symbol("active") => nothing,
                Symbol("fee") => self.parseNumber(withdrawalFee),
                Symbol("precision") => self.parseNumber(precision),
                Symbol("limits") => Dict{Symbol, Any}(
                    Symbol("deposit") => Dict{Symbol, Any}(
                        Symbol("min") => minDepositAmount,
                        Symbol("max") => nothing
                    ),
                    Symbol("withdraw") => Dict{Symbol, Any}(
                        Symbol("min") => minWithdrawalAmount,
                        Symbol("max") => nothing
                    )
                ),
                Symbol("info") => chain
            );
        end
        j += 1
    end
    chainLength = length(chains);
    type_var = nothing;
    if functions.ccxtruthy(self.safeBool(rawCurrency, "is_fiat"))
        type_var = "fiat";
    elseif functions.ccxtruthy(chainLength == 0)
        if functions.ccxtruthy(self.isLeveragedCurrency(id))
            type_var = "leveraged";
        else
            type_var = "other";
        end
    else
        type_var = "crypto";
    end
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("code") => code,
    Symbol("info") => rawCurrency,
    Symbol("name") => name,
    Symbol("type") => type_var,
    Symbol("active") => nothing,
    Symbol("deposit") => nothing,
    Symbol("withdraw") => nothing,
    Symbol("fee") => nothing,
    Symbol("precision") => self.parseNumber(currencyMaxPrecision),
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
    Symbol("networks") => networks
))

end
"""
retrieves data on all markets for bigone
see: https://open.big.one/docs/spot_asset_pair.html

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Bigone; params=Dict())
    promises = [self.publicGetAssetPairs(params), self.contractPublicGetSymbols(params)];
    promisesResult = Base.fetch(asyncmap(Base.fetch, promises));
    response = get(promisesResult, 1, nothing);
    contractResponse = get(promisesResult, 2, nothing);
    markets = self.safeList(response, "data", defaultValue = []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(markets)))
        market = get(markets, i + 1, nothing);
        baseAsset = self.safeDict(market, "base_asset", defaultValue = Dict{Symbol, Any}());
        quoteAsset = self.safeDict(market, "quote_asset", defaultValue = Dict{Symbol, Any}());
        baseId = safeString(baseAsset, "symbol");
        quoteId = safeString(quoteAsset, "symbol");
        base = self.safeCurrencyCode(baseId);
        quote_var = self.safeCurrencyCode(quoteId);
        push!(result, self.safeMarketStructure(market = Dict{Symbol, Any}(
    Symbol("id") => safeString(market, "name"),
    Symbol("uuid") => safeString(market, "id"),
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
        Symbol("amount") => self.parseNumber(self.parsePrecision(precision = safeString(market, "base_scale"))),
        Symbol("price") => self.parseNumber(self.parsePrecision(precision = safeString(market, "quote_scale")))
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
            Symbol("min") => self.safeNumber(market, "min_quote_value"),
            Symbol("max") => self.safeNumber(market, "max_quote_value")
        )
    ),
    Symbol("created") => nothing,
    Symbol("info") => market
)));
        i += 1
    end
    contractMarkets = toArray(contractResponse);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(contractMarkets)))
        market = get(contractMarkets, i + 1, nothing);
        baseId = safeString(market, "baseCurrency");
        quoteId = safeString(market, "quoteCurrency");
        settleId = safeString(market, "settleCurrency");
        marketId = safeString(market, "symbol");
        base = self.safeCurrencyCode(baseId);
        quote_var = self.safeCurrencyCode(quoteId);
        settle = self.safeCurrencyCode(settleId);
        inverse = self.safeBool(market, "isInverse");
        push!(result, self.safeMarketStructure(market = Dict{Symbol, Any}(
    Symbol("id") => marketId,
    Symbol("symbol") => string(base, "/", quote_var, ":", settle),
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
    Symbol("active") => self.safeBool(market, "enable"),
    Symbol("contract") => true,
    Symbol("linear") => !functions.ccxtruthy(inverse),
    Symbol("inverse") => inverse,
    Symbol("contractSize") => self.safeNumber(market, "multiplier"),
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.parseNumber(self.parsePrecision(precision = safeString(market, "valuePrecision"))),
        Symbol("price") => self.parseNumber(self.parsePrecision(precision = safeString(market, "pricePrecision")))
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
            Symbol("min") => self.safeNumber(market, "priceMin"),
            Symbol("max") => self.safeNumber(market, "priceMax")
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "initialMargin"),
            Symbol("max") => nothing
        )
    ),
    Symbol("info") => market
)));
        i += 1
    end
    return result

end
function parseTicker(self::Bigone, ticker; market=nothing)
    marketType = functions.ccxtruthy((ccxt_in("asset_pair_name", ticker))) ? "spot" : "swap";
    marketId = safeString2(ticker, "asset_pair_name", "symbol");
    symbol = self.safeSymbol(marketId, market = market, delimiter = "-", marketType = marketType);
    close = safeString2(ticker, "close", "latestPrice");
    bid = self.safeDict(ticker, "bid", defaultValue = Dict{Symbol, Any}());
    ask = self.safeDict(ticker, "ask", defaultValue = Dict{Symbol, Any}());
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("high") => safeString2(ticker, "high", "last24hMaxPrice"),
    Symbol("low") => safeString2(ticker, "low", "last24hMinPrice"),
    Symbol("bid") => safeString(bid, "price"),
    Symbol("bidVolume") => safeString(bid, "quantity"),
    Symbol("ask") => safeString(ask, "price"),
    Symbol("askVolume") => safeString(ask, "quantity"),
    Symbol("vwap") => nothing,
    Symbol("open") => safeString(ticker, "open"),
    Symbol("close") => close,
    Symbol("last") => close,
    Symbol("previousClose") => nothing,
    Symbol("change") => safeString(ticker, "daily_change"),
    Symbol("percentage") => nothing,
    Symbol("average") => nothing,
    Symbol("baseVolume") => safeString2(ticker, "volume", "volume24h"),
    Symbol("quoteVolume") => safeString(ticker, "volume24hInUsd"),
    Symbol("markPrice") => safeString(ticker, "markPrice"),
    Symbol("indexPrice") => safeString(ticker, "indexPrice"),
    Symbol("info") => ticker
), market = market)

end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://open.big.one/docs/spot_tickers.html

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTicker(self::Bigone, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchTicker", market = market, params = params);
    if functions.ccxtruthy(type_var == "spot")
        request = Dict{Symbol, Any}(
            Symbol("asset_pair_name") => get(market, Symbol("id"), nothing)
        );
        response = Base.fetch(self.publicGetAssetPairsAssetPairNameTicker(extend(request, params)));
        ticker = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
            return self.parseTicker(ticker, market = market)
    else
        tickers = Base.fetch(self.fetchTickers(symbols = [symbol], params = params));
        return safeValue(tickers, symbol)
    end

end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://open.big.one/docs/spot_tickers.html

# Arguments
- `symbols`::array, optional: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTickers(self::Bigone; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    symbol = safeString(symbols, 0);
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchTickers", market = market, params = params);
    isSpot = type_var == "spot";
    request = Dict{Symbol, Any}();
    symbols = self.marketSymbols(symbols = symbols);
    data = nothing;
    if functions.ccxtruthy(isSpot)
        if functions.ccxtruthy(symbols != nothing)
            ids = self.marketIds(symbols = symbols);
            request[Symbol("pair_names")] =             join(ids, ",");
        end
        response = Base.fetch(self.publicGetAssetPairsTickers(extend(request, params)));
        data = self.safeList(response, "data", defaultValue = []);
    else
        instruments = Base.fetch(self.contractPublicGetInstruments(params));
        data = toArray(instruments);
    end
    tickers = self.parseTickers(data, symbols = symbols);
    return self.filterByArrayTickers(tickers, "symbol", values = symbols)

end
"""
fetches the current integer timestamp in milliseconds from the exchange server
see: https://open.big.one/docs/spot_ping.html

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
function fetchTime(self::Bigone; params=Dict())
    response = Base.fetch(self.publicGetPing(params));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    timestamp = safeInteger(data, "Timestamp");
    if functions.ccxtruthy(timestamp == nothing)
        throw(ExchangeError(string(self.id, " fetchTime() missing timestamp")));
    end
    return self.parseToInt(timestamp / 1000000)

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://open.big.one/docs/contract_misc.html#get-orderbook-snapshot

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Bigone, symbol; limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(get(market, Symbol("contract"), nothing))
        request = Dict{Symbol, Any}(
            Symbol("symbol") => get(market, Symbol("id"), nothing)
        );
        response = Base.fetch(self.contractPublicGetDepthSymbolSnapshot(extend(request, params)));
            return self.parseContractOrderBook(response, get(market, Symbol("symbol"), nothing), limit = limit)
    else
        request = Dict{Symbol, Any}(
            Symbol("asset_pair_name") => get(market, Symbol("id"), nothing)
        );
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("limit")] = limit;
        end
        response = Base.fetch(self.publicGetAssetPairsAssetPairNameDepth(extend(request, params)));
        orderbook = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
        return self.parseOrderBook(orderbook, get(market, Symbol("symbol"), nothing), timestamp = nothing, bidsKey = "bids", asksKey = "asks", priceKey = "price", amountKey = "quantity")
    end

end
function parseContractBidsAsks(self::Bigone, bidsAsks)
    bidsAsksKeys = objectKeys(bidsAsks);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(bidsAsksKeys)))
        price = get(bidsAsksKeys, i + 1, nothing);
        amount = get(bidsAsks, Symbol(price), nothing);
        push!(result, [self.parseNumber(price), self.parseNumber(amount)]);
        i += 1
    end
    return result

end
function parseContractOrderBook(self::Bigone, orderbook, symbol; limit=nothing)
    responseBids = safeValue(orderbook, "bids");
    responseAsks = safeValue(orderbook, "asks");
    bids = self.parseContractBidsAsks(responseBids);
    asks = self.parseContractBidsAsks(responseAsks);
    return Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("bids") => self.filterByLimit(sortBy(bids, 0, true), limit = limit),
    Symbol("asks") => self.filterByLimit(sortBy(asks, 0), limit = limit),
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("nonce") => nothing
)

end
function parseTrade(self::Bigone, trade; market=nothing)
    timestamp = self.parse8601(safeString2(trade, "created_at", "inserted_at"));
    priceString = safeString(trade, "price");
    amountString = safeString(trade, "amount");
    marketId = safeString(trade, "asset_pair_name");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = "-");
    side = safeString(trade, "side");
    takerSide = safeString(trade, "taker_side");
    takerOrMaker = nothing;
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and((takerSide != nothing), (side != nothing)), (side != "SELF_TRADING")))
        takerOrMaker = functions.ccxtruthy((takerSide == side)) ? "taker" : "maker";
    end
    if functions.ccxtruthy(side == nothing)
        side = functions.ccxtruthy((takerSide == "ASK")) ? "sell" : "buy";
    else
        if functions.ccxtruthy(side == "BID")
            side = "buy";
        elseif functions.ccxtruthy(side == "ASK")
            side = "sell";
        end
    end
    makerOrderId = safeString(trade, "maker_order_id");
    takerOrderId = safeString(trade, "taker_order_id");
    orderId = nothing;
    if functions.ccxtruthy(makerOrderId != nothing)
        orderId = makerOrderId;
    elseif functions.ccxtruthy(takerOrderId != nothing)
        orderId = takerOrderId;
    end
    id = safeString(trade, "id");
    result = Dict{Symbol, Any}(
        Symbol("id") => id,
        Symbol("timestamp") => timestamp,
        Symbol("datetime") => self.iso8601(timestamp),
        Symbol("symbol") => get(market, Symbol("symbol"), nothing),
        Symbol("order") => orderId,
        Symbol("type") => "limit",
        Symbol("side") => side,
        Symbol("takerOrMaker") => takerOrMaker,
        Symbol("price") => priceString,
        Symbol("amount") => amountString,
        Symbol("cost") => nothing,
        Symbol("info") => trade
    );
    makerCurrencyCode = nothing;
    takerCurrencyCode = nothing;
    if functions.ccxtruthy(takerOrMaker != nothing)
        if functions.ccxtruthy(side == "buy")
            if functions.ccxtruthy(takerOrMaker == "maker")
                makerCurrencyCode = get(market, Symbol("base"), nothing);
                takerCurrencyCode = get(market, Symbol("quote"), nothing);
            else
                makerCurrencyCode = get(market, Symbol("quote"), nothing);
                takerCurrencyCode = get(market, Symbol("base"), nothing);
            end
        else
            if functions.ccxtruthy(takerOrMaker == "maker")
                makerCurrencyCode = get(market, Symbol("quote"), nothing);
                takerCurrencyCode = get(market, Symbol("base"), nothing);
            else
                makerCurrencyCode = get(market, Symbol("base"), nothing);
                takerCurrencyCode = get(market, Symbol("quote"), nothing);
            end
        end
    elseif functions.ccxtruthy(side == "SELF_TRADING")
        if functions.ccxtruthy(takerSide == "BID")
            makerCurrencyCode = get(market, Symbol("quote"), nothing);
            takerCurrencyCode = get(market, Symbol("base"), nothing);
        elseif functions.ccxtruthy(takerSide == "ASK")
            makerCurrencyCode = get(market, Symbol("base"), nothing);
            takerCurrencyCode = get(market, Symbol("quote"), nothing);
        end
    end
    makerFeeCost = safeString(trade, "maker_fee");
    takerFeeCost = safeString(trade, "taker_fee");
    if functions.ccxtruthy(makerFeeCost != nothing)
        makerCode = makerCurrencyCode;
        if functions.ccxtruthy(takerFeeCost != nothing)
            takerCode = takerCurrencyCode;
            result[Symbol("fees")] = [Dict{Symbol, Any}(
    Symbol("cost") => makerFeeCost,
    Symbol("currency") => makerCode
), Dict{Symbol, Any}(
    Symbol("cost") => takerFeeCost,
    Symbol("currency") => takerCode
)];
        else
            result[Symbol("fee")] = Dict{Symbol, Any}(
                Symbol("cost") => makerFeeCost,
                Symbol("currency") => makerCode
            );
        end
    elseif functions.ccxtruthy(takerFeeCost != nothing)
        takerCode2 = takerCurrencyCode;
        result[Symbol("fee")] = Dict{Symbol, Any}(
            Symbol("cost") => takerFeeCost,
            Symbol("currency") => takerCode2
        );
    else
        result[Symbol("fee")] = nothing;
    end
    return self.safeTrade(result, market = market)

end
"""
get the list of most recent trades for a particular symbol
see: https://open.big.one/docs/spot_asset_pair_trade.html

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
function fetchTrades(self::Bigone, symbol; since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(get(market, Symbol("contract"), nothing))
        throw(NotSupported(string(self.id, " fetchTrades () can only fetch trades for spot markets")));
    end
    request = Dict{Symbol, Any}(
        Symbol("asset_pair_name") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetAssetPairsAssetPairNameTrades(extend(request, params)));
    trades = self.safeList(response, "data", defaultValue = []);
    return self.parseTrades(trades, market = market, since = since, limit = limit)

end
function parseOHLCV(self::Bigone, ohlcv; market=nothing)
    return [self.parse8601(safeString(ohlcv, "time")), self.safeNumber(ohlcv, "open"), self.safeNumber(ohlcv, "high"), self.safeNumber(ohlcv, "low"), self.safeNumber(ohlcv, "close"), self.safeNumber(ohlcv, "volume")]

end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://open.big.one/docs/spot_asset_pair_candle.html

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the earliest candle to fetch

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchOHLCV(self::Bigone, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(get(market, Symbol("contract"), nothing))
        throw(NotSupported(string(self.id, " fetchOHLCV () can only fetch ohlcvs for spot markets")));
    end
    until = safeInteger(params, "until");
    untilIsDefined = (until != nothing);
    sinceIsDefined = (since != nothing);
    if functions.ccxtruthy(limit == nothing)
        limit = functions.ccxtruthy((@functions.ccxt_and(sinceIsDefined, untilIsDefined))) ? 500 : 100;
    end
    request = Dict{Symbol, Any}(
        Symbol("asset_pair_name") => get(market, Symbol("id"), nothing),
        Symbol("period") => safeString(self.timeframes, timeframe, timeframe),
        Symbol("limit") => limit
    );
    if functions.ccxtruthy(sinceIsDefined)
        duration = self.parseTimeframe(timeframe);
        endByLimit = self.sum(since, limit * duration * 1000);
        if functions.ccxtruthy(untilIsDefined)
            request[Symbol("time")] = self.iso8601(min(endByLimit, until + 1));
        else
            request[Symbol("time")] = self.iso8601(endByLimit);
        end
    elseif functions.ccxtruthy(untilIsDefined)
        request[Symbol("time")] = self.iso8601(until + 1);
    end
    params = omit(params, "until");
    response = Base.fetch(self.publicGetAssetPairsAssetPairNameCandles(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseOHLCVs(data, market = market, timeframe = timeframe, since = since, limit = limit)

end
function parseBalance(self::Bigone, response)
    result = Dict{Symbol, Any}(
        Symbol("info") => response,
        Symbol("timestamp") => nothing,
        Symbol("datetime") => nothing
    );
    balances = self.safeList(response, "data", defaultValue = []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(balances)))
        balance = get(balances, i + 1, nothing);
        symbol = safeString(balance, "asset_symbol");
        code = self.safeCurrencyCode(symbol);
        account = self.account();
        account[Symbol("total")] = safeString(balance, "balance");
        account[Symbol("used")] = safeString(balance, "locked_balance");
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://open.big.one/docs/fund_accounts.html
see: https://open.big.one/docs/spot_accounts.html

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Bigone; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    type_var = safeString(params, "type", "");
    params = omit(params, "type");
    if functions.ccxtruthy(@functions.ccxt_or(type_var == "funding", type_var == "fund"))
        response = Base.fetch(self.privateGetFundAccounts(params));
    else
        response = Base.fetch(self.privateGetAccounts(params));
    end
    return self.parseBalance(response)

end
function parseType(self::Bigone, type_var)
    types = Dict{Symbol, Any}(
        Symbol("STOP_LIMIT") => "limit",
        Symbol("STOP_MARKET") => "market",
        Symbol("LIMIT") => "limit",
        Symbol("MARKET") => "market"
    );
    return safeString(types, type_var, type_var)

end
function parseOrder(self::Bigone, order; market=nothing)
    id = safeString(order, "id");
    marketId = safeString(order, "asset_pair_name");
    symbol = self.safeSymbol(marketId, market = market, delimiter = "-");
    timestamp = self.parse8601(safeString(order, "created_at"));
    side = safeString(order, "side");
    if functions.ccxtruthy(side == "BID")
        side = "buy";
    else
        side = "sell";
    end
    triggerPrice = safeString(order, "stop_price");
    if functions.ccxtruthy(stringEq(triggerPrice, "0"))
        triggerPrice = nothing;
    end
    immediateOrCancel = self.safeBool(order, "immediate_or_cancel");
    timeInForce = nothing;
    if functions.ccxtruthy(immediateOrCancel)
        timeInForce = "IOC";
    end
    type_var = self.parseType(safeString(order, "type"));
    price = safeString(order, "price");
    amount = nothing;
    filled = nothing;
    cost = nothing;
    if functions.ccxtruthy(@functions.ccxt_and(type_var == "market", side == "buy"))
        cost = safeString(order, "filled_amount");
    else
        amount = safeString(order, "amount");
        filled = safeString(order, "filled_amount");
    end
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => id,
    Symbol("clientOrderId") => safeString(order, "client_order_id"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => self.parse8601(safeString(order, "updated_at")),
    Symbol("symbol") => symbol,
    Symbol("type") => type_var,
    Symbol("timeInForce") => timeInForce,
    Symbol("postOnly") => self.safeBool(order, "post_only"),
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("triggerPrice") => triggerPrice,
    Symbol("amount") => amount,
    Symbol("cost") => cost,
    Symbol("average") => safeString(order, "avg_deal_price"),
    Symbol("filled") => filled,
    Symbol("remaining") => nothing,
    Symbol("status") => self.parseOrderStatus(safeString(order, "state")),
    Symbol("fee") => nothing,
    Symbol("trades") => nothing
), market = market)

end
"""
create a market buy order by providing the symbol and cost
see: https://open.big.one/docs/spot_orders.html#create-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createMarketBuyOrderWithCost(self::Bigone, symbol, cost; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("spot"), nothing)))
        throw(NotSupported(string(self.id, " createMarketBuyOrderWithCost() supports spot orders only")));
    end
    params[Symbol("createMarketBuyOrderRequiresPrice")] = false;
    return Base.fetch(self.createOrder(symbol, "market", "buy", cost, price = nothing, params = params))

end
"""
create a trade order
see: https://open.big.one/docs/spot_orders.html#create-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.triggerPrice`::float, optional: the price at which a trigger order is triggered at
- `params.postOnly`::bool, optional: if true, the order will only be posted to the order book and not executed immediately
- `params.timeInForce`::string, optional: "GTC", "IOC", or "PO"
- `params.cost`::float, optional: *spot market buy only* the quote quantity that can be used as an alternative for the amount EXCHANGE SPECIFIC PARAMETERS
- `params.operator`::string, optional: *stop order only* GTE or LTE (default)
- `params.client_order_id`::string, optional: must match ^[a-zA-Z0-9-_]{1,36}\$ this regex. client_order_id is unique in 24 hours, If created 24 hours later and the order closed, it will be released and can be reused

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrder(self::Bigone, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    isBuy = (side == "buy");
    requestSide = functions.ccxtruthy(isBuy) ? "BID" : "ASK";
    uppercaseType = uppercase(type_var);
    isLimit = uppercaseType == "LIMIT";
    exchangeSpecificParam = self.safeBool(params, "post_only", defaultValue = false);
    postOnly = nothing;
    (postOnly, params) = self.handlePostOnly(uppercaseType == "MARKET", exchangeSpecificParam, params = params);
    triggerPrice = safeStringN(params, ["triggerPrice", "stopPrice", "stop_price"]);
    request = Dict{Symbol, Any}(
        Symbol("asset_pair_name") => get(market, Symbol("id"), nothing),
        Symbol("side") => requestSide,
        Symbol("amount") => self.amountToPrecision(symbol, amount)
    );
    if functions.ccxtruthy(@functions.ccxt_or(isLimit, (uppercaseType == "STOP_LIMIT")))
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
        if functions.ccxtruthy(isLimit)
            timeInForce = safeString(params, "timeInForce");
            if functions.ccxtruthy(timeInForce == "IOC")
                request[Symbol("immediate_or_cancel")] = true;
            end
            if functions.ccxtruthy(postOnly)
                request[Symbol("post_only")] = true;
            end
        end
        request[Symbol("amount")] = self.amountToPrecision(symbol, amount);
    else
        if functions.ccxtruthy(isBuy)
            createMarketBuyOrderRequiresPrice = nothing;
            (createMarketBuyOrderRequiresPrice, params) = self.handleOptionAndParams(params, "createOrder", "createMarketBuyOrderRequiresPrice", defaultValue = true);
            cost = self.safeNumber(params, "cost");
            params = omit(params, "cost");
            if functions.ccxtruthy(createMarketBuyOrderRequiresPrice)
                if functions.ccxtruthy(@functions.ccxt_and((price == nothing), (cost == nothing)))
                    throw(InvalidOrder(string(self.id, " createOrder() requires the price argument for market buy orders to calculate the total cost to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option or param to false and pass the cost to spend in the amount argument")));
                else
                    amountString = numberToString(amount);
                    priceString = numberToString(price);
                    quoteAmount = self.parseToNumeric(stringMul(amountString, priceString));
                    costRequest = functions.ccxtruthy((cost != nothing)) ? cost : quoteAmount;
                    request[Symbol("amount")] = self.costToPrecision(symbol, costRequest);
                end
            else
                request[Symbol("amount")] = self.costToPrecision(symbol, amount);
            end
        else
            request[Symbol("amount")] = self.amountToPrecision(symbol, amount);
        end
    end
    if functions.ccxtruthy(triggerPrice != nothing)
        request[Symbol("stop_price")] = self.priceToPrecision(symbol, triggerPrice);
        request[Symbol("operator")] = functions.ccxtruthy(isBuy) ? "GTE" : "LTE";
        if functions.ccxtruthy(isLimit)
            uppercaseType = "STOP_LIMIT";
        elseif functions.ccxtruthy(uppercaseType == "MARKET")
            uppercaseType = "STOP_MARKET";
        end
    end
    request[Symbol("type")] = uppercaseType;
    clientOrderId = safeString(params, "clientOrderId");
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("client_order_id")] = clientOrderId;
    end
    params = omit(params, ["stop_price", "stopPrice", "triggerPrice", "timeInForce", "clientOrderId"]);
    response = Base.fetch(self.privatePostOrders(extend(request, params)));
    order = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(order, market = market)

end
"""
cancels an open order
see: https://open.big.one/docs/spot_orders.html#cancel-order

# Arguments
- `id`::string: order id
- `symbol`::string: Not used by bigone cancelOrder ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::Bigone, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("id") => id
    );
    response = Base.fetch(self.privatePostOrdersIdCancel(extend(request, params)));
    order = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(order)

end
"""
cancel all open orders
see: https://open.big.one/docs/spot_orders.html#cancel-all-orders

# Arguments
- `symbol`::string, optional: unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelAllOrders(self::Bigone; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("asset_pair_name") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privatePostOrdersCancel(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    cancelled = self.safeList(data, "cancelled", defaultValue = []);
    failed = self.safeList(data, "failed", defaultValue = []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(cancelled)))
        orderId = get(cancelled, i + 1, nothing);
        push!(result, self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => orderId,
    Symbol("id") => orderId,
    Symbol("status") => "canceled"
)));
        i += 1
    end
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(failed)))
        orderId = get(failed, i + 1, nothing);
        push!(result, self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => orderId,
    Symbol("id") => orderId,
    Symbol("status") => "failed"
)));
        i += 1
    end
    return result

end
"""
fetches information on an order made by the user
see: https://open.big.one/docs/spot_orders.html#get-one-order

# Arguments
- `id`::string: the order id
- `symbol`::string: not used by bigone fetchOrder
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrder(self::Bigone, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("id") => id
    );
    response = Base.fetch(self.privateGetOrdersId(extend(request, params)));
    order = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(order)

end
"""
fetches information on multiple orders made by the user
see: https://open.big.one/docs/spot_orders.html#get-user-orders-in-one-asset-pair

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrders(self::Bigone; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("asset_pair_name") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateGetOrders(extend(request, params)));
    orders = self.safeList(response, "data", defaultValue = []);
    return self.parseOrders(orders, market = market, since = since, limit = limit)

end
"""
fetch all trades made by the user
see: https://open.big.one/docs/spot_trade.html#trades-of-user

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchMyTrades(self::Bigone; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchMyTrades() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("asset_pair_name") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateGetTrades(extend(request, params)));
    trades = self.safeList(response, "data", defaultValue = []);
    return self.parseTrades(trades, market = market, since = since, limit = limit)

end
function parseOrderStatus(self::Bigone, status)
    statuses = Dict{Symbol, Any}(
        Symbol("PENDING") => "open",
        Symbol("FILLED") => "closed",
        Symbol("CANCELLED") => "canceled"
    );
    return safeString(statuses, status)

end
"""
fetch all unfilled currently open orders
see: https://open.big.one/docs/spot_orders.html#get-user-orders-in-one-asset-pair

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of  open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Bigone; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("state") => "PENDING"
    );
    return Base.fetch(self.fetchOrders(symbol = symbol, since = since, limit = limit, params = extend(request, params)))

end
"""
fetches information on multiple closed orders made by the user
see: https://open.big.one/docs/spot_orders.html#get-user-orders-in-one-asset-pair

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchClosedOrders(self::Bigone; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("state") => "FILLED"
    );
    return Base.fetch(self.fetchOrders(symbol = symbol, since = since, limit = limit, params = extend(request, params)))

end
function nonce(self::Bigone, )
    exchangeTimeCorrection = safeInteger(self.options, "exchangeMillisecondsCorrection", 0) * 1000000;
    return self.sum(microseconds() * 1000, exchangeTimeCorrection)

end
function sign(self::Bigone, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    query = omit(params, self.extractParams(path));
    baseUrl = self.implodeHostname(get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing));
    url = string(baseUrl, "/", self.implodeParams(path, params));
    headers = Dict{Symbol, Any}();
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(api == "public", api == "webExchange"), api == "contractPublic"))
        if functions.ccxtruthy(length(objectKeys(query)))
            url += string("?", self.urlencode(query));
        end
    else
        self.checkRequiredCredentials();
        nonce = string(self.nonce());
        request = Dict{Symbol, Any}(
            Symbol("type") => "OpenAPIV2",
            Symbol("sub") => self.apiKey,
            Symbol("nonce") => nonce
        );
        token = jwt(request, self.encode(self.secret), sha256);
        headers[Symbol("Authorization")] = string("Bearer ", token);
        if functions.ccxtruthy(method == "GET")
            if functions.ccxtruthy(length(objectKeys(query)))
                url += string("?", self.urlencode(query));
            end
        elseif functions.ccxtruthy(method == "POST")
            headers[Symbol("Content-Type")] = "application/json";
            body = json(query);
        end
    end
    headers[Symbol("User-Agent")] = string("ccxt/", self.id, "-", self.version);
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
"""
fetch the deposit address for a currency associated with this account
see: https://open.big.one/docs/spot_deposit.html#get-deposite-address-of-one-asset-of-user

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
function fetchDepositAddress(self::Bigone, code; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("asset_symbol") => get(currency, Symbol("id"), nothing)
    );
    (networkCode, paramsOmitted) = self.handleNetworkCodeAndParams(params);
    response = Base.fetch(self.privateGetAssetsAssetSymbolAddress(extend(request, paramsOmitted)));
    data = self.safeList(response, "data", defaultValue = []);
    dataLength = length(data);
    if functions.ccxtruthy(functions.ccxt_lt(dataLength, 1))
        throw(ExchangeError(string(self.id, " fetchDepositAddress() returned empty address response")));
    end
    chainsIndexedById = indexBy(data, "chain");
    selectedNetworkId = self.selectNetworkIdFromRawNetworks(code, networkCode, chainsIndexedById);
    addressObject = self.safeDict(chainsIndexedById, selectedNetworkId, defaultValue = Dict{Symbol, Any}());
    address = safeString(addressObject, "value");
    tag = safeString(addressObject, "memo");
    self.checkAddress(address = address);
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("currency") => code,
    Symbol("network") => self.networkIdToCode(networkId = selectedNetworkId, currencyCode = code),
    Symbol("address") => address,
    Symbol("tag") => tag
)

end
function parseTransactionStatus(self::Bigone, status)
    statuses = Dict{Symbol, Any}(
        Symbol("WITHHOLD") => "ok",
        Symbol("UNCONFIRMED") => "pending",
        Symbol("CONFIRMED") => "ok",
        Symbol("COMPLETED") => "ok",
        Symbol("PENDING") => "pending"
    );
    return safeString(statuses, status, status)

end
function parseTransaction(self::Bigone, transaction; currency=nothing)
    currencyId = safeString(transaction, "asset_symbol");
    code = self.safeCurrencyCode(currencyId);
    id = safeString(transaction, "id");
    amount = self.safeNumber(transaction, "amount");
    status = self.parseTransactionStatus(safeString(transaction, "state"));
    timestamp = self.parse8601(safeString(transaction, "inserted_at"));
    updated = self.parse8601(safeString2(transaction, "updated_at", "completed_at"));
    txid = safeString(transaction, "txid");
    address = safeString(transaction, "target_address");
    tag = safeString(transaction, "memo");
    type_var = functions.ccxtruthy((ccxt_in("customer_id", transaction))) ? "withdrawal" : "deposit";
    internal = self.safeBool(transaction, "is_internal");
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => id,
    Symbol("txid") => txid,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("network") => nothing,
    Symbol("addressFrom") => nothing,
    Symbol("address") => nothing,
    Symbol("addressTo") => address,
    Symbol("tagFrom") => nothing,
    Symbol("tag") => tag,
    Symbol("tagTo") => nothing,
    Symbol("type") => type_var,
    Symbol("amount") => amount,
    Symbol("currency") => code,
    Symbol("status") => status,
    Symbol("updated") => updated,
    Symbol("fee") => nothing,
    Symbol("comment") => nothing,
    Symbol("internal") => internal
)

end
"""
fetch all deposits made to an account
see: https://open.big.one/docs/spot_deposit.html#deposit-of-user

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDeposits(self::Bigone; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("asset_symbol")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateGetDeposits(extend(request, params)));
    deposits = self.safeList(response, "data", defaultValue = []);
    return self.parseTransactions(deposits, currency = currency, since = since, limit = limit)

end
"""
fetch all withdrawals made from an account
see: https://open.big.one/docs/spot_withdrawal.html#get-withdrawals-of-user

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchWithdrawals(self::Bigone; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("asset_symbol")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateGetWithdrawals(extend(request, params)));
    withdrawals = self.safeList(response, "data", defaultValue = []);
    return self.parseTransactions(withdrawals, currency = currency, since = since, limit = limit)

end
"""
transfer currency internally between wallets on the same account
see: https://open.big.one/docs/spot_transfer.html#transfer-of-user

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: 'SPOT', 'FUND', or 'CONTRACT'
- `toAccount`::string: 'SPOT', 'FUND', or 'CONTRACT'
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
function transfer(self::Bigone, code, amount, fromAccount, toAccount; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    accountsByType = self.safeDict(self.options, "accountsByType", defaultValue = Dict{Symbol, Any}());
    fromId = safeString(accountsByType, fromAccount, fromAccount);
    toId = safeString(accountsByType, toAccount, toAccount);
    guid = safeString(params, "guid", uuid());
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => self.currencyToPrecision(code, amount),
        Symbol("from") => fromId,
        Symbol("to") => toId,
        Symbol("guid") => guid
    );
    response = Base.fetch(self.privatePostTransfer(extend(request, params)));
    transfer = self.parseTransfer(response, currency = currency);
    transferOptions = self.safeDict(self.options, "transfer", defaultValue = Dict{Symbol, Any}());
    fillResponseFromRequest = self.safeBool(transferOptions, "fillResponseFromRequest", defaultValue = true);
    if functions.ccxtruthy(fillResponseFromRequest)
        transfer[Symbol("fromAccount")] = fromAccount;
        transfer[Symbol("toAccount")] = toAccount;
        transfer[Symbol("amount")] = amount;
        transfer[Symbol("id")] = guid;
    end
    return transfer

end
function parseTransfer(self::Bigone, transfer; currency=nothing)
    code = safeString(transfer, "code");
    return Dict{Symbol, Any}(
    Symbol("info") => transfer,
    Symbol("id") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("currency") => nothing,
    Symbol("amount") => nothing,
    Symbol("fromAccount") => nothing,
    Symbol("toAccount") => nothing,
    Symbol("status") => self.parseTransferStatus(code)
)

end
function parseTransferStatus(self::Bigone, status)
    statuses = Dict{Symbol, Any}(
        Symbol("0") => "ok"
    );
    return safeString(statuses, status, "failed")

end
"""
make a withdrawal
see: https://open.big.one/docs/spot_withdrawal.html#create-withdrawal-of-user

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function withdraw(self::Bigone, code, amount, address; tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(currency, Symbol("id"), nothing),
        Symbol("target_address") => address,
        Symbol("amount") => self.currencyToPrecision(code, amount)
    );
    if functions.ccxtruthy(tag != nothing)
        request[Symbol("memo")] = tag;
    end
    networkCode = nothing;
    (networkCode, params) = self.handleNetworkCodeAndParams(params);
    if functions.ccxtruthy(networkCode != nothing)
        request[Symbol("gateway_name")] = self.networkCodeToId(networkCode, currencyCode = get(currency, Symbol("code"), nothing));
    end
    response = Base.fetch(self.privatePostWithdrawals(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseTransaction(data, currency = currency)

end
function handleErrors(self::Bigone, httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    code = safeString(response, "code");
    message = safeString(response, "message");
    if functions.ccxtruthy(@functions.ccxt_and((code != "0"), (code != nothing)))
        feedback = string(self.id, " ", body);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), message, feedback);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), code, feedback);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), message, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Bigone, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetPing(self::Bigone, params=Dict(), context=Dict())
    return request(self, "ping"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetAssetPairs(self::Bigone, params=Dict(), context=Dict())
    return request(self, "asset_pairs"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetAssetPairsAssetPairNameDepth(self::Bigone, params=Dict(), context=Dict())
    return request(self, "asset_pairs/{asset_pair_name}/depth"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetAssetPairsAssetPairNameTrades(self::Bigone, params=Dict(), context=Dict())
    return request(self, "asset_pairs/{asset_pair_name}/trades"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetAssetPairsAssetPairNameTicker(self::Bigone, params=Dict(), context=Dict())
    return request(self, "asset_pairs/{asset_pair_name}/ticker"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetAssetPairsAssetPairNameCandles(self::Bigone, params=Dict(), context=Dict())
    return request(self, "asset_pairs/{asset_pair_name}/candles"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetAssetPairsTickers(self::Bigone, params=Dict(), context=Dict())
    return request(self, "asset_pairs/tickers"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccounts(self::Bigone, params=Dict(), context=Dict())
    return request(self, "accounts"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetFundAccounts(self::Bigone, params=Dict(), context=Dict())
    return request(self, "fund/accounts"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAssetsAssetSymbolAddress(self::Bigone, params=Dict(), context=Dict())
    return request(self, "assets/{asset_symbol}/address"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrders(self::Bigone, params=Dict(), context=Dict())
    return request(self, "orders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrdersId(self::Bigone, params=Dict(), context=Dict())
    return request(self, "orders/{id}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrdersMulti(self::Bigone, params=Dict(), context=Dict())
    return request(self, "orders/multi"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetTrades(self::Bigone, params=Dict(), context=Dict())
    return request(self, "trades"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetWithdrawals(self::Bigone, params=Dict(), context=Dict())
    return request(self, "withdrawals"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetDeposits(self::Bigone, params=Dict(), context=Dict())
    return request(self, "deposits"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrders(self::Bigone, params=Dict(), context=Dict())
    return request(self, "orders"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrdersIdCancel(self::Bigone, params=Dict(), context=Dict())
    return request(self, "orders/{id}/cancel"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrdersCancel(self::Bigone, params=Dict(), context=Dict())
    return request(self, "orders/cancel"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostWithdrawals(self::Bigone, params=Dict(), context=Dict())
    return request(self, "withdrawals"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostTransfer(self::Bigone, params=Dict(), context=Dict())
    return request(self, "transfer"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPublicGetSymbols(self::Bigone, params=Dict(), context=Dict())
    return request(self, "symbols"; api="contractPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPublicGetInstruments(self::Bigone, params=Dict(), context=Dict())
    return request(self, "instruments"; api="contractPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPublicGetDepthSymbolSnapshot(self::Bigone, params=Dict(), context=Dict())
    return request(self, "depth@{symbol}/snapshot"; api="contractPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPublicGetInstrumentsDifference(self::Bigone, params=Dict(), context=Dict())
    return request(self, "instruments/difference"; api="contractPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPublicGetInstrumentsPrices(self::Bigone, params=Dict(), context=Dict())
    return request(self, "instruments/prices"; api="contractPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPrivateGetAccounts(self::Bigone, params=Dict(), context=Dict())
    return request(self, "accounts"; api="contractPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPrivateGetOrdersId(self::Bigone, params=Dict(), context=Dict())
    return request(self, "orders/{id}"; api="contractPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPrivateGetOrders(self::Bigone, params=Dict(), context=Dict())
    return request(self, "orders"; api="contractPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPrivateGetOrdersOpening(self::Bigone, params=Dict(), context=Dict())
    return request(self, "orders/opening"; api="contractPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPrivateGetOrdersCount(self::Bigone, params=Dict(), context=Dict())
    return request(self, "orders/count"; api="contractPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPrivateGetOrdersOpeningCount(self::Bigone, params=Dict(), context=Dict())
    return request(self, "orders/opening/count"; api="contractPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPrivateGetTrades(self::Bigone, params=Dict(), context=Dict())
    return request(self, "trades"; api="contractPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPrivateGetTradesCount(self::Bigone, params=Dict(), context=Dict())
    return request(self, "trades/count"; api="contractPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPrivatePostOrders(self::Bigone, params=Dict(), context=Dict())
    return request(self, "orders"; api="contractPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPrivatePostOrdersBatch(self::Bigone, params=Dict(), context=Dict())
    return request(self, "orders/batch"; api="contractPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPrivatePutPositionsSymbolMargin(self::Bigone, params=Dict(), context=Dict())
    return request(self, "positions/{symbol}/margin"; api="contractPrivate", method="PUT", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPrivatePutPositionsSymbolRiskLimit(self::Bigone, params=Dict(), context=Dict())
    return request(self, "positions/{symbol}/risk-limit"; api="contractPrivate", method="PUT", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPrivateDeleteOrdersId(self::Bigone, params=Dict(), context=Dict())
    return request(self, "orders/{id}"; api="contractPrivate", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPrivateDeleteOrdersBatch(self::Bigone, params=Dict(), context=Dict())
    return request(self, "orders/batch"; api="contractPrivate", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function webExchangeGetV3Assets(self::Bigone, params=Dict(), context=Dict())
    return request(self, "v3/assets"; api="webExchange", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function Bigone(; kwargs...)
    inst = Bigone(Exchange(), describe, fetchCurrencies, parseCurrency, fetchMarkets, parseTicker, fetchTicker, fetchTickers, fetchTime, fetchOrderBook, parseContractBidsAsks, parseContractOrderBook, parseTrade, fetchTrades, parseOHLCV, fetchOHLCV, parseBalance, fetchBalance, parseType, parseOrder, createMarketBuyOrderWithCost, createOrder, cancelOrder, cancelAllOrders, fetchOrder, fetchOrders, fetchMyTrades, parseOrderStatus, fetchOpenOrders, fetchClosedOrders, nonce, sign, fetchDepositAddress, parseTransactionStatus, parseTransaction, fetchDeposits, fetchWithdrawals, transfer, parseTransfer, parseTransferStatus, withdraw, handleErrors, publicGetPing, publicGetAssetPairs, publicGetAssetPairsAssetPairNameDepth, publicGetAssetPairsAssetPairNameTrades, publicGetAssetPairsAssetPairNameTicker, publicGetAssetPairsAssetPairNameCandles, publicGetAssetPairsTickers, privateGetAccounts, privateGetFundAccounts, privateGetAssetsAssetSymbolAddress, privateGetOrders, privateGetOrdersId, privateGetOrdersMulti, privateGetTrades, privateGetWithdrawals, privateGetDeposits, privatePostOrders, privatePostOrdersIdCancel, privatePostOrdersCancel, privatePostWithdrawals, privatePostTransfer, contractPublicGetSymbols, contractPublicGetInstruments, contractPublicGetDepthSymbolSnapshot, contractPublicGetInstrumentsDifference, contractPublicGetInstrumentsPrices, contractPrivateGetAccounts, contractPrivateGetOrdersId, contractPrivateGetOrders, contractPrivateGetOrdersOpening, contractPrivateGetOrdersCount, contractPrivateGetOrdersOpeningCount, contractPrivateGetTrades, contractPrivateGetTradesCount, contractPrivatePostOrders, contractPrivatePostOrdersBatch, contractPrivatePutPositionsSymbolMargin, contractPrivatePutPositionsSymbolRiskLimit, contractPrivateDeleteOrdersId, contractPrivateDeleteOrdersBatch, webExchangeGetV3Assets)
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
function __ccxt_doc_Bigone_fetchCurrencies() end
"""
fetches all available currencies on an exchange

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
__ccxt_doc_Bigone_fetchCurrencies

function __ccxt_doc_Bigone_fetchMarkets() end
"""
retrieves data on all markets for bigone
see: https://open.big.one/docs/spot_asset_pair.html

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Bigone_fetchMarkets

function __ccxt_doc_Bigone_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://open.big.one/docs/spot_tickers.html

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Bigone_fetchTicker

function __ccxt_doc_Bigone_fetchTickers() end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://open.big.one/docs/spot_tickers.html

# Arguments
- `symbols`::array, optional: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Bigone_fetchTickers

function __ccxt_doc_Bigone_fetchTime() end
"""
fetches the current integer timestamp in milliseconds from the exchange server
see: https://open.big.one/docs/spot_ping.html

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
__ccxt_doc_Bigone_fetchTime

function __ccxt_doc_Bigone_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://open.big.one/docs/contract_misc.html#get-orderbook-snapshot

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Bigone_fetchOrderBook

function __ccxt_doc_Bigone_fetchTrades() end
"""
get the list of most recent trades for a particular symbol
see: https://open.big.one/docs/spot_asset_pair_trade.html

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
__ccxt_doc_Bigone_fetchTrades

function __ccxt_doc_Bigone_fetchOHLCV() end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://open.big.one/docs/spot_asset_pair_candle.html

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the earliest candle to fetch

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Bigone_fetchOHLCV

function __ccxt_doc_Bigone_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://open.big.one/docs/fund_accounts.html
see: https://open.big.one/docs/spot_accounts.html

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Bigone_fetchBalance

function __ccxt_doc_Bigone_createMarketBuyOrderWithCost() end
"""
create a market buy order by providing the symbol and cost
see: https://open.big.one/docs/spot_orders.html#create-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bigone_createMarketBuyOrderWithCost

function __ccxt_doc_Bigone_createOrder() end
"""
create a trade order
see: https://open.big.one/docs/spot_orders.html#create-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.triggerPrice`::float, optional: the price at which a trigger order is triggered at
- `params.postOnly`::bool, optional: if true, the order will only be posted to the order book and not executed immediately
- `params.timeInForce`::string, optional: "GTC", "IOC", or "PO"
- `params.cost`::float, optional: *spot market buy only* the quote quantity that can be used as an alternative for the amount EXCHANGE SPECIFIC PARAMETERS
- `params.operator`::string, optional: *stop order only* GTE or LTE (default)
- `params.client_order_id`::string, optional: must match ^[a-zA-Z0-9-_]{1,36}\$ this regex. client_order_id is unique in 24 hours, If created 24 hours later and the order closed, it will be released and can be reused

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bigone_createOrder

function __ccxt_doc_Bigone_cancelOrder() end
"""
cancels an open order
see: https://open.big.one/docs/spot_orders.html#cancel-order

# Arguments
- `id`::string: order id
- `symbol`::string: Not used by bigone cancelOrder ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bigone_cancelOrder

function __ccxt_doc_Bigone_cancelAllOrders() end
"""
cancel all open orders
see: https://open.big.one/docs/spot_orders.html#cancel-all-orders

# Arguments
- `symbol`::string, optional: unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bigone_cancelAllOrders

function __ccxt_doc_Bigone_fetchOrder() end
"""
fetches information on an order made by the user
see: https://open.big.one/docs/spot_orders.html#get-one-order

# Arguments
- `id`::string: the order id
- `symbol`::string: not used by bigone fetchOrder
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bigone_fetchOrder

function __ccxt_doc_Bigone_fetchOrders() end
"""
fetches information on multiple orders made by the user
see: https://open.big.one/docs/spot_orders.html#get-user-orders-in-one-asset-pair

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bigone_fetchOrders

function __ccxt_doc_Bigone_fetchMyTrades() end
"""
fetch all trades made by the user
see: https://open.big.one/docs/spot_trade.html#trades-of-user

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Bigone_fetchMyTrades

function __ccxt_doc_Bigone_fetchOpenOrders() end
"""
fetch all unfilled currently open orders
see: https://open.big.one/docs/spot_orders.html#get-user-orders-in-one-asset-pair

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of  open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bigone_fetchOpenOrders

function __ccxt_doc_Bigone_fetchClosedOrders() end
"""
fetches information on multiple closed orders made by the user
see: https://open.big.one/docs/spot_orders.html#get-user-orders-in-one-asset-pair

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bigone_fetchClosedOrders

function __ccxt_doc_Bigone_fetchDepositAddress() end
"""
fetch the deposit address for a currency associated with this account
see: https://open.big.one/docs/spot_deposit.html#get-deposite-address-of-one-asset-of-user

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
__ccxt_doc_Bigone_fetchDepositAddress

function __ccxt_doc_Bigone_fetchDeposits() end
"""
fetch all deposits made to an account
see: https://open.big.one/docs/spot_deposit.html#deposit-of-user

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Bigone_fetchDeposits

function __ccxt_doc_Bigone_fetchWithdrawals() end
"""
fetch all withdrawals made from an account
see: https://open.big.one/docs/spot_withdrawal.html#get-withdrawals-of-user

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Bigone_fetchWithdrawals

function __ccxt_doc_Bigone_transfer() end
"""
transfer currency internally between wallets on the same account
see: https://open.big.one/docs/spot_transfer.html#transfer-of-user

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: 'SPOT', 'FUND', or 'CONTRACT'
- `toAccount`::string: 'SPOT', 'FUND', or 'CONTRACT'
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
__ccxt_doc_Bigone_transfer

function __ccxt_doc_Bigone_withdraw() end
"""
make a withdrawal
see: https://open.big.one/docs/spot_withdrawal.html#create-withdrawal-of-user

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Bigone_withdraw
