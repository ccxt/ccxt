@kwdef mutable struct Bitso <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchLedger::Function = fetchLedger
    parseLedgerEntryType::Function = parseLedgerEntryType
    parseLedgerEntry::Function = parseLedgerEntry
    fetchMarkets::Function = fetchMarkets
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    parseBalance::Function = parseBalance
    fetchBalance::Function = fetchBalance
    fetchOrderBook::Function = fetchOrderBook
    parseTicker::Function = parseTicker
    fetchTicker::Function = fetchTicker
    fetchOHLCV::Function = fetchOHLCV
    parseOHLCV::Function = parseOHLCV
    parseTrade::Function = parseTrade
    fetchTrades::Function = fetchTrades
    fetchTradingFees::Function = fetchTradingFees
    fetchMyTrades::Function = fetchMyTrades
    createOrder::Function = createOrder
    cancelOrder::Function = cancelOrder
    cancelOrders::Function = cancelOrders
    cancelAllOrders::Function = cancelAllOrders
    parseOrderStatus::Function = parseOrderStatus
    parseOrder::Function = parseOrder
    fetchOpenOrders::Function = fetchOpenOrders
    fetchOrder::Function = fetchOrder
    fetchOrderTrades::Function = fetchOrderTrades
    fetchDeposit::Function = fetchDeposit
    fetchDeposits::Function = fetchDeposits
    fetchDepositAddress::Function = fetchDepositAddress
    fetchTransactionFees::Function = fetchTransactionFees
    fetchDepositWithdrawFees::Function = fetchDepositWithdrawFees
    parseDepositWithdrawFees::Function = parseDepositWithdrawFees
    withdraw::Function = withdraw
    parseTransaction::Function = parseTransaction
    parseTransactionStatus::Function = parseTransactionStatus
    nonce::Function = nonce
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    publicGetAvailableBooks::Function = publicGetAvailableBooks
    publicGetCatalogues::Function = publicGetCatalogues
    publicGetTicker::Function = publicGetTicker
    publicGetOrderBook::Function = publicGetOrderBook
    publicGetTrades::Function = publicGetTrades
    publicGetOhlc::Function = publicGetOhlc
    privateGetAccountStatus::Function = privateGetAccountStatus
    privateGetBalance::Function = privateGetBalance
    privateGetFees::Function = privateGetFees
    privateGetFundings::Function = privateGetFundings
    privateGetFundingsFid::Function = privateGetFundingsFid
    privateGetFundingDestination::Function = privateGetFundingDestination
    privateGetKycDocuments::Function = privateGetKycDocuments
    privateGetLedger::Function = privateGetLedger
    privateGetLedgerTrades::Function = privateGetLedgerTrades
    privateGetLedgerFees::Function = privateGetLedgerFees
    privateGetLedgerFundings::Function = privateGetLedgerFundings
    privateGetLedgerWithdrawals::Function = privateGetLedgerWithdrawals
    privateGetMxBankCodes::Function = privateGetMxBankCodes
    privateGetOpenOrders::Function = privateGetOpenOrders
    privateGetOrderTradesOid::Function = privateGetOrderTradesOid
    privateGetOrdersOid::Function = privateGetOrdersOid
    privateGetUserTrades::Function = privateGetUserTrades
    privateGetUserTradesTid::Function = privateGetUserTradesTid
    privateGetWithdrawals::Function = privateGetWithdrawals
    privateGetWithdrawalsWid::Function = privateGetWithdrawalsWid
    privatePostBitcoinWithdrawal::Function = privatePostBitcoinWithdrawal
    privatePostDebitCardWithdrawal::Function = privatePostDebitCardWithdrawal
    privatePostEtherWithdrawal::Function = privatePostEtherWithdrawal
    privatePostOrders::Function = privatePostOrders
    privatePostPhoneNumber::Function = privatePostPhoneNumber
    privatePostPhoneVerification::Function = privatePostPhoneVerification
    privatePostPhoneWithdrawal::Function = privatePostPhoneWithdrawal
    privatePostSpeiWithdrawal::Function = privatePostSpeiWithdrawal
    privatePostRippleWithdrawal::Function = privatePostRippleWithdrawal
    privatePostBcashWithdrawal::Function = privatePostBcashWithdrawal
    privatePostLitecoinWithdrawal::Function = privatePostLitecoinWithdrawal
    privateDeleteOrders::Function = privateDeleteOrders
    privateDeleteOrdersOid::Function = privateDeleteOrdersOid
    privateDeleteOrdersAll::Function = privateDeleteOrdersAll

end
function describe(self::Bitso, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "bitso",
    Symbol("name") => "Bitso",
    Symbol("countries") => ["MX"],
    Symbol("rateLimit") => 2000,
    Symbol("version") => "v3",
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
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => true,
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => false,
        Symbol("createDepositAddress") => false,
        Symbol("createOrder") => true,
        Symbol("createOrderWithTakeProfitAndStopLoss") => false,
        Symbol("createOrderWithTakeProfitAndStopLossWs") => false,
        Symbol("createReduceOnlyOrder") => false,
        Symbol("fetchAccounts") => false,
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
        Symbol("fetchDeposit") => true,
        Symbol("fetchDepositAddress") => true,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => false,
        Symbol("fetchDeposits") => true,
        Symbol("fetchDepositsWithdrawals") => false,
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
        Symbol("fetchTickers") => false,
        Symbol("fetchTime") => false,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => false,
        Symbol("fetchTradingFees") => true,
        Symbol("fetchTransactionFee") => false,
        Symbol("fetchTransactionFees") => true,
        Symbol("fetchTransactions") => false,
        Symbol("fetchTransfer") => false,
        Symbol("fetchTransfers") => false,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("reduceMargin") => false,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("setLeverage") => false,
        Symbol("setMargin") => false,
        Symbol("setMarginMode") => false,
        Symbol("setPositionMode") => false,
        Symbol("transfer") => false,
        Symbol("withdraw") => true
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/3d0c1e5e-8aaa-419f-968a-2b7409381ce4",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("rest") => "https://bitso.com/api"
        ),
        Symbol("test") => Dict{Symbol, Any}(
            Symbol("rest") => "https://stage.bitso.com/api"
        ),
        Symbol("www") => "https://bitso.com",
        Symbol("doc") => "https://bitso.com/api_info",
        Symbol("fees") => "https://bitso.com/fees",
        Symbol("referral") => "https://bitso.com/?ref=itej"
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("TRC20") => "trx",
            Symbol("ERC20") => "erc20",
            Symbol("BEP20") => "bsc",
            Symbol("BEP2") => "bep2"
        )
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "60",
        Symbol("5m") => "300",
        Symbol("15m") => "900",
        Symbol("30m") => "1800",
        Symbol("1h") => "3600",
        Symbol("4h") => "14400",
        Symbol("12h") => "43200",
        Symbol("1d") => "86400",
        Symbol("1w") => "604800"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("available_books") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("catalogues") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order_book") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ohlc") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("account_status") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("balance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("fees") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("fundings") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("fundings/{fid}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("funding_destination") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("kyc_documents") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ledger") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ledger/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ledger/fees") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ledger/fundings") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ledger/withdrawals") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("mx_bank_codes") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("open_orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order_trades/{oid}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/{oid}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("user_trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("user_trades/{tid}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("withdrawals/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("withdrawals/{wid}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("bitcoin_withdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("debit_card_withdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ether_withdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("phone_number") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("phone_verification") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("phone_withdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("spei_withdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ripple_withdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("bcash_withdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("litecoin_withdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/{oid}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/all") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        )
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("sandbox") => false,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("triggerPrice") => true,
                Symbol("triggerPriceType") => nothing,
                Symbol("triggerDirection") => nothing,
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
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("marketBuyByCost") => false,
                Symbol("selfTradePrevention") => false,
                Symbol("iceberg") => false
            ),
            Symbol("createOrders") => nothing,
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => nothing,
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
                Symbol("limit") => 500,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOrders") => nothing,
            Symbol("fetchClosedOrders") => nothing,
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 300
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
        Symbol("0201") => AuthenticationError,
        Symbol("104") => InvalidNonce,
        Symbol("0304") => BadRequest
    )
))

