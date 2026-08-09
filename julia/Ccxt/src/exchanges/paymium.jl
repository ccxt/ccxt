@kwdef mutable struct Paymium <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    parseBalance::Function = parseBalance
    fetchBalance::Function = fetchBalance
    fetchOrderBook::Function = fetchOrderBook
    parseTicker::Function = parseTicker
    fetchTicker::Function = fetchTicker
    parseTrade::Function = parseTrade
    fetchTrades::Function = fetchTrades
    createDepositAddress::Function = createDepositAddress
    fetchDepositAddress::Function = fetchDepositAddress
    fetchDepositAddresses::Function = fetchDepositAddresses
    parseDepositAddress::Function = parseDepositAddress
    createOrder::Function = createOrder
    cancelOrder::Function = cancelOrder
    transfer::Function = transfer
    parseTransfer::Function = parseTransfer
    parseTransferStatus::Function = parseTransferStatus
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    publicGetCountries::Function = publicGetCountries
    publicGetCurrencies::Function = publicGetCurrencies
    publicGetDataCurrencyTicker::Function = publicGetDataCurrencyTicker
    publicGetDataCurrencyTrades::Function = publicGetDataCurrencyTrades
    publicGetDataCurrencyDepth::Function = publicGetDataCurrencyDepth
    publicGetBitcoinChartsIdTrades::Function = publicGetBitcoinChartsIdTrades
    publicGetBitcoinChartsIdDepth::Function = publicGetBitcoinChartsIdDepth
    privateGetUser::Function = privateGetUser
    privateGetUserAddresses::Function = privateGetUserAddresses
    privateGetUserAddressesAddress::Function = privateGetUserAddressesAddress
    privateGetUserOrders::Function = privateGetUserOrders
    privateGetUserOrdersUuid::Function = privateGetUserOrdersUuid
    privateGetUserPriceAlerts::Function = privateGetUserPriceAlerts
    privateGetMerchantGetPaymentUuid::Function = privateGetMerchantGetPaymentUuid
    privatePostUserAddresses::Function = privatePostUserAddresses
    privatePostUserOrders::Function = privatePostUserOrders
    privatePostUserWithdrawals::Function = privatePostUserWithdrawals
    privatePostUserEmailTransfers::Function = privatePostUserEmailTransfers
    privatePostUserPaymentRequests::Function = privatePostUserPaymentRequests
    privatePostUserPriceAlerts::Function = privatePostUserPriceAlerts
    privatePostMerchantCreatePayment::Function = privatePostMerchantCreatePayment
    privateDeleteUserOrdersUuid::Function = privateDeleteUserOrdersUuid
    privateDeleteUserOrdersUuidCancel::Function = privateDeleteUserOrdersUuidCancel
    privateDeleteUserPriceAlertsId::Function = privateDeleteUserPriceAlertsId

