using Test
using Ccxt
function logTemplate(self, exchange, method, entry)

    id = functions.ccxtruthy((exchange != nothing)) ? get(exchange, Symbol("id"), nothing) : "undefined";
    methodString = functions.ccxtruthy((method != nothing)) ? method : "undefined";
    entryString = functions.ccxtruthy((@functions.ccxt_and(exchange != nothing, entry != nothing))) ? json(exchange, entry) : "";
    return string(" <<< ", id, " ", methodString, " ::: ", entryString, " >>> ")
end


function isTemporaryFailure(self, e)

    return @functions.ccxt_and((isa(e, OperationFailed)), (!functions.ccxtruthy((isa(e, OnMaintenance)))))
end


function stringValue(self, value)

    stringVal = nothing;
    if functions.ccxtruthy(isa(value, AbstractString))
        stringVal = value;
    elseif functions.ccxtruthy(value == nothing)
        stringVal = "undefined";
    else
        stringVal = string(value);
    end
    return stringVal
end


function assertType(self, exchange, skippedProperties, entry, key, format)

    if functions.ccxtruthy(ccxt_in(key, skippedProperties))
            return nothing
    end
    entryKeyVal = safeValue(exchange, entry, key);
    formatKeyVal = safeValue(exchange, format, key);
    same_string = @functions.ccxt_and((isa(entryKeyVal, AbstractString)), (isa(formatKeyVal, AbstractString)));
    same_numeric = @functions.ccxt_and((isa(entryKeyVal, Number)), (isa(formatKeyVal, Number)));
    same_boolean = @functions.ccxt_and((@functions.ccxt_or((entryKeyVal), (entryKeyVal == false))), (@functions.ccxt_or((formatKeyVal), (formatKeyVal == false))));
    same_array = @functions.ccxt_and(functions.ccxt_isArray(entryKeyVal), functions.ccxt_isArray(formatKeyVal));
    same_object = @functions.ccxt_and(isDictionary(exchange, entryKeyVal), isDictionary(exchange, formatKeyVal));
    result = @functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or((entryKeyVal == nothing), same_string), same_numeric), same_boolean), same_array), same_object);
    return functions.ccxtruthy(result)
end


function assertStructure(self, exchange, skippedProperties, method, entry, format, emptyAllowedFor=nothing, deep=false)

    logText = logTemplate(nothing, exchange, method, entry);
    @test entry != nothing
    allowEmptySkips = safeList(exchange, skippedProperties, "allowNull", []);
    if functions.ccxtruthy(emptyAllowedFor != nothing)
        emptyAllowedFor = concat(nothing, emptyAllowedFor, allowEmptySkips);
    end
    if functions.ccxtruthy(functions.ccxt_isArray(format))
        @test functions.ccxtruthy(functions.ccxt_isArray(entry))
        realLength = length(entry);
        expectedLength = length(format);
        @test realLength == expectedLength
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(format)))
            emptyAllowedForThisKey = @functions.ccxt_or((emptyAllowedFor == nothing), inArray(exchange, i, emptyAllowedFor));
            value = get(entry, i + 1, nothing);
            if functions.ccxtruthy(ccxt_in(i, skippedProperties))
                i += 1; continue
            end
            if functions.ccxtruthy(@functions.ccxt_and(emptyAllowedForThisKey, (value == nothing)))
                i += 1; continue
            end
            @test value != nothing
            typeAssertion = assertType(nothing, exchange, skippedProperties, entry, i, format);
            @test functions.ccxtruthy(typeAssertion)
            i += 1
        end

    else
        @test functions.ccxtruthy(isDictionary(exchange, entry))
        keys_var = objectKeys(format);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
            key = get(keys_var, i + 1, nothing);
            if functions.ccxtruthy(ccxt_in(key, skippedProperties))
                i += 1; continue
            end
            @test functions.ccxtruthy(ccxt_in(key, entry))
            if functions.ccxtruthy(ccxt_in(key, skippedProperties))
                i += 1; continue
            end
            emptyAllowedForThisKey = @functions.ccxt_or((emptyAllowedFor == nothing), inArray(exchange, key, emptyAllowedFor));
            value = get(entry, Symbol(key), nothing);
            if functions.ccxtruthy(@functions.ccxt_and(emptyAllowedForThisKey, (value == nothing)))
                i += 1; continue
            end
            @test value != nothing
            if functions.ccxtruthy(key != "info")
                typeAssertion = assertType(nothing, exchange, skippedProperties, entry, key, format);
                @test functions.ccxtruthy(typeAssertion)
                if functions.ccxtruthy(deep)
                    if functions.ccxtruthy(@functions.ccxt_or(isDictionary(exchange, value), functions.ccxt_isArray(value)))
                        assertStructure(nothing, exchange, skippedProperties, method, value, get(format, Symbol(key), nothing), emptyAllowedFor, deep);
                    end
                end
            end
            i += 1
        end
    end