end
"""
fetch the history of changes, actions done by the user or operations that altered the balance of the user

# Arguments
- `code`::string, optional: unified currency code, default is undefined
- `since`::int, optional: timestamp in ms of the earliest ledger entry, default is undefined
- `limit`::int, optional: max number of ledger entries to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
"""
function fetchLedger(self::Bitso; code=nothing, since=nothing, limit=nothing, params=Dict())
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateGetLedger(extend(request, params)));
    payload = safeValue(response, "payload", []);
    currency = self.safeCurrency(code);
    return self.parseLedger(payload, currency = currency, since = since, limit = limit)

end
function parseLedgerEntryType(self::Bitso, type_var)
    types = Dict{Symbol, Any}(
        Symbol("funding") => "transaction",
        Symbol("withdrawal") => "transaction",
        Symbol("trade") => "trade",
        Symbol("fee") => "fee"
    );
    return safeString(types, type_var, type_var)

end
function parseLedgerEntry(self::Bitso, item; currency=nothing)
    operation = safeString(item, "operation");
    type_var = self.parseLedgerEntryType(operation);
    balanceUpdates = safeValue(item, "balance_updates", []);
    firstBalance = safeValue(balanceUpdates, 0, Dict{Symbol, Any}());
    direction = nothing;
    fee = nothing;
    amount = safeString(firstBalance, "amount");
    currencyId = safeString(firstBalance, "currency");
    code = self.safeCurrencyCode(currencyId, currency = currency);
    currency = self.safeCurrency(currencyId, currency = currency);
    details = safeValue(item, "details", Dict{Symbol, Any}());
    referenceId = safeString2(details, "fid", "wid");
    if functions.ccxtruthy(referenceId == nothing)
        referenceId = safeString(details, "tid");
    end
    if functions.ccxtruthy(operation == "funding")
        direction = "in";
    elseif functions.ccxtruthy(operation == "withdrawal")
        direction = "out";
    else
        if functions.ccxtruthy(operation == "trade")
            direction = nothing;
        elseif functions.ccxtruthy(operation == "fee")
            direction = "out";
            cost = stringAbs(amount);
            fee = Dict{Symbol, Any}(
                Symbol("cost") => cost,
                Symbol("currency") => currency
            );
        end

    end
    timestamp = self.parse8601(safeString(item, "created_at"));
    return self.safeLedgerEntry(Dict{Symbol, Any}(
    Symbol("info") => item,
    Symbol("id") => safeString(item, "eid"),
    Symbol("direction") => direction,
    Symbol("account") => nothing,
    Symbol("referenceId") => referenceId,
    Symbol("referenceAccount") => nothing,
    Symbol("type") => type_var,
    Symbol("currency") => code,
    Symbol("amount") => amount,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("before") => nothing,
    Symbol("after") => nothing,
    Symbol("status") => "ok",
    Symbol("fee") => fee
), currency = currency)

end
"""
retrieves data on all markets for bitso
see: https://docs.bitso.com/bitso-api/docs/list-available-books

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Bitso; params=Dict())
    response = Base.fetch(self.publicGetAvailableBooks(params));
    markets = safeValue(response, "payload", []);
    currencies = self.safeDict(self.options, "cachedCurrencies");
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(markets)))
        market = get(markets, i + 1, nothing);
        id = safeString(market, "book");
        (baseId, quoteId) = split(id, "_");
        base = uppercase(baseId);
        quote_var = uppercase(quoteId);
        base = self.safeCurrencyCode(base);
        quote_var = self.safeCurrencyCode(quote_var);
        fees = safeValue(market, "fees", Dict{Symbol, Any}());
        flatRate = safeValue(fees, "flat_rate", Dict{Symbol, Any}());
        takerString = safeString(flatRate, "taker");
        makerString = safeString(flatRate, "maker");
        taker = self.parseNumber(stringDiv(takerString, "100"));
        maker = self.parseNumber(stringDiv(makerString, "100"));
        feeTiers = safeValue(fees, "structure", []);
        fee = Dict{Symbol, Any}(
            Symbol("taker") => taker,
            Symbol("maker") => maker,
            Symbol("percentage") => true,
            Symbol("tierBased") => true
        );
        takerFees = [];
        makerFees = [];
        j = 0
        while functions.ccxtruthy(functions.ccxt_lt(j, length(feeTiers)))
            tier = get(feeTiers, j + 1, nothing);
            volume = self.safeNumber(tier, "volume");
            takerFee = self.safeNumber(tier, "taker");
            makerFee = self.safeNumber(tier, "maker");
            push!(takerFees, [volume, takerFee]);
            push!(makerFees, [volume, makerFee]);
            if functions.ccxtruthy(j == 0)
                fee[Symbol("taker")] = takerFee;
                fee[Symbol("maker")] = makerFee;
            end
            j += 1
        end
        tiers = Dict{Symbol, Any}(
            Symbol("taker") => takerFees,
            Symbol("maker") => makerFees
        );
        fee[Symbol("tiers")] = tiers;
        baseCurrency = self.safeDict(currencies, base);
        push!(result, self.safeMarketStructure(market = extend(Dict{Symbol, Any}(
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
    Symbol("active") => nothing,
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
        Symbol("amount") => self.safeNumber(baseCurrency, "precision"),
        Symbol("price") => self.safeNumber(market, "tick_size")
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "minimum_amount"),
            Symbol("max") => self.safeNumber(market, "maximum_amount")
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "minimum_price"),
            Symbol("max") => self.safeNumber(market, "maximum_price")
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "minimum_value"),
            Symbol("max") => self.safeNumber(market, "maximum_value")
        )
    ),
    Symbol("created") => nothing,
    Symbol("info") => market
), fee)));
        i += 1
    end
    return result

end
"""
fetches all available currencies on an exchange
see: https://docs.bitso.com/bitso-payouts-funding/docs

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
function fetchCurrencies(self::Bitso; params=Dict())
    catalogues = Base.fetch(self.publicGetCatalogues(params));
    payload = self.safeDict(catalogues, "payload");
    currencies = self.safeDict(payload, "currencies");
    metadata = self.safeList(currencies, "metadata", defaultValue = []);
    return self.parseCurrencies(metadata)