end
function describe(self::Paymium, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "paymium",
    Symbol("name") => "Paymium",
    Symbol("countries") => ["FR", "EU"],
    Symbol("rateLimit") => 2000,
    Symbol("version") => "v1",
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => true,
        Symbol("spot") => true,
        Symbol("margin") => nothing,
        Symbol("swap") => false,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("cancelOrder") => true,
        Symbol("createDepositAddress") => true,
        Symbol("createOrder") => true,
        Symbol("fetchBalance") => true,
        Symbol("fetchDepositAddress") => true,
        Symbol("fetchDepositAddresses") => true,
        Symbol("fetchDepositAddressesByNetwork") => false,
        Symbol("fetchFundingHistory") => false,
        Symbol("fetchFundingRate") => false,
        Symbol("fetchFundingRateHistory") => false,
        Symbol("fetchFundingRates") => false,
        Symbol("fetchIndexOHLCV") => false,
        Symbol("fetchMarkOHLCV") => false,
        Symbol("fetchOpenInterestHistory") => false,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchTicker") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => false,
        Symbol("fetchTradingFees") => false,
        Symbol("transfer") => true
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://user-images.githubusercontent.com/51840849/87153930-f0f02200-c2c0-11ea-9c0a-40337375ae89.jpg",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("rest") => "https://paymium.com/api"
        ),
        Symbol("www") => "https://www.paymium.com",
        Symbol("fees") => "https://www.paymium.com/page/help/fees",
        Symbol("doc") => ["https://github.com/Paymium/api-documentation", "https://www.paymium.com/page/developers", "https://paymium.github.io/api-documentation/"],
        Symbol("referral") => "https://www.paymium.com/page/sign-up?referral=eDAzPoRQFMvaAB8sf-qj"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => ["countries", "currencies", "data/{currency}/ticker", "data/{currency}/trades", "data/{currency}/depth", "bitcoin_charts/{id}/trades", "bitcoin_charts/{id}/depth"]
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => ["user", "user/addresses", "user/addresses/{address}", "user/orders", "user/orders/{uuid}", "user/price_alerts", "merchant/get_payment/{uuid}"],
            Symbol("post") => ["user/addresses", "user/orders", "user/withdrawals", "user/email_transfers", "user/payment_requests", "user/price_alerts", "merchant/create_payment"],
            Symbol("delete") => ["user/orders/{uuid}", "user/orders/{uuid}/cancel", "user/price_alerts/{id}"]
        )
    ),
    Symbol("markets") => Dict{Symbol, Any}(
        Symbol("BTC/EUR") => self.safeMarketStructure(Dict{Symbol, Any}(
    Symbol("id") => "eur",
    Symbol("symbol") => "BTC/EUR",
    Symbol("base") => "BTC",
    Symbol("quote") => "EUR",
    Symbol("baseId") => "btc",
    Symbol("quoteId") => "eur",
    Symbol("type") => "spot",
    Symbol("spot") => true
))
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("maker") => self.parseNumber("-0.001"),
            Symbol("taker") => self.parseNumber("0.005")
        )
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("sandbox") => false,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("triggerPrice") => false,
                Symbol("triggerDirection") => false,
                Symbol("triggerPriceType") => nothing,
                Symbol("stopLossPrice") => false,
                Symbol("takeProfitPrice") => false,
                Symbol("attachedStopLossTakeProfit") => nothing,
                Symbol("timeInForce") => Dict{Symbol, Any}(
                    Symbol("IOC") => false,
                    Symbol("FOK") => false,
                    Symbol("PO") => false,
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
            Symbol("fetchMyTrades") => nothing,
            Symbol("fetchOrder") => nothing,
            Symbol("fetchOpenOrders") => nothing,
            Symbol("fetchOrders") => nothing,
            Symbol("fetchClosedOrders") => nothing,
            Symbol("fetchOHLCV") => nothing
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
function parseBalance(self::Paymium, response)
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    currencies = objectKeys(self.currencies);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(currencies)))
        code = get(currencies, i + 1, nothing);
        currency = self.currency(code);
        currencyId = get(currency, Symbol("id"), nothing);
        free = string("balance_", currencyId);
        if functions.ccxtruthy(ccxt_in(free, response))
            account = self.account();
            used = string("locked_", currencyId);
            account[Symbol("free")] = safeString(response, free);
            account[Symbol("used")] = safeString(response, used);
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
function fetchBalance(self::Paymium, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetUser(params));
    return self.parseBalance(response)

end
function fetchOrderBook(self::Paymium, symbol, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetDataCurrencyDepth(extend(request, params)));
    return self.parseOrderBook(response, get(market, Symbol("symbol"), nothing), nothing, "bids", "asks", "price", "amount")

end
function parseTicker(self::Paymium, ticker, market=nothing)
    symbol = self.safeSymbol(nothing, market);
    timestamp = safeTimestamp(ticker, "at");
    vwap = safeString(ticker, "vwap");
    baseVolume = safeString(ticker, "volume");
    quoteVolume = stringMul(baseVolume, vwap);
    last_var = safeString(ticker, "price");
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
    Symbol("open") => safeString(ticker, "open"),
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => safeString(ticker, "variation"),
    Symbol("average") => nothing,
    Symbol("baseVolume") => baseVolume,
    Symbol("quoteVolume") => quoteVolume,
    Symbol("info") => ticker
), market)

end
function fetchTicker(self::Paymium, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(market, Symbol("id"), nothing)
    );
    ticker = Base.fetch(self.publicGetDataCurrencyTicker(extend(request, params)));
    return self.parseTicker(ticker, market)

end
function parseTrade(self::Paymium, trade, market=nothing)
    timestamp = safeTimestamp(trade, "created_at_int");
    id = safeString(trade, "uuid");
    market = self.safeMarket(nothing, market);
    side = safeString(trade, "side");
    price = safeString(trade, "price");
    amountField = string("traded_", lowercase(get(market, Symbol("base"), nothing)));
    amount = safeString(trade, amountField);
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("id") => id,
    Symbol("order") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("type") => nothing,
    Symbol("side") => side,
    Symbol("takerOrMaker") => nothing,
    Symbol("price") => price,
    Symbol("amount") => amount,
    Symbol("cost") => nothing,
    Symbol("fee") => nothing
), market)

end
function fetchTrades(self::Paymium, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetDataCurrencyTrades(extend(request, params)));
    return self.parseTrades(response, market, since, limit)

end
function createDepositAddress(self::Paymium, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privatePostUserAddresses(params));
    return self.parseDepositAddress(response)