end


function assertTimestamp(self, exchange, skippedProperties, method, entry, nowToCheck=nothing, keyNameOrIndex="timestamp", allowNull=true)

    logText = logTemplate(nothing, exchange, method, entry);
    skipValue = safeValue(exchange, skippedProperties, keyNameOrIndex);
    if functions.ccxtruthy(skipValue != nothing)
            return 
    end
    isDateTimeObject = isa(keyNameOrIndex, AbstractString);
    if functions.ccxtruthy(isDateTimeObject)
        @test functions.ccxtruthy((ccxt_in(keyNameOrIndex, entry)))
    else
        @test !functions.ccxtruthy((get(entry, keyNameOrIndex + 1, nothing) == nothing))
    end
    ts = get(entry, Symbol(keyNameOrIndex), nothing);
    @test functions.ccxtruthy(@functions.ccxt_or(ts != nothing, allowNull))
    if functions.ccxtruthy(ts != nothing)
        @test functions.ccxtruthy(isa(ts, Number))
        @test functions.ccxtruthy(isinteger(ts))
        minTs = 1230940800000;
        maxTs = 2147483648000;
        @test functions.ccxtruthy(functions.ccxt_gt(ts, minTs))
        @test functions.ccxtruthy(functions.ccxt_lt(ts, maxTs))
        if functions.ccxtruthy(nowToCheck != nothing)
            maxMsOffset = 60000;
            @test functions.ccxtruthy(functions.ccxt_lt(ts, nowToCheck + maxMsOffset))
        end
    end
end


function assertTimestampAndDatetime(self, exchange, skippedProperties, method, entry, nowToCheck=nothing, keyNameOrIndex="timestamp", allowNull=true)

    logText = logTemplate(nothing, exchange, method, entry);
    skipValue = safeValue(exchange, skippedProperties, keyNameOrIndex);
    if functions.ccxtruthy(skipValue != nothing)
            return 
    end
    assertTimestamp(nothing, exchange, skippedProperties, method, entry, nowToCheck, keyNameOrIndex);
    isDateTimeObject = isa(keyNameOrIndex, AbstractString);
    if functions.ccxtruthy(isDateTimeObject)
        @test functions.ccxtruthy((ccxt_in("datetime", entry)))
        dt = get(entry, Symbol("datetime"), nothing);
        @test functions.ccxtruthy(@functions.ccxt_or(dt != nothing, allowNull))
        if functions.ccxtruthy(dt != nothing)
            @test functions.ccxtruthy(isa(dt, AbstractString))
            dtParsed = parse8601(exchange, dt);
            tsMs = get(entry, Symbol("timestamp"), nothing);
            diff_var = abs(dtParsed - tsMs);
            if functions.ccxtruthy(functions.ccxt_ge(diff_var, 500))
                dtParsedString = iso8601(exchange, dtParsed);
                dtEntryString = iso8601(exchange, tsMs);
                @test false
            end
        end
    end
end


function assertCurrencyCode(self, exchange, skippedProperties, method, entry, actualCode, expectedCode=nothing, allowNull=true)

    if functions.ccxtruthy(@functions.ccxt_or((ccxt_in("currency", skippedProperties)), (ccxt_in("currencyIdAndCode", skippedProperties))))
            return 
    end
    logText = logTemplate(nothing, exchange, method, entry);
    @test functions.ccxtruthy(@functions.ccxt_or(actualCode != nothing, allowNull))
    if functions.ccxtruthy(actualCode != nothing)
        @test functions.ccxtruthy(isa(actualCode, AbstractString))
        @test functions.ccxtruthy((ccxt_in(actualCode, get(exchange, Symbol("currencies"), nothing))))
        if functions.ccxtruthy(expectedCode != nothing)
            @test actualCode == expectedCode
        end
    end
end