end
function parseCurrency(self::Bitso, rawCurrency)
    currencyId = safeString(rawCurrency, "code");
    code = self.safeCurrencyCode(currencyId);
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("info") => rawCurrency,
    Symbol("code") => code,
    Symbol("id") => currencyId,
    Symbol("name") => safeString(rawCurrency, "full_name"),
    Symbol("active") => nothing,
    Symbol("deposit") => nothing,
    Symbol("withdraw") => nothing,
    Symbol("fee") => nothing,
    Symbol("precision") => self.parseNumber(self.parsePrecision(precision = safeString(rawCurrency, "precision"))),
    Symbol("margin") => self.safeBool(rawCurrency, "marginAvailable"),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("deposit") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    ),
    Symbol("networks") => nothing,
    Symbol("type") => safeString(rawCurrency, "type")
))

end
function parseBalance(self::Bitso, response)
    payload = safeValue(response, "payload", Dict{Symbol, Any}());
    balances = safeValue(payload, "balances", []);
    result = Dict{Symbol, Any}(
        Symbol("info") => response,
        Symbol("timestamp") => nothing,
        Symbol("datetime") => nothing
    );
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(balances)))
        balance = get(balances, i + 1, nothing);
        currencyId = safeString(balance, "currency");
        code = self.safeCurrencyCode(currencyId);
        account = self.account();
        account[Symbol("free")] = safeString(balance, "available");
        account[Symbol("used")] = safeString(balance, "locked");
        account[Symbol("total")] = safeString(balance, "total");
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://docs.bitso.com/bitso-api/docs/get-account-balance

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Bitso; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetBalance(params));
    return self.parseBalance(response)

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://docs.bitso.com/bitso-api/docs/list-order-book

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Bitso, symbol; limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("book") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetOrderBook(extend(request, params)));
    orderbook = safeValue(response, "payload");
    timestamp = self.parse8601(safeString(orderbook, "updated_at"));
    return self.parseOrderBook(orderbook, get(market, Symbol("symbol"), nothing), timestamp = timestamp, bidsKey = "bids", asksKey = "asks", priceKey = "price", amountKey = "amount")

end
function parseTicker(self::Bitso, ticker; market=nothing)
    symbol = self.safeSymbol(nothing, market = market);
    timestamp = self.parse8601(safeString(ticker, "created_at"));
    vwap = safeString(ticker, "vwap");
    baseVolume = safeString(ticker, "volume");
    quoteVolume = stringMul(baseVolume, vwap);
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
    Symbol("vwap") => vwap,
    Symbol("open") => nothing,
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => nothing,
    Symbol("average") => nothing,
    Symbol("baseVolume") => baseVolume,
    Symbol("quoteVolume") => quoteVolume,
    Symbol("info") => ticker
), market = market)

end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://docs.bitso.com/bitso-api/docs/ticker

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTicker(self::Bitso, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("book") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetTicker(extend(request, params)));
    ticker = safeValue(response, "payload");
    return self.parseTicker(ticker, market = market)

end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchOHLCV(self::Bitso, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("book") => get(market, Symbol("id"), nothing),
        Symbol("time_bucket") => safeString(self.timeframes, timeframe, timeframe)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start")] = since;
        if functions.ccxtruthy(limit != nothing)
            duration = self.parseTimeframe(timeframe);
            request[Symbol("end")] = self.sum(since, duration * limit * 1000);
        end
    elseif functions.ccxtruthy(limit != nothing)
        now = milliseconds();
        request[Symbol("end")] = now;
        request[Symbol("start")] = now - self.parseTimeframe(timeframe) * 1000 * limit;
    end
    response = Base.fetch(self.publicGetOhlc(extend(request, params)));
    payload = self.safeList(response, "payload", defaultValue = []);
    return self.parseOHLCVs(payload, market = market, timeframe = timeframe, since = since, limit = limit)

end
function parseOHLCV(self::Bitso, ohlcv; market=nothing)
    return [safeInteger(ohlcv, "bucket_start_time"), self.safeNumber(ohlcv, "first_rate"), self.safeNumber(ohlcv, "max_rate"), self.safeNumber(ohlcv, "min_rate"), self.safeNumber(ohlcv, "last_rate"), self.safeNumber(ohlcv, "volume")]

end
function parseTrade(self::Bitso, trade; market=nothing)
    timestamp = self.parse8601(safeString(trade, "created_at"));
    marketId = safeString(trade, "book");
    symbol = self.safeSymbol(marketId, market = market, delimiter = "_");
    side = safeString(trade, "side");
    makerSide = safeString(trade, "maker_side");
    takerOrMaker = nothing;
    if functions.ccxtruthy(side != nothing)
        if functions.ccxtruthy(side == makerSide)
            takerOrMaker = "maker";
        else
            takerOrMaker = "taker";
        end
    else
        if functions.ccxtruthy(makerSide == "buy")
            side = "sell";
        else
            side = "buy";
        end
    end
    amount = safeString2(trade, "amount", "major");
    if functions.ccxtruthy(amount != nothing)
        amount = stringAbs(amount);
    end
    fee = nothing;
    feeCost = safeString(trade, "fees_amount");
    if functions.ccxtruthy(feeCost != nothing)
        feeCurrencyId = safeString(trade, "fees_currency");
        feeCurrency = self.safeCurrencyCode(feeCurrencyId);
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCost,
            Symbol("currency") => feeCurrency
        );
    end
    cost = safeString(trade, "minor");
    if functions.ccxtruthy(cost != nothing)
        cost = stringAbs(cost);
    end
    price = safeString(trade, "price");
    orderId = safeString(trade, "oid");
    id = safeString(trade, "tid");
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("info") => trade,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => symbol,
    Symbol("order") => orderId,
    Symbol("type") => nothing,
    Symbol("side") => side,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("price") => price,
    Symbol("amount") => amount,
    Symbol("cost") => cost,
    Symbol("fee") => fee
), market = market)