end
function fetchDepositAddress(self::Paymium, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("address") => code
    );
    response = Base.fetch(self.privateGetUserAddressesAddress(extend(request, params)));
    return self.parseDepositAddress(response)

end
function fetchDepositAddresses(self::Paymium, codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetUserAddresses(params));
    return self.parseDepositAddresses(response, codes)

end
function parseDepositAddress(self::Paymium, depositAddress, currency=nothing)
    address = safeString(depositAddress, "address");
    currencyId = safeString(depositAddress, "currency");
    return Dict{Symbol, Any}(
    Symbol("info") => depositAddress,
    Symbol("currency") => self.safeCurrencyCode(currencyId, currency),
    Symbol("network") => nothing,
    Symbol("address") => address,
    Symbol("tag") => nothing
)

end
function createOrder(self::Paymium, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("type") => string(capitalize(type_var), "Order"),
        Symbol("currency") => get(market, Symbol("id"), nothing),
        Symbol("direction") => side,
        Symbol("amount") => amount
    );
    if functions.ccxtruthy(type_var != "market")
        request[Symbol("price")] = price;
    end
    response = Base.fetch(self.privatePostUserOrders(extend(request, params)));
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("id") => get(response, Symbol("uuid"), nothing)
), market)

end
function cancelOrder(self::Paymium, id, symbol=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("uuid") => id
    );
    response = Base.fetch(self.privateDeleteUserOrdersUuidCancel(extend(request, params)));
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response
))

end
function transfer(self::Paymium, code, amount, fromAccount, toAccount, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    if functions.ccxtruthy(findfirst("@", toAccount) === nothing)
        throw(ExchangeError(string(self.id, " transfer() only allows transfers to an email address")));
    end
    if functions.ccxtruthy(@functions.ccxt_and(code != "BTC", code != "EUR"))
        throw(ExchangeError(string(self.id, " transfer() only allows BTC or EUR")));
    end
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => self.currencyToPrecision(code, amount),
        Symbol("email") => toAccount
    );
    response = Base.fetch(self.privatePostUserEmailTransfers(extend(request, params)));
    return self.parseTransfer(response, currency)

end
function parseTransfer(self::Paymium, transfer, currency=nothing)
    currencyId = safeString(transfer, "currency");
    updatedAt = safeString(transfer, "updated_at");
    timetstamp = self.parseDate(updatedAt);
    accountOperations = safeValue(transfer, "account_operations");
    firstOperation = safeValue(accountOperations, 0, Dict{Symbol, Any}());
    status = safeString(transfer, "state");
    return Dict{Symbol, Any}(
    Symbol("info") => transfer,
    Symbol("id") => safeString(transfer, "uuid"),
    Symbol("timestamp") => timetstamp,
    Symbol("datetime") => self.iso8601(timetstamp),
    Symbol("currency") => self.safeCurrencyCode(currencyId, currency),
    Symbol("amount") => self.safeNumber(transfer, "amount"),
    Symbol("fromAccount") => nothing,
    Symbol("toAccount") => safeString(firstOperation, "address"),
    Symbol("status") => self.parseTransferStatus(status)
)

end
function parseTransferStatus(self::Paymium, status)
    statuses = Dict{Symbol, Any}(
        Symbol("executed") => "ok"
    );
    return safeString(statuses, status, status)

end
function sign(self::Paymium, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol("rest"), nothing), "/", self.version, "/", self.implodeParams(path, params));
    query = omit(params, self.extractParams(path));
    if functions.ccxtruthy(api == "public")
        if functions.ccxtruthy(length(objectKeys(query)))
            url += string("?", self.urlencode(query));
        end
    else
        self.checkRequiredCredentials();
        nonce = string(self.nonce());
        auth = string(nonce, url);
        headers = Dict{Symbol, Any}(
            Symbol("Api-Key") => self.apiKey,
            Symbol("Api-Nonce") => nonce
        );
        if functions.ccxtruthy(method == "POST")
            if functions.ccxtruthy(length(objectKeys(query)))
                body = json(query);
                auth += body;
                headers[Symbol("Content-Type")] = "application/json";
            end
        else
            if functions.ccxtruthy(length(objectKeys(query)))
                queryString = self.urlencode(query);
                auth += queryString;
                url += string("?", queryString);
            end
        end
        headers[Symbol("Api-Signature")] = self.hmac(self.encode(auth), self.encode(self.secret), sha256);
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Paymium, httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    errors = safeValue(response, "errors");
    if functions.ccxtruthy(errors != nothing)
        throw(ExchangeError(string(self.id, " ", json(response))));
    end
    return nothing

end