function assertValidCurrencyIdAndCode(self, exchange, skippedProperties, method, entry, currencyId, currencyCode, allowNull=true)

    if functions.ccxtruthy(@functions.ccxt_or((ccxt_in("currency", skippedProperties)), (ccxt_in("currencyIdAndCode", skippedProperties))))
            return 
    end
    logText = logTemplate(nothing, exchange, method, entry);
    undefinedValues = @functions.ccxt_and(currencyId == nothing, currencyCode == nothing);
    definedValues = @functions.ccxt_and(currencyId != nothing, currencyCode != nothing);
    @test functions.ccxtruthy(@functions.ccxt_or(undefinedValues, definedValues))
    @test functions.ccxtruthy(@functions.ccxt_or(definedValues, allowNull))
    if functions.ccxtruthy(definedValues)
        currencyByCode = currency(exchange, currencyCode);
        @test get(currencyByCode, Symbol("id"), nothing) == currencyId
        currencyById = safeCurrency(exchange, currencyId);
        @test get(currencyById, Symbol("code"), nothing) == currencyCode
    end
end


function assertSymbol(self, exchange, skippedProperties, method, entry, key, expectedSymbol=nothing, allowNull=true)

    if functions.ccxtruthy(ccxt_in(key, skippedProperties))
            return 
    end
    logText = logTemplate(nothing, exchange, method, entry);
    actualSymbol = safeString(exchange, entry, key);
    if functions.ccxtruthy(actualSymbol != nothing)
        @test functions.ccxtruthy(isa(actualSymbol, AbstractString))
    end
    if functions.ccxtruthy(expectedSymbol != nothing)
        @test actualSymbol == expectedSymbol
    end
    definedValues = @functions.ccxt_and(actualSymbol != nothing, expectedSymbol != nothing);
    @test functions.ccxtruthy(@functions.ccxt_or(definedValues, allowNull))
end


function assertSymbolInMarkets(self, exchange, skippedProperties, method, symbol)

    logText = logTemplate(nothing, exchange, method, Dict{Symbol, Any}());
    @test functions.ccxtruthy((ccxt_in(symbol, get(exchange, Symbol("markets"), nothing))))
end


function assertGreater(self, exchange, skippedProperties, method, entry, key, compareTo, allowNull=true)

    if functions.ccxtruthy(ccxt_in(key, skippedProperties))
            return 
    end
    logText = logTemplate(nothing, exchange, method, entry);
    value = safeString(exchange, entry, key);
    @test functions.ccxtruthy(@functions.ccxt_or(value != nothing, allowNull))
    if functions.ccxtruthy(value != nothing)
        @test functions.ccxtruthy(stringGt(value, compareTo))
    end
end


function assertGreaterOrEqual(self, exchange, skippedProperties, method, entry, key, compareTo, allowNull=true)

    if functions.ccxtruthy(ccxt_in(key, skippedProperties))
            return 
    end
    logText = logTemplate(nothing, exchange, method, entry);
    value = safeString(exchange, entry, key);
    @test functions.ccxtruthy(@functions.ccxt_or(value != nothing, allowNull))
    if functions.ccxtruthy(@functions.ccxt_and(value != nothing, compareTo != nothing))
        @test functions.ccxtruthy(stringGe(value, compareTo))
    end
end


function assertLess(self, exchange, skippedProperties, method, entry, key, compareTo, allowNull=true)

    if functions.ccxtruthy(ccxt_in(key, skippedProperties))
            return 
    end
    logText = logTemplate(nothing, exchange, method, entry);
    value = safeString(exchange, entry, key);
    @test functions.ccxtruthy(@functions.ccxt_or(value != nothing, allowNull))
    if functions.ccxtruthy(@functions.ccxt_and(value != nothing, compareTo != nothing))
        @test functions.ccxtruthy(stringLt(value, compareTo))
    end
end


function assertLessOrEqual(self, exchange, skippedProperties, method, entry, key, compareTo, allowNull=true)

    if functions.ccxtruthy(ccxt_in(key, skippedProperties))
            return 
    end
    logText = logTemplate(nothing, exchange, method, entry);
    value = safeString(exchange, entry, key);
    @test functions.ccxtruthy(@functions.ccxt_or(value != nothing, allowNull))
    if functions.ccxtruthy(@functions.ccxt_and(value != nothing, compareTo != nothing))
        @test functions.ccxtruthy(stringLe(value, compareTo))
    end
end