end
"""
get the list of most recent trades for a particular symbol
see: https://docs.bitso.com/bitso-api/docs/list-trades

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
function fetchTrades(self::Bitso, symbol; since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("book") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetTrades(extend(request, params)));
    payload = self.safeList(response, "payload", defaultValue = []);
    return self.parseTrades(payload, market = market, since = since, limit = limit)

end
"""
fetch the trading fees for multiple markets
see: https://docs.bitso.com/bitso-api/docs/list-fees

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
"""
function fetchTradingFees(self::Bitso; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetFees(params));
    payload = safeValue(response, "payload", Dict{Symbol, Any}());
    fees = safeValue(payload, "fees", []);
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(fees)))
        fee = get(fees, i + 1, nothing);
        marketId = safeString(fee, "book");
        symbol = self.safeSymbol(marketId, market = nothing, delimiter = "_");
        result[Symbol(symbol)] = Dict{Symbol, Any}(
            Symbol("info") => fee,
            Symbol("symbol") => symbol,
            Symbol("maker") => self.safeNumber(fee, "maker_fee_decimal"),
            Symbol("taker") => self.safeNumber(fee, "taker_fee_decimal"),
            Symbol("percentage") => true,
            Symbol("tierBased") => true
        );
        i += 1
    end
    return result

end
"""
fetch all trades made by the user
see: https://docs.bitso.com/bitso-api/docs/user-trades

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchMyTrades(self::Bitso; symbol=nothing, since=nothing, limit=25, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    markerInParams = (ccxt_in("marker", params));
    if functions.ccxtruthy(@functions.ccxt_and((since != nothing), !functions.ccxtruthy(markerInParams)))
        throw(ExchangeError(string(self.id, " fetchMyTrades() does not support fetching trades starting from a timestamp with the `since` argument, use the `marker` extra param to filter starting from an integer trade id")));
    end
    if functions.ccxtruthy(markerInParams)
        marker = ccxt_parseInt(get(params, Symbol("marker"), nothing));
        params = extend(params, Dict{Symbol, Any}(
    Symbol("marker") => marker
));
    end
    request = Dict{Symbol, Any}(
        Symbol("book") => get(market, Symbol("id"), nothing),
        Symbol("limit") => limit
    );
    response = Base.fetch(self.privateGetUserTrades(extend(request, params)));
    payload = self.safeList(response, "payload", defaultValue = []);
    return self.parseTrades(payload, market = market, since = since, limit = limit)

end
"""
create a trade order
see: https://docs.bitso.com/bitso-api/docs/place-an-order

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
function createOrder(self::Bitso, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("book") => get(market, Symbol("id"), nothing),
        Symbol("side") => side,
        Symbol("type") => type_var,
        Symbol("major") => self.amountToPrecision(get(market, Symbol("symbol"), nothing), amount)
    );
    if functions.ccxtruthy(type_var == "limit")
        request[Symbol("price")] = self.priceToPrecision(get(market, Symbol("symbol"), nothing), price);
    end
    response = Base.fetch(self.privatePostOrders(extend(request, params)));
    payload = self.safeDict(response, "payload", defaultValue = Dict{Symbol, Any}());
    id = safeString(payload, "oid");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("id") => id
), market = market)

end
"""
cancels an open order
see: https://docs.bitso.com/bitso-api/docs/cancel-an-order

# Arguments
- `id`::string: order id
- `symbol`::string: not used by cancelOrder ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::Bitso, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("oid") => id
    );
    response = Base.fetch(self.privateDeleteOrdersOid(extend(request, params)));
    payload = self.safeList(response, "payload", defaultValue = []);
    orderId = safeString(payload, 0);
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("id") => orderId
))

end
"""
cancel multiple orders
see: https://docs.bitso.com/bitso-api/docs/cancel-an-order

# Arguments
- `ids`::array: order ids
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrders(self::Bitso, ids; symbol=nothing, params=Dict())
    if functions.ccxtruthy(!functions.ccxtruthy(functions.ccxt_isArray(ids)))
        throw(ArgumentsRequired(string(self.id, " cancelOrders() ids argument should be an array")));
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    oids = join(ids, ",");
    request = Dict{Symbol, Any}(
        Symbol("oids") => oids
    );
    response = Base.fetch(self.privateDeleteOrders(extend(request, params)));
    payload = safeValue(response, "payload", []);
    orders = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(payload)))
        id = get(payload, i + 1, nothing);
        push!(orders, self.parseOrder(id, market = market));
        i += 1
    end
    return orders

end
"""
cancel all open orders
see: https://docs.bitso.com/bitso-api/docs/cancel-an-order

# Arguments
- `symbol`::string, optional: bitso does not support canceling orders for only a specific market
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelAllOrders(self::Bitso; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol != nothing)
        throw(NotSupported(string(self.id, " cancelAllOrders() deletes all orders for user, it does not support filtering by symbol.")));
    end
    response = Base.fetch(self.privateDeleteOrdersAll(params));
    payload = safeValue(response, "payload", []);
    canceledOrders = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(payload)))
        order = self.parseOrder(get(payload, i + 1, nothing));
        push!(canceledOrders, order);
        i += 1
    end
    return canceledOrders

end
function parseOrderStatus(self::Bitso, status)
    statuses = Dict{Symbol, Any}(
        Symbol("partial-fill") => "open",
        Symbol("partially filled") => "open",
        Symbol("queued") => "open",
        Symbol("completed") => "closed"
    );
    return safeString(statuses, status, status)