# Property resolution is shared by every generated exchange; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Paymium, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetCountries(self::Paymium, params=Dict(), context=Dict())
    return request(self, "countries", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetCurrencies(self::Paymium, params=Dict(), context=Dict())
    return request(self, "currencies", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetDataCurrencyTicker(self::Paymium, params=Dict(), context=Dict())
    return request(self, "data/{currency}/ticker", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetDataCurrencyTrades(self::Paymium, params=Dict(), context=Dict())
    return request(self, "data/{currency}/trades", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetDataCurrencyDepth(self::Paymium, params=Dict(), context=Dict())
    return request(self, "data/{currency}/depth", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetBitcoinChartsIdTrades(self::Paymium, params=Dict(), context=Dict())
    return request(self, "bitcoin_charts/{id}/trades", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetBitcoinChartsIdDepth(self::Paymium, params=Dict(), context=Dict())
    return request(self, "bitcoin_charts/{id}/depth", "public", "GET", params, nothing, nothing, Dict())
end

function privateGetUser(self::Paymium, params=Dict(), context=Dict())
    return request(self, "user", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetUserAddresses(self::Paymium, params=Dict(), context=Dict())
    return request(self, "user/addresses", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetUserAddressesAddress(self::Paymium, params=Dict(), context=Dict())
    return request(self, "user/addresses/{address}", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetUserOrders(self::Paymium, params=Dict(), context=Dict())
    return request(self, "user/orders", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetUserOrdersUuid(self::Paymium, params=Dict(), context=Dict())
    return request(self, "user/orders/{uuid}", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetUserPriceAlerts(self::Paymium, params=Dict(), context=Dict())
    return request(self, "user/price_alerts", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetMerchantGetPaymentUuid(self::Paymium, params=Dict(), context=Dict())
    return request(self, "merchant/get_payment/{uuid}", "private", "GET", params, nothing, nothing, Dict())
end

function privatePostUserAddresses(self::Paymium, params=Dict(), context=Dict())
    return request(self, "user/addresses", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostUserOrders(self::Paymium, params=Dict(), context=Dict())
    return request(self, "user/orders", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostUserWithdrawals(self::Paymium, params=Dict(), context=Dict())
    return request(self, "user/withdrawals", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostUserEmailTransfers(self::Paymium, params=Dict(), context=Dict())
    return request(self, "user/email_transfers", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostUserPaymentRequests(self::Paymium, params=Dict(), context=Dict())
    return request(self, "user/payment_requests", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostUserPriceAlerts(self::Paymium, params=Dict(), context=Dict())
    return request(self, "user/price_alerts", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostMerchantCreatePayment(self::Paymium, params=Dict(), context=Dict())
    return request(self, "merchant/create_payment", "private", "POST", params, nothing, nothing, Dict())
end

function privateDeleteUserOrdersUuid(self::Paymium, params=Dict(), context=Dict())
    return request(self, "user/orders/{uuid}", "private", "DELETE", params, nothing, nothing, Dict())
end

function privateDeleteUserOrdersUuidCancel(self::Paymium, params=Dict(), context=Dict())
    return request(self, "user/orders/{uuid}/cancel", "private", "DELETE", params, nothing, nothing, Dict())
end

function privateDeleteUserPriceAlertsId(self::Paymium, params=Dict(), context=Dict())
    return request(self, "user/price_alerts/{id}", "private", "DELETE", params, nothing, nothing, Dict())
end

function Paymium(; kwargs...)
    inst = Paymium(Exchange(), describe, parseBalance, fetchBalance, fetchOrderBook, parseTicker, fetchTicker, parseTrade, fetchTrades, createDepositAddress, fetchDepositAddress, fetchDepositAddresses, parseDepositAddress, createOrder, cancelOrder, transfer, parseTransfer, parseTransferStatus, sign, handleErrors, publicGetCountries, publicGetCurrencies, publicGetDataCurrencyTicker, publicGetDataCurrencyTrades, publicGetDataCurrencyDepth, publicGetBitcoinChartsIdTrades, publicGetBitcoinChartsIdDepth, privateGetUser, privateGetUserAddresses, privateGetUserAddressesAddress, privateGetUserOrders, privateGetUserOrdersUuid, privateGetUserPriceAlerts, privateGetMerchantGetPaymentUuid, privatePostUserAddresses, privatePostUserOrders, privatePostUserWithdrawals, privatePostUserEmailTransfers, privatePostUserPaymentRequests, privatePostUserPriceAlerts, privatePostMerchantCreatePayment, privateDeleteUserOrdersUuid, privateDeleteUserOrdersUuidCancel, privateDeleteUserPriceAlertsId)
    desc = inst.describe()
    for (k, v) in desc
        inst[Symbol(k)] = v
    end
    return inst
end