function assertEqual(self, exchange, skippedProperties, method, entry, key, compareTo, allowNull=true)

    if functions.ccxtruthy(ccxt_in(key, skippedProperties))
            return 
    end
    logText = logTemplate(nothing, exchange, method, entry);
    value = safeString(exchange, entry, key);
    @test functions.ccxtruthy(@functions.ccxt_or(value != nothing, allowNull))
    if functions.ccxtruthy(@functions.ccxt_and(value != nothing, compareTo != nothing))
        @test functions.ccxtruthy(stringEq(value, compareTo))
    end
end


function assertNonEqual(self, exchange, skippedProperties, method, entry, key, compareTo, allowNull=true)

    if functions.ccxtruthy(ccxt_in(key, skippedProperties))
            return 
    end
    logText = logTemplate(nothing, exchange, method, entry);
    value = safeString(exchange, entry, key);
    @test functions.ccxtruthy(@functions.ccxt_or(value != nothing, allowNull))
    if functions.ccxtruthy(value != nothing)
        @test !functions.ccxtruthy(stringEq(value, compareTo))
    end
end


function assertInArray(self, exchange, skippedProperties, method, entry, key, expectedArray, allowNull=true)

    if functions.ccxtruthy(ccxt_in(key, skippedProperties))
            return 
    end
    logText = logTemplate(nothing, exchange, method, entry);
    value = safeValue(exchange, entry, key);
    @test functions.ccxtruthy(@functions.ccxt_or(value != nothing, allowNull))
    if functions.ccxtruthy(value != nothing)
        stingifiedArrayValue = json(exchange, expectedArray);
        @test functions.ccxtruthy(inArray(exchange, value, expectedArray))
    end
end


function assertFeeStructure(self, exchange, skippedProperties, method, entry, key, allowNull=true)

    logText = logTemplate(nothing, exchange, method, entry);
    keyString = stringValue(nothing, key);
    if functions.ccxtruthy(isinteger(key))
        @test functions.ccxtruthy(functions.ccxt_isArray(entry))
        @test functions.ccxtruthy(functions.ccxt_lt(key, length(entry)))
    else
        @test functions.ccxtruthy(isDictionary(exchange, entry))
        @test functions.ccxtruthy(ccxt_in(key, entry))
    end
    feeObject = safeValue(exchange, entry, key);
    @test functions.ccxtruthy(@functions.ccxt_or(feeObject != nothing, allowNull))
    if functions.ccxtruthy(feeObject != nothing)
        @test functions.ccxtruthy(ccxt_in("cost", feeObject))
        if functions.ccxtruthy(get(feeObject, Symbol("cost"), nothing) == nothing)
                return 
        end
        @test functions.ccxtruthy(isa(get(feeObject, Symbol("cost"), nothing), Number))
        @test functions.ccxtruthy(ccxt_in("currency", feeObject))
        assertCurrencyCode(nothing, exchange, skippedProperties, method, entry, get(feeObject, Symbol("currency"), nothing));
    end
end


function assertTimestampOrder(self, exchange, method, codeOrSymbol, items, ascending=true)

    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(items)))
        if functions.ccxtruthy(functions.ccxt_gt(i, 0))
            currentTs = get(get(items, i - 1 + 1, nothing), Symbol("timestamp"), nothing);
            nextTs = get(get(items, i + 1, nothing), Symbol("timestamp"), nothing);
            if functions.ccxtruthy(@functions.ccxt_and(currentTs != nothing, nextTs != nothing))
                ascendingOrDescending = functions.ccxtruthy(ascending) ? "ascending" : "descending";
                comparison = functions.ccxtruthy(ascending) ? (functions.ccxt_le(currentTs, nextTs)) : (functions.ccxt_ge(currentTs, nextTs));
                @test functions.ccxtruthy(comparison)
            end
        end
        i += 1
    end
end


function assertInteger(self, exchange, skippedProperties, method, entry, key, allowNull=true)

    if functions.ccxtruthy(ccxt_in(key, skippedProperties))
            return 
    end
    logText = logTemplate(nothing, exchange, method, entry);
    if functions.ccxtruthy(entry != nothing)
        value = safeValue(exchange, entry, key);
        @test functions.ccxtruthy(@functions.ccxt_or(value != nothing, allowNull))
        if functions.ccxtruthy(value != nothing)
            isInteger = isinteger(value);
            @test functions.ccxtruthy(isInteger)
        end
    end