end
function parseOrder(self::Bitso, order; market=nothing)
    id = nothing;
    if functions.ccxtruthy(isa(order, AbstractString))
        id = order;
    else
        id = safeString(order, "oid");
    end
    side = safeString(order, "side");
    status = self.parseOrderStatus(safeString(order, "status"));
    marketId = safeString(order, "book");
    symbol = self.safeSymbol(marketId, market = market, delimiter = "_");
    orderType = safeString(order, "type");
    timestamp = self.parse8601(safeString(order, "created_at"));
    price = safeString(order, "price");
    amount = safeString(order, "original_amount");
    remaining = safeString(order, "unfilled_amount");
    clientOrderId = safeString(order, "client_id");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => id,
    Symbol("clientOrderId") => clientOrderId,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("symbol") => symbol,
    Symbol("type") => orderType,
    Symbol("timeInForce") => nothing,
    Symbol("postOnly") => nothing,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("triggerPrice") => nothing,
    Symbol("amount") => amount,
    Symbol("cost") => nothing,
    Symbol("remaining") => remaining,
    Symbol("filled") => nothing,
    Symbol("status") => status,
    Symbol("fee") => nothing,
    Symbol("average") => nothing,
    Symbol("trades") => nothing
), market = market)

end
"""
fetch all unfilled currently open orders
see: https://docs.bitso.com/bitso-api/docs/list-open-orders

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of  open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Bitso; symbol=nothing, since=nothing, limit=25, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    markerInParams = (ccxt_in("marker", params));
    if functions.ccxtruthy(@functions.ccxt_and((since != nothing), !functions.ccxtruthy(markerInParams)))
        throw(ExchangeError(string(self.id, " fetchOpenOrders() does not support fetching orders starting from a timestamp with the `since` argument, use the `marker` extra param to filter starting from an integer trade id")));
    end
    if functions.ccxtruthy(markerInParams)
        marker = ccxt_parseInt(get(params, Symbol("marker"), nothing));
        params = extend(params, Dict{Symbol, Any}(
    Symbol("marker") => marker
));
    end
    request = Dict{Symbol, Any}(
        Symbol("book") => get(market, Symbol("id"), nothing),
        Symbol("limit") => limit
    );
    response = Base.fetch(self.privateGetOpenOrders(extend(request, params)));
    payload = self.safeList(response, "payload", defaultValue = []);
    orders = self.parseOrders(payload, market = market, since = since, limit = limit);
    return orders

end
"""
fetches information on an order made by the user
see: https://docs.bitso.com/bitso-api/docs/look-up-orders

# Arguments
- `id`::string: the order id
- `symbol`::string: not used by bitso fetchOrder
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrder(self::Bitso, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetOrdersOid(Dict{Symbol, Any}(
        Symbol("oid") => id
    )));
    payload = safeValue(response, "payload");
    if functions.ccxtruthy(functions.ccxt_isArray(payload))
        numOrders = length(payload);
        if functions.ccxtruthy(numOrders == 1)
                return self.parseOrder(get(payload, 1, nothing))
        end
    end
    throw(OrderNotFound(string(self.id, ": The order ", id, " not found.")));

end
"""
fetch all the trades made from a single order
see: https://docs.bitso.com/bitso-api/docs/list-user-trades

# Arguments
- `id`::string: order id
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchOrderTrades(self::Bitso, id; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("oid") => id
    );
    response = Base.fetch(self.privateGetOrderTradesOid(extend(request, params)));
    payload = self.safeList(response, "payload", defaultValue = []);
    return self.parseTrades(payload, market = market)

end
"""
fetch information on a deposit
see: https://docs.bitso.com/bitso-payouts-funding/docs/fundings

# Arguments
- `id`::string: deposit id
- `code`::string: bitso does not support filtering by currency code and will ignore this argument
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDeposit(self::Bitso, id; code=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("fid") => id
    );
    response = Base.fetch(self.privateGetFundingsFid(extend(request, params)));
    transactions = safeValue(response, "payload", []);
    first_var = self.safeDict(transactions, 0, defaultValue = Dict{Symbol, Any}());
    return self.parseTransaction(first_var)

end
"""
fetch all deposits made to an account
see: https://docs.bitso.com/bitso-payouts-funding/docs/fundings

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDeposits(self::Bitso; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    response = Base.fetch(self.privateGetFundings(params));
    transactions = self.safeList(response, "payload", defaultValue = []);
    return self.parseTransactions(transactions, currency = currency, since = since, limit = limit, params = params)

end
"""
fetch the deposit address for a currency associated with this account

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
function fetchDepositAddress(self::Bitso, code; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("fund_currency") => get(currency, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateGetFundingDestination(extend(request, params)));
    payload = self.safeDict(response, "payload", defaultValue = Dict{Symbol, Any}());
    address = safeString(payload, "account_identifier");
    tag = nothing;
    if functions.ccxtruthy(findfirst("?dt=", address) !== nothing)
        parts = split(address, "?dt=");
        address = safeString(parts, 0);
        tag = safeString(parts, 1);
    end
    self.checkAddress(address = address);
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("currency") => code,
    Symbol("network") => nothing,
    Symbol("address") => address,
    Symbol("tag") => tag
)

end
"""
please use fetchDepositWithdrawFees instead
see: https://docs.bitso.com/bitso-api/docs/list-fees

# Arguments
- `codes`::any: list of unified currency codes
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure}
"""
function fetchTransactionFees(self::Bitso; codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetFees(params));
    result = Dict{Symbol, Any}();
    payload = safeValue(response, "payload", Dict{Symbol, Any}());
    depositFees = safeValue(payload, "deposit_fees", []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(depositFees)))
        depositFee = get(depositFees, i + 1, nothing);
        currencyId = safeString(depositFee, "currency");
        code = self.safeCurrencyCode(currencyId);
        if functions.ccxtruthy(@functions.ccxt_and((codes != nothing), !functions.ccxtruthy(inArray(code, codes))))
            i += 1; continue
        end
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = Dict{Symbol, Any}(
                Symbol("deposit") => self.safeNumber(depositFee, "fee"),
                Symbol("withdraw") => nothing,
                Symbol("info") => Dict{Symbol, Any}(
                    Symbol("deposit") => depositFee,
                    Symbol("withdraw") => nothing
                )
            );
        end
        i += 1
    end
    withdrawalFees = safeValue(payload, "withdrawal_fees", []);
    currencyIds = objectKeys(withdrawalFees);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(currencyIds)))
        currencyId = get(currencyIds, i + 1, nothing);
        code = self.safeCurrencyCode(currencyId);
        if functions.ccxtruthy(@functions.ccxt_and((codes != nothing), !functions.ccxtruthy(inArray(code, codes))))
            i += 1; continue
        end
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = Dict{Symbol, Any}(
                Symbol("deposit") => safeValue(safeValue(result, code), "deposit"),
                Symbol("withdraw") => self.safeNumber(withdrawalFees, currencyId),
                Symbol("info") => Dict{Symbol, Any}(
                    Symbol("deposit") => safeValue(safeValue(safeValue(result, code), "info"), "deposit"),
                    Symbol("withdraw") => self.safeNumber(withdrawalFees, currencyId)
                )
            );
        end
        i += 1
    end
    return result