end


function checkPrecisionAccuracy(self, exchange, skippedProperties, method, entry, key)

    if functions.ccxtruthy(ccxt_in(key, skippedProperties))
            return 
    end
    if functions.ccxtruthy(isTickPrecision(exchange))
        assertGreater(nothing, exchange, skippedProperties, method, entry, key, "0");
        decimalNumbers = ["2", "3", "4", "5", "6", "7", "8", "9", "11", "12", "13", "14", "15", "16"];
        if functions.ccxtruthy(@functions.ccxt_and(key == "amount", ccxt_in("precisionAmountAbnormal", skippedProperties)))
                return 
        end
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(decimalNumbers)))
            num = get(decimalNumbers, i + 1, nothing);
            numStr = num;
            assertNonEqual(nothing, exchange, skippedProperties, method, entry, key, numStr);
            i += 1
        end

    else
        assertLessOrEqual(nothing, exchange, skippedProperties, method, entry, key, "18");
        assertGreaterOrEqual(nothing, exchange, skippedProperties, method, entry, key, "-8");
    end
end


function fetchBestBidAsk(self, exchange, method, symbol)

    logText = logTemplate(nothing, exchange, method, Dict{Symbol, Any}());
    bestBid = nothing;
    bestAsk = nothing;
    usedMethod = nothing;
    if functions.ccxtruthy(get(get(exchange, Symbol("has"), nothing), Symbol("fetchOrderBook"), nothing))
        usedMethod = "fetchOrderBook";
        orderbook = Base.fetch(fetchOrderBook(exchange, symbol));
        bids = safeList(exchange, orderbook, "bids");
        asks = safeList(exchange, orderbook, "asks");
        bestBidArray = safeList(exchange, bids, 0);
        bestAskArray = safeList(exchange, asks, 0);
        bestBid = safeNumber(exchange, bestBidArray, 0);
        bestAsk = safeNumber(exchange, bestAskArray, 0);
    elseif functions.ccxtruthy(get(get(exchange, Symbol("has"), nothing), Symbol("fetchBidsAsks"), nothing))
        usedMethod = "fetchBidsAsks";
        tickers = Base.fetch(fetchBidsAsks(exchange, [symbol]));
        ticker = safeDict(exchange, tickers, symbol);
        bestBid = safeNumber(exchange, ticker, "bid");
        bestAsk = safeNumber(exchange, ticker, "ask");
    else
        if functions.ccxtruthy(get(get(exchange, Symbol("has"), nothing), Symbol("fetchTicker"), nothing))
            usedMethod = "fetchTicker";
            ticker = Base.fetch(fetchTicker(exchange, symbol));
            bestBid = safeNumber(exchange, ticker, "bid");
            bestAsk = safeNumber(exchange, ticker, "ask");
        elseif functions.ccxtruthy(get(get(exchange, Symbol("has"), nothing), Symbol("fetchTickers"), nothing))
            usedMethod = "fetchTickers";
            tickers = Base.fetch(fetchTickers(exchange, [symbol]));
            ticker = safeDict(exchange, tickers, symbol);
            bestBid = safeNumber(exchange, ticker, "bid");
            bestAsk = safeNumber(exchange, ticker, "ask");
        end

    end
    @test functions.ccxtruthy(@functions.ccxt_and(bestBid != nothing, bestAsk != nothing))
    return [bestBid, bestAsk]
end


function fetchOrderHelper(self, exchange, symbol, orderId, skippedProperties)

    fetchedOrder = nothing;
    originalId = orderId;
    sinceTime = milliseconds(exchange) - 1000 * 60 * 5;
    methods_singular = ["fetchOrder", "fetchOpenOrder", "fetchClosedOrder", "fetchCanceledOrder"];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(methods_singular)))
        singularFetchName = get(methods_singular, i + 1, nothing);
        if functions.ccxtruthy(get(get(exchange, Symbol("has"), nothing), Symbol(singularFetchName), nothing))
            currentOrder = Base.fetch(getproperty(exchange, Symbol(singularFetchName))(originalId, symbol));
            if functions.ccxtruthy(get(currentOrder, Symbol("id"), nothing) == originalId)
                fetchedOrder = currentOrder;
                break
            end
        end
        i += 1
    end
    if functions.ccxtruthy(fetchedOrder == nothing)
        methods_plural = ["fetchOrders", "fetchOpenOrders", "fetchClosedOrders", "fetchCanceledOrders"];
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(methods_plural)))
            pluralFetchName = get(methods_plural, i + 1, nothing);
            if functions.ccxtruthy(get(get(exchange, Symbol("has"), nothing), Symbol(pluralFetchName), nothing))
                orders = Base.fetch(getproperty(exchange, Symbol(pluralFetchName))(symbol, sinceTime));
                found = false;
                j = 0
                while functions.ccxtruthy(functions.ccxt_lt(j, length(orders)))
                    currentOrder = get(orders, j + 1, nothing);
                    if functions.ccxtruthy(get(currentOrder, Symbol("id"), nothing) == originalId)
                        fetchedOrder = currentOrder;
                        found = true;
                        break
                    end
                    j += 1
                end

                if functions.ccxtruthy(found)
                    break
                end
            end
            i += 1
        end

    end
    return fetchedOrder