end
"""
fetch deposit and withdraw fees
see: https://docs.bitso.com/bitso-api/docs/list-fees

# Arguments
- `codes`::any: list of unified currency codes
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure}
"""
function fetchDepositWithdrawFees(self::Bitso; codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetFees(params));
    payload = self.safeList(response, "payload", defaultValue = []);
    return self.parseDepositWithdrawFees(payload, codes = codes)

end
function parseDepositWithdrawFees(self::Bitso, response; codes=nothing, currencyIdKey=nothing)
    result = Dict{Symbol, Any}();
    depositResponse = safeValue(response, "deposit_fees", []);
    withdrawalResponse = safeValue(response, "withdrawal_fees", []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(depositResponse)))
        entry = get(depositResponse, i + 1, nothing);
        currencyId = safeString(entry, "currency");
        code = self.safeCurrencyCode(currencyId);
        if functions.ccxtruthy(@functions.ccxt_or((codes == nothing), (@functions.ccxt_and((code != nothing), (ccxt_in(code, codes))))))
            if functions.ccxtruthy(code != nothing)
                result[Symbol(code)] = Dict{Symbol, Any}(
                    Symbol("deposit") => Dict{Symbol, Any}(
                        Symbol("fee") => self.safeNumber(entry, "fee"),
                        Symbol("percentage") => !functions.ccxtruthy(safeValue(entry, "is_fixed"))
                    ),
                    Symbol("withdraw") => Dict{Symbol, Any}(
                        Symbol("fee") => nothing,
                        Symbol("percentage") => nothing
                    ),
                    Symbol("networks") => Dict{Symbol, Any}(),
                    Symbol("info") => entry
                );
            end
        end
        i += 1
    end
    withdrawalKeys = objectKeys(withdrawalResponse);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(withdrawalKeys)))
        currencyId = get(withdrawalKeys, i + 1, nothing);
        code = self.safeCurrencyCode(currencyId);
        if functions.ccxtruthy(@functions.ccxt_and((code != nothing), (@functions.ccxt_or((codes == nothing), (ccxt_in(code, codes))))))
            withdrawFee = self.parseNumber(get(withdrawalResponse, Symbol(currencyId), nothing));
            resultValue = safeValue(result, code);
            if functions.ccxtruthy(resultValue == nothing)
                result[Symbol(code)] = self.depositWithdrawFee(Dict{Symbol, Any}());
            end
            result[Symbol(code)][Symbol("withdraw")][Symbol("fee")] = withdrawFee;
            result[Symbol(code)][Symbol("info")][Symbol(code)] = withdrawFee;
        end
        i += 1
    end
    return result

end
"""
make a withdrawal

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function withdraw(self::Bitso, code, amount, address; tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    self.checkAddress(address = address);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    methods = Dict{Symbol, Any}(
        Symbol("BTC") => "Bitcoin",
        Symbol("ETH") => "Ether",
        Symbol("XRP") => "Ripple",
        Symbol("BCH") => "Bcash",
        Symbol("LTC") => "Litecoin"
    );
    currency = self.currency(code);
    method = functions.ccxtruthy((ccxt_in(code, methods))) ? get(methods, Symbol(code), nothing) : nothing;
    if functions.ccxtruthy(method == nothing)
        throw(ExchangeError(string(self.id, " not valid withdraw coin: ", code)));
    end
    request = Dict{Symbol, Any}(
        Symbol("amount") => amount,
        Symbol("address") => address,
        Symbol("destination_tag") => tag
    );
    classMethod = string("privatePost", method, "Withdrawal");
    response = Base.fetch(getproperty(self, Symbol(classMethod))(extend(request, params)));
    payload = safeValue(response, "payload", []);
    first_var = self.safeDict(payload, 0);
    return self.parseTransaction(first_var, currency = currency)

end
function parseTransaction(self::Bitso, transaction; currency=nothing)
    currencyId = safeString2(transaction, "currency", "asset");
    currency = self.safeCurrency(currencyId, currency = currency);
    details = safeValue(transaction, "details", Dict{Symbol, Any}());
    datetime = safeString(transaction, "created_at");
    withdrawalAddress = safeString(details, "withdrawal_address");
    receivingAddress = safeString(details, "receiving_address");
    networkId = safeString2(transaction, "network", "method");
    status = safeString(transaction, "status");
    withdrawId = safeString(transaction, "wid");
    networkCode = self.networkIdToCode(networkId = networkId, currencyCode = get(currency, Symbol("code"), nothing));
    networkCodeUpper = functions.ccxtruthy((networkCode != nothing)) ? uppercase(networkCode) : nothing;
    return Dict{Symbol, Any}(
    Symbol("id") => safeString2(transaction, "wid", "fid"),
    Symbol("txid") => safeString(details, "tx_hash"),
    Symbol("timestamp") => self.parse8601(datetime),
    Symbol("datetime") => datetime,
    Symbol("network") => networkCodeUpper,
    Symbol("addressFrom") => receivingAddress,
    Symbol("address") => functions.ccxtruthy((withdrawalAddress != nothing)) ? withdrawalAddress : receivingAddress,
    Symbol("addressTo") => withdrawalAddress,
    Symbol("amount") => self.safeNumber(transaction, "amount"),
    Symbol("type") => functions.ccxtruthy((withdrawId == nothing)) ? "deposit" : "withdrawal",
    Symbol("currency") => self.safeCurrencyCode(currencyId, currency = currency),
    Symbol("status") => self.parseTransactionStatus(status),
    Symbol("updated") => nothing,
    Symbol("tagFrom") => nothing,
    Symbol("tag") => nothing,
    Symbol("tagTo") => nothing,
    Symbol("comment") => nothing,
    Symbol("internal") => nothing,
    Symbol("fee") => nothing,
    Symbol("info") => transaction
)

end
function parseTransactionStatus(self::Bitso, status)
    statuses = Dict{Symbol, Any}(
        Symbol("pending") => "pending",
        Symbol("in_progress") => "pending",
        Symbol("complete") => "ok",
        Symbol("failed") => "failed"
    );
    return safeString(statuses, status, status)

end
function nonce(self::Bitso, )
    return milliseconds()

end
function sign(self::Bitso, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    endpoint = string("/", self.version, "/", self.implodeParams(path, params));
    query = omit(params, self.extractParams(path));
    if functions.ccxtruthy(@functions.ccxt_or(method == "GET", method == "DELETE"))
        if functions.ccxtruthy(length(objectKeys(query)))
            endpoint += string("?", self.urlencode(query));
        end
    end
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol("rest"), nothing), endpoint);
    if functions.ccxtruthy(api == "private")
        self.checkRequiredCredentials();
        nonce = string(self.nonce());
        endpoint = string("/api", endpoint);
        content = [nonce, method, endpoint];
        request = join(content, "");
        if functions.ccxtruthy(@functions.ccxt_and(method != "GET", method != "DELETE"))
            if functions.ccxtruthy(length(objectKeys(query)))
                body = json(query);
                request += body;
            end
        end
        signature = self.hmac(self.encode(request), self.encode(self.secret), sha256);
        auth = string(self.apiKey, ":", nonce, ":", signature);
        headers = Dict{Symbol, Any}(
            Symbol("Authorization") => string("Bitso ", auth)
        );
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Bitso, httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    if functions.ccxtruthy(ccxt_in("success", response))
        success = self.safeBool(response, "success", defaultValue = false);
        if functions.ccxtruthy(isa(success, AbstractString))
            if functions.ccxtruthy(@functions.ccxt_or((success == "true"), (success == "1")))
                success = true;
            else
                success = false;
            end
        end
        if functions.ccxtruthy(!functions.ccxtruthy(success))
            feedback = string(self.id, " ", json(response));
            error = safeValue(response, "error");
            if functions.ccxtruthy(error == nothing)
                throw(ExchangeError(feedback));
            end
            code = safeString(error, "code");
            self.throwExactlyMatchedException(self.exceptions, code, feedback);
            throw(ExchangeError(feedback));
        end
    end
    return nothing

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Bitso, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetAvailableBooks(self::Bitso, params=Dict(), context=Dict())
    return request(self, "available_books"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetCatalogues(self::Bitso, params=Dict(), context=Dict())
    return request(self, "catalogues"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTicker(self::Bitso, params=Dict(), context=Dict())
    return request(self, "ticker"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetOrderBook(self::Bitso, params=Dict(), context=Dict())
    return request(self, "order_book"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTrades(self::Bitso, params=Dict(), context=Dict())
    return request(self, "trades"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetOhlc(self::Bitso, params=Dict(), context=Dict())
    return request(self, "ohlc"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountStatus(self::Bitso, params=Dict(), context=Dict())
    return request(self, "account_status"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetBalance(self::Bitso, params=Dict(), context=Dict())
    return request(self, "balance"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetFees(self::Bitso, params=Dict(), context=Dict())
    return request(self, "fees"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetFundings(self::Bitso, params=Dict(), context=Dict())
    return request(self, "fundings"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetFundingsFid(self::Bitso, params=Dict(), context=Dict())
    return request(self, "fundings/{fid}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetFundingDestination(self::Bitso, params=Dict(), context=Dict())
    return request(self, "funding_destination"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetKycDocuments(self::Bitso, params=Dict(), context=Dict())
    return request(self, "kyc_documents"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetLedger(self::Bitso, params=Dict(), context=Dict())
    return request(self, "ledger"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetLedgerTrades(self::Bitso, params=Dict(), context=Dict())
    return request(self, "ledger/trades"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetLedgerFees(self::Bitso, params=Dict(), context=Dict())
    return request(self, "ledger/fees"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetLedgerFundings(self::Bitso, params=Dict(), context=Dict())
    return request(self, "ledger/fundings"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetLedgerWithdrawals(self::Bitso, params=Dict(), context=Dict())
    return request(self, "ledger/withdrawals"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetMxBankCodes(self::Bitso, params=Dict(), context=Dict())
    return request(self, "mx_bank_codes"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOpenOrders(self::Bitso, params=Dict(), context=Dict())
    return request(self, "open_orders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrderTradesOid(self::Bitso, params=Dict(), context=Dict())
    return request(self, "order_trades/{oid}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrdersOid(self::Bitso, params=Dict(), context=Dict())
    return request(self, "orders/{oid}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUserTrades(self::Bitso, params=Dict(), context=Dict())
    return request(self, "user_trades"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUserTradesTid(self::Bitso, params=Dict(), context=Dict())
    return request(self, "user_trades/{tid}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetWithdrawals(self::Bitso, params=Dict(), context=Dict())
    return request(self, "withdrawals/"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetWithdrawalsWid(self::Bitso, params=Dict(), context=Dict())
    return request(self, "withdrawals/{wid}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostBitcoinWithdrawal(self::Bitso, params=Dict(), context=Dict())
    return request(self, "bitcoin_withdrawal"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDebitCardWithdrawal(self::Bitso, params=Dict(), context=Dict())
    return request(self, "debit_card_withdrawal"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostEtherWithdrawal(self::Bitso, params=Dict(), context=Dict())
    return request(self, "ether_withdrawal"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrders(self::Bitso, params=Dict(), context=Dict())
    return request(self, "orders"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostPhoneNumber(self::Bitso, params=Dict(), context=Dict())
    return request(self, "phone_number"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostPhoneVerification(self::Bitso, params=Dict(), context=Dict())
    return request(self, "phone_verification"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostPhoneWithdrawal(self::Bitso, params=Dict(), context=Dict())
    return request(self, "phone_withdrawal"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSpeiWithdrawal(self::Bitso, params=Dict(), context=Dict())
    return request(self, "spei_withdrawal"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostRippleWithdrawal(self::Bitso, params=Dict(), context=Dict())
    return request(self, "ripple_withdrawal"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostBcashWithdrawal(self::Bitso, params=Dict(), context=Dict())
    return request(self, "bcash_withdrawal"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostLitecoinWithdrawal(self::Bitso, params=Dict(), context=Dict())
    return request(self, "litecoin_withdrawal"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteOrders(self::Bitso, params=Dict(), context=Dict())
    return request(self, "orders"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteOrdersOid(self::Bitso, params=Dict(), context=Dict())
    return request(self, "orders/{oid}"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteOrdersAll(self::Bitso, params=Dict(), context=Dict())
    return request(self, "orders/all"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function Bitso(; kwargs...)
    inst = Bitso(Exchange(), describe, fetchLedger, parseLedgerEntryType, parseLedgerEntry, fetchMarkets, fetchCurrencies, parseCurrency, parseBalance, fetchBalance, fetchOrderBook, parseTicker, fetchTicker, fetchOHLCV, parseOHLCV, parseTrade, fetchTrades, fetchTradingFees, fetchMyTrades, createOrder, cancelOrder, cancelOrders, cancelAllOrders, parseOrderStatus, parseOrder, fetchOpenOrders, fetchOrder, fetchOrderTrades, fetchDeposit, fetchDeposits, fetchDepositAddress, fetchTransactionFees, fetchDepositWithdrawFees, parseDepositWithdrawFees, withdraw, parseTransaction, parseTransactionStatus, nonce, sign, handleErrors, publicGetAvailableBooks, publicGetCatalogues, publicGetTicker, publicGetOrderBook, publicGetTrades, publicGetOhlc, privateGetAccountStatus, privateGetBalance, privateGetFees, privateGetFundings, privateGetFundingsFid, privateGetFundingDestination, privateGetKycDocuments, privateGetLedger, privateGetLedgerTrades, privateGetLedgerFees, privateGetLedgerFundings, privateGetLedgerWithdrawals, privateGetMxBankCodes, privateGetOpenOrders, privateGetOrderTradesOid, privateGetOrdersOid, privateGetUserTrades, privateGetUserTradesTid, privateGetWithdrawals, privateGetWithdrawalsWid, privatePostBitcoinWithdrawal, privatePostDebitCardWithdrawal, privatePostEtherWithdrawal, privatePostOrders, privatePostPhoneNumber, privatePostPhoneVerification, privatePostPhoneWithdrawal, privatePostSpeiWithdrawal, privatePostRippleWithdrawal, privatePostBcashWithdrawal, privatePostLitecoinWithdrawal, privateDeleteOrders, privateDeleteOrdersOid, privateDeleteOrdersAll)
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
function __ccxt_doc_Bitso_fetchLedger() end
"""
fetch the history of changes, actions done by the user or operations that altered the balance of the user