end


function assertOrderState(self, exchange, skippedProperties, method, order, assertedStatus, strictCheck)

    logText = logTemplate(nothing, exchange, method, order);
    msg = string("order should be ", assertedStatus, ", but it was not asserted", logText);
    filled = safeString(exchange, order, "filled");
    amount = safeString(exchange, order, "amount");
    statusUndefined = (get(order, Symbol("status"), nothing) == nothing);
    statusOpen = (get(order, Symbol("status"), nothing) == "open");
    statusClosed = (get(order, Symbol("status"), nothing) == "closed");
    statusClanceled = (get(order, Symbol("status"), nothing) == "canceled");
    filledDefined = (filled != nothing);
    amountDefined = (amount != nothing);
    condition = nothing;
    strictOpen = @functions.ccxt_and(statusOpen, (@functions.ccxt_and(@functions.ccxt_and(filledDefined, amountDefined), functions.ccxt_lt(filled, amount))));
    nonstrictOpen = @functions.ccxt_and((@functions.ccxt_or(statusOpen, statusUndefined)), (@functions.ccxt_or((@functions.ccxt_or(!functions.ccxtruthy(filledDefined), !functions.ccxtruthy(amountDefined))), stringLt(filled, amount))));
    if functions.ccxtruthy(assertedStatus == "open")
        condition = functions.ccxtruthy(strictCheck) ? strictOpen : nonstrictOpen;
        @test functions.ccxtruthy(condition); 
            return 
    end
    closedStrict = @functions.ccxt_and(statusClosed, (@functions.ccxt_and(@functions.ccxt_and(filledDefined, amountDefined), stringEq(filled, amount))));
    closedNonStrict = @functions.ccxt_and((@functions.ccxt_or(statusClosed, statusUndefined)), (@functions.ccxt_or((@functions.ccxt_or(!functions.ccxtruthy(filledDefined), !functions.ccxtruthy(amountDefined))), stringEq(filled, amount))));
    if functions.ccxtruthy(assertedStatus == "closed")
        condition = functions.ccxtruthy(strictCheck) ? closedStrict : closedNonStrict;
        @test functions.ccxtruthy(condition); 
            return 
    end
    canceledStrict = @functions.ccxt_and(statusClanceled, (@functions.ccxt_and(@functions.ccxt_and(filledDefined, amountDefined), stringLt(filled, amount))));
    canceledNonStrict = @functions.ccxt_and((@functions.ccxt_or(statusClanceled, statusUndefined)), (@functions.ccxt_or((@functions.ccxt_or(!functions.ccxtruthy(filledDefined), !functions.ccxtruthy(amountDefined))), stringLt(filled, amount))));
    if functions.ccxtruthy(assertedStatus == "canceled")
        condition = functions.ccxtruthy(strictCheck) ? canceledStrict : canceledNonStrict;
        @test functions.ccxtruthy(condition); 
            return 
    end
    if functions.ccxtruthy(assertedStatus == "closed_or_canceled")
        condition = functions.ccxtruthy(strictCheck) ? (@functions.ccxt_or(closedStrict, canceledStrict)) : (@functions.ccxt_or(closedNonStrict, canceledNonStrict));
        @test functions.ccxtruthy(condition); 
            return 
    end
end


function getActiveMarkets(self, exchange, includeUnknown=true)

    filteredActive = filterBy(exchange, get(exchange, Symbol("markets"), nothing), "active", true);
    if functions.ccxtruthy(includeUnknown)
        filteredUndefined = filterBy(exchange, get(exchange, Symbol("markets"), nothing), "active", nothing);
            return arrayConcat(exchange, filteredActive, filteredUndefined)
    end
    return filteredActive