# Arguments
- `code`::string, optional: unified currency code, default is undefined
- `since`::int, optional: timestamp in ms of the earliest ledger entry, default is undefined
- `limit`::int, optional: max number of ledger entries to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
"""
__ccxt_doc_Bitso_fetchLedger

function __ccxt_doc_Bitso_fetchMarkets() end
"""
retrieves data on all markets for bitso
see: https://docs.bitso.com/bitso-api/docs/list-available-books

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Bitso_fetchMarkets

function __ccxt_doc_Bitso_fetchCurrencies() end
"""
fetches all available currencies on an exchange
see: https://docs.bitso.com/bitso-payouts-funding/docs

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
__ccxt_doc_Bitso_fetchCurrencies

function __ccxt_doc_Bitso_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://docs.bitso.com/bitso-api/docs/get-account-balance

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Bitso_fetchBalance

function __ccxt_doc_Bitso_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://docs.bitso.com/bitso-api/docs/list-order-book

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Bitso_fetchOrderBook

function __ccxt_doc_Bitso_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://docs.bitso.com/bitso-api/docs/ticker

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Bitso_fetchTicker

function __ccxt_doc_Bitso_fetchOHLCV() end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Bitso_fetchOHLCV

function __ccxt_doc_Bitso_fetchTrades() end
"""
get the list of most recent trades for a particular symbol
see: https://docs.bitso.com/bitso-api/docs/list-trades

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
__ccxt_doc_Bitso_fetchTrades

function __ccxt_doc_Bitso_fetchTradingFees() end
"""
fetch the trading fees for multiple markets
see: https://docs.bitso.com/bitso-api/docs/list-fees

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
"""
__ccxt_doc_Bitso_fetchTradingFees

function __ccxt_doc_Bitso_fetchMyTrades() end
"""
fetch all trades made by the user
see: https://docs.bitso.com/bitso-api/docs/user-trades

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Bitso_fetchMyTrades

function __ccxt_doc_Bitso_createOrder() end
"""
create a trade order
see: https://docs.bitso.com/bitso-api/docs/place-an-order

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
__ccxt_doc_Bitso_createOrder

function __ccxt_doc_Bitso_cancelOrder() end
"""
cancels an open order
see: https://docs.bitso.com/bitso-api/docs/cancel-an-order

# Arguments
- `id`::string: order id
- `symbol`::string: not used by cancelOrder ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bitso_cancelOrder

function __ccxt_doc_Bitso_cancelOrders() end
"""
cancel multiple orders
see: https://docs.bitso.com/bitso-api/docs/cancel-an-order

# Arguments
- `ids`::array: order ids
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bitso_cancelOrders

function __ccxt_doc_Bitso_cancelAllOrders() end
"""
cancel all open orders
see: https://docs.bitso.com/bitso-api/docs/cancel-an-order

# Arguments
- `symbol`::string, optional: bitso does not support canceling orders for only a specific market
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bitso_cancelAllOrders

function __ccxt_doc_Bitso_fetchOpenOrders() end
"""
fetch all unfilled currently open orders
see: https://docs.bitso.com/bitso-api/docs/list-open-orders

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of  open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bitso_fetchOpenOrders

function __ccxt_doc_Bitso_fetchOrder() end
"""
fetches information on an order made by the user
see: https://docs.bitso.com/bitso-api/docs/look-up-orders

# Arguments
- `id`::string: the order id
- `symbol`::string: not used by bitso fetchOrder
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bitso_fetchOrder

function __ccxt_doc_Bitso_fetchOrderTrades() end
"""
fetch all the trades made from a single order
see: https://docs.bitso.com/bitso-api/docs/list-user-trades

# Arguments
- `id`::string: order id
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Bitso_fetchOrderTrades

function __ccxt_doc_Bitso_fetchDeposit() end
"""
fetch information on a deposit
see: https://docs.bitso.com/bitso-payouts-funding/docs/fundings

# Arguments
- `id`::string: deposit id
- `code`::string: bitso does not support filtering by currency code and will ignore this argument
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Bitso_fetchDeposit

function __ccxt_doc_Bitso_fetchDeposits() end
"""
fetch all deposits made to an account
see: https://docs.bitso.com/bitso-payouts-funding/docs/fundings

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Bitso_fetchDeposits

function __ccxt_doc_Bitso_fetchDepositAddress() end
"""
fetch the deposit address for a currency associated with this account

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
__ccxt_doc_Bitso_fetchDepositAddress

function __ccxt_doc_Bitso_fetchTransactionFees() end
"""
please use fetchDepositWithdrawFees instead
see: https://docs.bitso.com/bitso-api/docs/list-fees

# Arguments
- `codes`::any: list of unified currency codes
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure}
"""
__ccxt_doc_Bitso_fetchTransactionFees

function __ccxt_doc_Bitso_fetchDepositWithdrawFees() end
"""
fetch deposit and withdraw fees
see: https://docs.bitso.com/bitso-api/docs/list-fees

# Arguments
- `codes`::any: list of unified currency codes
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure}
"""
__ccxt_doc_Bitso_fetchDepositWithdrawFees

function __ccxt_doc_Bitso_withdraw() end
"""
make a withdrawal

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Bitso_withdraw