end


function removeProxyOptions(self, exchange, skippedProperties)

    proxyUrl = checkProxyUrlSettings(exchange);
    (httpProxy, httpsProxy, socksProxy) = checkProxySettings(exchange);
    setProperty(exchange, exchange, "proxyUrl", nothing);
    setProperty(exchange, exchange, "proxy_url", nothing);
    setProperty(exchange, exchange, "httpProxy", nothing);
    setProperty(exchange, exchange, "http_proxy", nothing);
    setProperty(exchange, exchange, "httpsProxy", nothing);
    setProperty(exchange, exchange, "https_proxy", nothing);
    setProperty(exchange, exchange, "socksProxy", nothing);
    setProperty(exchange, exchange, "socks_proxy", nothing);
    return [proxyUrl, httpProxy, httpsProxy, socksProxy]
end


function setProxyOptions(self, exchange, skippedProperties, proxyUrl, httpProxy, httpsProxy, socksProxy)

    exchange.proxyUrl = proxyUrl;
    exchange.httpProxy = httpProxy;
    exchange.httpsProxy = httpsProxy;
    exchange.socksProxy = socksProxy;
end


function concat(self, a=nothing, b=nothing)

    if functions.ccxtruthy(a == nothing)
            return b
    elseif functions.ccxtruthy(b == nothing)
        return a
    else
        result = [];
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(a)))
            push!(result, get(a, i + 1, nothing));
            i += 1
        end
        j = 0
        while functions.ccxtruthy(functions.ccxt_lt(j, length(b)))
            push!(result, get(b, j + 1, nothing));
            j += 1
        end
        return result
    end
end


function assertNonEmtpyArray(self, exchange, skippedProperties, method, entry, hint=nothing)

    logText = logTemplate(nothing, exchange, method, entry);
    if functions.ccxtruthy(hint != nothing)
        logText = string(logText, " ", hint);
    end
    @test functions.ccxtruthy(functions.ccxt_isArray(entry))
    if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in("emptyResponse", skippedProperties))))
            return 
    end
    @test functions.ccxtruthy(functions.ccxt_gt(length(entry), 0))
end


function assertRoundMinuteTimestamp(self, exchange, skippedProperties, method, entry, key)

    if functions.ccxtruthy(ccxt_in(key, skippedProperties))
            return 
    end
    logText = logTemplate(nothing, exchange, method, entry);
    ts = safeString(exchange, entry, key);
    @test stringMod(ts, "60000") == "0"
end


function deepEqual(self, exchange, a, b)

    return jsonStringifyWithNull(exchange, a) == jsonStringifyWithNull(exchange, b)
end


function assertDeepEqual(self, exchange, skippedProperties, method, a, b)

    logText = logTemplate(nothing, exchange, method, Dict{Symbol, Any}());
    @test functions.ccxtruthy(deepEqual(nothing, exchange, a, b))
end


function exchangeProp(self, exchange, key, defaultValue=nothing)

    value = getProperty(exchange, exchange, string(key));
    if functions.ccxtruthy(value != nothing)
            return value
    end
    keyUpper = capitalize(exchange, string(key));
    return getProperty(exchange, exchange, keyUpper, defaultValue)
end


function validateTickerExceptionForPercentage(self, ex, exchange, ticker)

    eMessage = exceptionMessage(exchange, ex, false);
    if functions.ccxtruthy(@functions.ccxt_or(findfirst("percentage should be above", eMessage) !== nothing, findfirst("percentage should be below", eMessage) !== nothing))
        symbol = get(ticker, Symbol("symbol"), nothing);
        if functions.ccxtruthy(symbol != nothing)
            if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in(symbol, get(exchange, Symbol("markets"), nothing)))))
                    return 
            end
            if functions.ccxtruthy(featureValue(exchange, symbol, "fetchOHLCV") != nothing)
                ohlcv = Base.fetch(fetchOHLCV(exchange, symbol, "1d", nothing, 5));
                if functions.ccxtruthy(functions.ccxt_le(length(ohlcv), 1))
                        return 
                end
            end
        end
    end
    @test eMessage == ""; 
end

# testSharedMethods is passed as first arg to shared methods; defined here for reference
const testSharedMethods = nothing
