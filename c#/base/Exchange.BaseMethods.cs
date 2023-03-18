using Main;
namespace Main;
public partial class Exchange
{


    public virtual object sign(object path, object api = null, object method = null, object parameters = null, object headers = null, object body = null)
    {
        api ??= "public";
        method ??= "GET";
        parameters ??= new Dictionary<string, object>();
        return ((Dictionary<string, object>) (new Dictionary<string, object>() {}));
    }

    public async virtual Task<object> fetchAccounts(object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        return null;
    }

    public async virtual Task<object> fetchTrades(object symbol, object since = null, object limit = null, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        return ((List<object>) (null));
    }

    public async virtual Task<object> watchTrades(object symbol, object since = null, object limit = null, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        return ((List<object>) (null));
    }

    public async virtual Task<object> fetchDepositAddresses(object codes = null, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        return null;
    }

    public async virtual Task<object> fetchOrderBook(object symbol, object limit = null, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        return null;
    }

    public async virtual Task<object> watchOrderBook(object symbol, object limit = null, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        return null;
    }

    public async virtual Task<object> fetchTime(object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        return null;
    }

    public async virtual Task<object> fetchTradingLimits(object symbols = null, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        return null;
    }

    public virtual object parseTicker(object ticker, object market = null)
    {
        return null;
    }

    public virtual object parseDepositAddress(object depositAddress, object currency = null)
    {
        return null;
    }

    public virtual object parseTrade(object trade, object market = null)
    {
        return null;
    }

    public virtual object parseTransaction(object transaction, object currency = null)
    {
        return null;
    }

    public virtual object parseTransfer(object transfer, object currency = null)
    {
        return null;
    }

    public virtual object parseAccount(object account)
    {
        return null;
    }

    public virtual object parseLedgerEntry(object item, object currency = null)
    {
        return null;
    }

    public virtual object parseOrder(object order, object market = null)
    {
        return null;
    }

    public async virtual Task<object> fetchBorrowRates(object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        return null;
    }

    public virtual object parseMarketLeverageTiers(object info, object market = null)
    {
        return null;
    }

    public async virtual Task<object> fetchLeverageTiers(object symbols = null, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        return null;
    }

    public virtual object parsePosition(object position, object market = null)
    {
        return null;
    }

    public virtual object parseFundingRateHistory(object info, object market = null)
    {
        return null;
    }

    public virtual object parseBorrowInterest(object info, object market = null)
    {
        return null;
    }

    public async virtual Task<object> fetchFundingRates(object symbols = null, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        return null;
    }

    public async virtual Task<object> transfer(object code, object amount, object fromAccount, object toAccount, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        return null;
    }

    public async virtual Task<object> withdraw(object code, object amount, object address, object tag = null, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        return null;
    }

    public async virtual Task<object> createDepositAddress(object code, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        return null;
    }

    public virtual object parseToInt(object number)
    {
        // Solve Common parseInt misuse ex: parseInt ((since / 1000).toString ())
        // using a number as parameter which is not valid in ts
        var stringifiedNumber = ((object)number).ToString();
        var convertedNumber = ((object)parseFloat(stringifiedNumber));
        return ((object) (parseInt(convertedNumber)));
    }

    public virtual object getDefaultOptions()
    {
        return ((Dictionary<string, object>) (new Dictionary<string, object>() {
            { "defaultNetworkCodeReplacements", new Dictionary<string, object>() {
                { "ETH", new Dictionary<string, object>() {
                    { "ERC20", "ETH" },
                } },
                { "TRX", new Dictionary<string, object>() {
                    { "TRC20", "TRX" },
                } },
                { "CRO", new Dictionary<string, object>() {
                    { "CRC20", "CRONOS" },
                } },
            } },
        }));
    }

    public virtual object safeLedgerEntry(object entry, object currency = null)
    {
                currency = (string)(this.safeCurrency(null, currency));
        var direction = this.safeString(entry, "direction");
        var before = this.safeString(entry, "before");
        var after = this.safeString(entry, "after");
        var amount = this.safeString(entry, "amount");
        if (!isEqual(amount, null))
        {
            if (isEqual(before, null) && !isEqual(after, null))
            {
                before = Precise.stringSub(after, amount);
            } else if (!isEqual(before, null) && isEqual(after, null))
            {
                after = Precise.stringAdd(before, amount);
            }
        }
        if (!isEqual(before, null) && !isEqual(after, null))
        {
            if (isEqual(direction, null))
            {
                if (isTrue(Precise.stringGt(before, after)))
                {
                    direction = "out";
                }
                if (isTrue(Precise.stringGt(after, before)))
                {
                    direction = "in";
                }
            }
        }
        var fee = this.safeValue(entry, "fee");
        if (!isEqual(fee, null))
        {
            ((Dictionary<string, object>)fee)["cost"] = this.safeNumber(fee, "cost");
        }
        var timestamp = this.safeInteger(entry, "timestamp");
        return ((Dictionary<string, object>) (new Dictionary<string, object>() {
            { "id", this.safeString(entry, "id") },
            { "timestamp", timestamp },
            { "datetime", this.iso8601(timestamp) },
            { "direction", direction },
            { "account", this.safeString(entry, "account") },
            { "referenceId", this.safeString(entry, "referenceId") },
            { "referenceAccount", this.safeString(entry, "referenceAccount") },
            { "type", this.safeString(entry, "type") },
            { "currency", getValue(currency, "code") },
            { "amount", this.parseNumber(amount) },
            { "before", this.parseNumber(before) },
            { "after", this.parseNumber(after) },
            { "status", this.safeString(entry, "status") },
            { "fee", fee },
            { "info", entry },
        }));
    }

    public virtual object setMarkets(object markets, object currencies = null)
    {
        var values = new List<object>() {};
        this.markets_by_id = new Dictionary<string, object>() {};
        // handle marketId conflicts
        // we insert spot markets first
        var marketValues = this.sortBy(this.toArray(markets), "spot", true);
        for (var i = 0; isLessThan(i, getArrayLength(marketValues)); i++)
        {
            var value = getValue(marketValues, i);
            if (((Dictionary<string,object>)this.markets_by_id).ContainsKey((string)getValue(value, "id")))
            {
                ((List<object>)getValue(this.markets_by_id, getValue(value, "id"))).Add(value);
            } else
            {
                ((Dictionary<string, object>)this.markets_by_id)[(string)getValue(value, "id")] = new List<object>() {value};
            }
            var market = this.deepExtend(this.safeMarket(), new Dictionary<string, object>() {
                { "precision", this.precision },
                { "limits", this.limits },
            }, getValue(this.fees, "trading"), value);
            ((List<object>)values).Add(market);
        }
                this.markets = (undefined)(((object)this.indexBy(values, "symbol")));
        var marketsSortedBySymbol = this.keysort(this.markets);
        var marketsSortedById = this.keysort(this.markets_by_id);
        this.symbols = new List<string>(((Dictionary<string,object>)marketsSortedBySymbol).Keys);
        this.ids = new List<string>(((Dictionary<string,object>)marketsSortedById).Keys);
        if (!isEqual(currencies, null))
        {
            this.currencies = this.deepExtend(this.currencies, currencies);
        } else
        {
            var baseCurrencies = new List<object>() {};
            var quoteCurrencies = new List<object>() {};
            for (var i = 0; isLessThan(i, getArrayLength(values)); i++)
            {
                var market = getValue(values, i);
                var defaultCurrencyPrecision = (isEqual(this.precisionMode, DECIMAL_PLACES)) ? 8 : this.parseNumber("1e-8");
                var marketPrecision = this.safeValue(market, "precision", new Dictionary<string, object>() {});
                if (((Dictionary<string,object>)market).ContainsKey((string)"base"))
                {
                    var currencyPrecision = this.safeValue2(marketPrecision, "base", "amount", defaultCurrencyPrecision);
                    var currency = new Dictionary<string, object>() {
                        { "id", this.safeString2(market, "baseId", "base") },
                        { "numericId", this.safeString(market, "baseNumericId") },
                        { "code", this.safeString(market, "base") },
                        { "precision", currencyPrecision },
                    };
                    ((List<object>)baseCurrencies).Add(currency);
                }
                if (((Dictionary<string,object>)market).ContainsKey((string)"quote"))
                {
                    var currencyPrecision = this.safeValue2(marketPrecision, "quote", "price", defaultCurrencyPrecision);
                    var currency = new Dictionary<string, object>() {
                        { "id", this.safeString2(market, "quoteId", "quote") },
                        { "numericId", this.safeString(market, "quoteNumericId") },
                        { "code", this.safeString(market, "quote") },
                        { "precision", currencyPrecision },
                    };
                    ((List<object>)quoteCurrencies).Add(currency);
                }
            }
                        baseCurrencies = (List<object>)(this.sortBy(baseCurrencies, "code"));
                        quoteCurrencies = (List<object>)(this.sortBy(quoteCurrencies, "code"));
            this.baseCurrencies = this.indexBy(baseCurrencies, "code");
            this.quoteCurrencies = this.indexBy(quoteCurrencies, "code");
            var allCurrencies = this.arrayConcat(baseCurrencies, quoteCurrencies);
            var groupedCurrencies = this.groupBy(allCurrencies, "code");
            var codes = new List<string>(((Dictionary<string,object>)groupedCurrencies).Keys);
            var resultingCurrencies = new List<object>() {};
            for (var i = 0; isLessThan(i, getArrayLength(codes)); i++)
            {
                var code = getValue(codes, i);
                var groupedCurrenciesCode = this.safeValue(groupedCurrencies, code, new List<object>() {});
                var highestPrecisionCurrency = this.safeValue(groupedCurrenciesCode, 0);
                for (var j = 1; isLessThan(j, getArrayLength(groupedCurrenciesCode)); j++)
                {
                    var currentCurrency = getValue(groupedCurrenciesCode, j);
                    if (isEqual(this.precisionMode, TICK_SIZE))
                    {
                        highestPrecisionCurrency = (isLessThan(getValue(currentCurrency, "precision"), getValue(highestPrecisionCurrency, "precision"))) ? currentCurrency : highestPrecisionCurrency;
                    } else
                    {
                        highestPrecisionCurrency = (isGreaterThan(getValue(currentCurrency, "precision"), getValue(highestPrecisionCurrency, "precision"))) ? currentCurrency : highestPrecisionCurrency;
                    }
                }
                ((List<object>)resultingCurrencies).Add(highestPrecisionCurrency);
            }
            var sortedCurrencies = this.sortBy(resultingCurrencies, "code");
            this.currencies = this.deepExtend(this.currencies, this.indexBy(sortedCurrencies, "code"));
        }
        this.currencies_by_id = this.indexBy(this.currencies, "id");
        var currenciesSortedByCode = this.keysort(this.currencies);
        this.codes = new List<string>(((Dictionary<string,object>)currenciesSortedByCode).Keys);
        return this.markets;
    }

    public virtual object safeBalance(object balance)
    {
        var balances = this.omit(balance, new List<object>() {"info", "timestamp", "datetime", "free", "used", "total"});
        var codes = new List<string>(((Dictionary<string,object>)balances).Keys);
        ((Dictionary<string, object>)balance)["free"] = new Dictionary<string, object>() {};
        ((Dictionary<string, object>)balance)["used"] = new Dictionary<string, object>() {};
        ((Dictionary<string, object>)balance)["total"] = new Dictionary<string, object>() {};
        var debtBalance = new Dictionary<string, object>() {};
        for (var i = 0; isLessThan(i, getArrayLength(codes)); i++)
        {
            var code = getValue(codes, i);
            var total = this.safeString(getValue(balance, code), "total");
            var free = this.safeString(getValue(balance, code), "free");
            var used = this.safeString(getValue(balance, code), "used");
            var debt = this.safeString(getValue(balance, code), "debt");
            if ((isEqual(total, null)) && (!isEqual(free, null)) && (!isEqual(used, null)))
            {
                total = Precise.stringAdd(free, used);
            }
            if ((isEqual(free, null)) && (!isEqual(total, null)) && (!isEqual(used, null)))
            {
                free = Precise.stringSub(total, used);
            }
            if ((isEqual(used, null)) && (!isEqual(total, null)) && (!isEqual(free, null)))
            {
                used = Precise.stringSub(total, free);
            }
            ((Dictionary<string, object>)getValue(balance, code))["free"] = this.parseNumber(free);
            ((Dictionary<string, object>)getValue(balance, code))["used"] = this.parseNumber(used);
            ((Dictionary<string, object>)getValue(balance, code))["total"] = this.parseNumber(total);
            ((Dictionary<string, object>)getValue(balance, "free"))[(string)code] = getValue(getValue(balance, code), "free");
            ((Dictionary<string, object>)getValue(balance, "used"))[(string)code] = getValue(getValue(balance, code), "used");
            ((Dictionary<string, object>)getValue(balance, "total"))[(string)code] = getValue(getValue(balance, code), "total");
            if (!isEqual(debt, null))
            {
                ((Dictionary<string, object>)getValue(balance, code))["debt"] = this.parseNumber(debt);
                ((Dictionary<string, object>)debtBalance)[(string)code] = getValue(getValue(balance, code), "debt");
            }
        }
        var debtBalanceArray = new List<string>(((Dictionary<string,object>)debtBalance).Keys);
        var length = getArrayLength(debtBalanceArray);
        if (isTrue(length))
        {
            ((Dictionary<string, object>)balance)["debt"] = debtBalance;
        }
        return ((object)balance);
    }

    public virtual object safeOrder(object order, object market = null)
    {
        // parses numbers as strings
        // * it is important pass the trades as unparsed rawTrades
        var amount = this.omitZero(this.safeString(order, "amount"));
        var remaining = this.safeString(order, "remaining");
        var filled = this.safeString(order, "filled");
        var cost = this.safeString(order, "cost");
        var average = this.omitZero(this.safeString(order, "average"));
        var price = this.omitZero(this.safeString(order, "price"));
        var lastTradeTimeTimestamp = this.safeInteger(order, "lastTradeTimestamp");
        var symbol = this.safeString(order, "symbol");
        var side = this.safeString(order, "side");
        var parseFilled = (isEqual(filled, null));
        var parseCost = (isEqual(cost, null));
        var parseLastTradeTimeTimestamp = (isEqual(lastTradeTimeTimestamp, null));
        var fee = this.safeValue(order, "fee");
        var parseFee = (isEqual(fee, null));
        var parseFees = isEqual(this.safeValue(order, "fees"), null);
        var parseSymbol = isEqual(symbol, null);
        var parseSide = isEqual(side, null);
        var shouldParseFees = isTrue(parseFee) || isTrue(parseFees);
        var fees = this.safeValue(order, "fees", new List<object>() {});
        var trades = new List<object>() {};
        if (isTrue(parseFilled) || isTrue(parseCost) || isTrue(shouldParseFees))
        {
            var rawTrades = this.safeValue(order, "trades", trades);
            var oldNumber = this.number;
            // we parse trades as strings here!
            ((object)this).number = String;
            trades = this.parseTrades(rawTrades, market);
            this.number = oldNumber;
            var tradesLength = 0;
            var isArray = (trades.GetType().IsGenericType && trades.GetType().GetGenericTypeDefinition().IsAssignableFrom(typeof(List<>)));
            if (isTrue(isArray))
            {
                tradesLength = getArrayLength(trades);
            }
            if (isTrue(isArray) && (isGreaterThan(tradesLength, 0)))
            {
                // move properties that are defined in trades up into the order
                if (isEqual(getValue(order, "symbol"), null))
                {
                    ((Dictionary<string, object>)order)["symbol"] = getValue(getValue(trades, 0), "symbol");
                }
                if (isEqual(getValue(order, "side"), null))
                {
                    ((Dictionary<string, object>)order)["side"] = getValue(getValue(trades, 0), "side");
                }
                if (isEqual(getValue(order, "type"), null))
                {
                    ((Dictionary<string, object>)order)["type"] = getValue(getValue(trades, 0), "type");
                }
                if (isEqual(getValue(order, "id"), null))
                {
                    ((Dictionary<string, object>)order)["id"] = getValue(getValue(trades, 0), "order");
                }
                if (isTrue(parseFilled))
                {
                    filled = "0";
                }
                if (isTrue(parseCost))
                {
                    cost = "0";
                }
                for (var i = 0; isLessThan(i, getArrayLength(trades)); i++)
                {
                    var trade = getValue(trades, i);
                    var tradeAmount = this.safeString(trade, "amount");
                    if (isTrue(parseFilled) && (!isEqual(tradeAmount, null)))
                    {
                        filled = Precise.stringAdd(filled, tradeAmount);
                    }
                    var tradeCost = this.safeString(trade, "cost");
                    if (isTrue(parseCost) && (!isEqual(tradeCost, null)))
                    {
                        cost = Precise.stringAdd(cost, tradeCost);
                    }
                    if (isTrue(parseSymbol))
                    {
                        symbol = this.safeString(trade, "symbol");
                    }
                    if (isTrue(parseSide))
                    {
                        side = this.safeString(trade, "side");
                    }
                    var tradeTimestamp = this.safeValue(trade, "timestamp");
                    if (isTrue(parseLastTradeTimeTimestamp) && (!isEqual(tradeTimestamp, null)))
                    {
                        if (isEqual(lastTradeTimeTimestamp, null))
                        {
                                                        lastTradeTimeTimestamp = (object)(tradeTimestamp);
                        } else
                        {
                            lastTradeTimeTimestamp = mathMax(lastTradeTimeTimestamp, tradeTimestamp);
                        }
                    }
                    if (isTrue(shouldParseFees))
                    {
                        var tradeFees = this.safeValue(trade, "fees");
                        if (!isEqual(tradeFees, null))
                        {
                            for (var j = 0; isLessThan(j, getArrayLength(tradeFees)); j++)
                            {
                                var tradeFee = getValue(tradeFees, j);
                                ((List<object>)fees).Add(this.extend(new Dictionary<string, object>() {}, tradeFee));
                            }
                        } else
                        {
                            var tradeFee = this.safeValue(trade, "fee");
                            if (!isEqual(tradeFee, null))
                            {
                                ((List<object>)fees).Add(this.extend(new Dictionary<string, object>() {}, tradeFee));
                            }
                        }
                    }
                }
            }
        }
        if (isTrue(shouldParseFees))
        {
            var reducedFees = isTrue(this.reduceFees) ? this.reduceFeesByCurrency(fees) : fees;
            var reducedLength = getArrayLength(reducedFees);
            for (var i = 0; isLessThan(i, reducedLength); i++)
            {
                ((Dictionary<string, object>)getValue(reducedFees, i))["cost"] = this.safeNumber(getValue(reducedFees, i), "cost");
                if (((Dictionary<string,object>)getValue(reducedFees, i)).ContainsKey((string)"rate"))
                {
                    ((Dictionary<string, object>)getValue(reducedFees, i))["rate"] = this.safeNumber(getValue(reducedFees, i), "rate");
                }
            }
            if (!isTrue(parseFee) && (isEqual(reducedLength, 0)))
            {
                ((Dictionary<string, object>)fee)["cost"] = this.safeNumber(fee, "cost");
                if (((Dictionary<string,object>)fee).ContainsKey((string)"rate"))
                {
                    ((Dictionary<string, object>)fee)["rate"] = this.safeNumber(fee, "rate");
                }
                ((List<object>)reducedFees).Add(fee);
            }
            ((Dictionary<string, object>)order)["fees"] = reducedFees;
            if (isTrue(parseFee) && (isEqual(reducedLength, 1)))
            {
                ((Dictionary<string, object>)order)["fee"] = getValue(reducedFees, 0);
            }
        }
        if (isEqual(amount, null))
        {
            // ensure amount = filled + remaining
            if (!isEqual(filled, null) && !isEqual(remaining, null))
            {
                amount = Precise.stringAdd(filled, remaining);
            } else if (isEqual(this.safeString(order, "status"), "closed"))
            {
                amount = filled;
            }
        }
        if (isEqual(filled, null))
        {
            if (!isEqual(amount, null) && !isEqual(remaining, null))
            {
                filled = Precise.stringSub(amount, remaining);
            }
        }
        if (isEqual(remaining, null))
        {
            if (!isEqual(amount, null) && !isEqual(filled, null))
            {
                remaining = Precise.stringSub(amount, filled);
            }
        }
        // ensure that the average field is calculated correctly
        var inverse = this.safeValue(market, "inverse", false);
        var contractSize = this.numberToString(this.safeValue(market, "contractSize", 1));
        // inverse
        // price = filled * contract size / cost
        //
        // linear
        // price = cost / (filled * contract size)
        if (isEqual(average, null))
        {
            if ((!isEqual(filled, null)) && (!isEqual(cost, null)) && isTrue(Precise.stringGt(filled, "0")))
            {
                var filledTimesContractSize = Precise.stringMul(filled, contractSize);
                if (isTrue(inverse))
                {
                    average = Precise.stringDiv(filledTimesContractSize, cost);
                } else
                {
                    average = Precise.stringDiv(cost, filledTimesContractSize);
                }
            }
        }
        // similarly
        // inverse
        // cost = filled * contract size / price
        //
        // linear
        // cost = filled * contract size * price
        var costPriceExists = (!isEqual(average, null)) || (!isEqual(price, null));
        if (isTrue(parseCost) && (!isEqual(filled, null)) && isTrue(costPriceExists))
        {
            object multiplyPrice = null;
            if (isEqual(average, null))
            {
                multiplyPrice = price;
            } else
            {
                multiplyPrice = average;
            }
            // contract trading
            var filledTimesContractSize = Precise.stringMul(filled, contractSize);
            if (isTrue(inverse))
            {
                cost = Precise.stringDiv(filledTimesContractSize, multiplyPrice);
            } else
            {
                cost = Precise.stringMul(filledTimesContractSize, multiplyPrice);
            }
        }
        // support for market orders
        var orderType = this.safeValue(order, "type");
        var emptyPrice = (isEqual(price, null)) || isTrue(Precise.stringEquals(price, "0"));
        if (isTrue(emptyPrice) && (isEqual(orderType, "market")))
        {
            price = average;
        }
        // we have trades with string values at this point so we will mutate them
        for (var i = 0; isLessThan(i, getArrayLength(trades)); i++)
        {
            var entry = getValue(trades, i);
            ((Dictionary<string, object>)entry)["amount"] = this.safeNumber(entry, "amount");
            ((Dictionary<string, object>)entry)["price"] = this.safeNumber(entry, "price");
            ((Dictionary<string, object>)entry)["cost"] = this.safeNumber(entry, "cost");
            var fee = this.safeValue(entry, "fee", new Dictionary<string, object>() {});
            ((Dictionary<string, object>)fee)["cost"] = this.safeNumber(fee, "cost");
            if (((Dictionary<string,object>)fee).ContainsKey((string)"rate"))
            {
                ((Dictionary<string, object>)fee)["rate"] = this.safeNumber(fee, "rate");
            }
            ((Dictionary<string, object>)entry)["fee"] = fee;
        }
        var timeInForce = this.safeString(order, "timeInForce");
        var postOnly = this.safeValue(order, "postOnly");
        // timeInForceHandling
        if (isEqual(timeInForce, null))
        {
            if (isEqual(this.safeString(order, "type"), "market"))
            {
                timeInForce = "IOC";
            }
            // allow postOnly override
            if (isTrue(postOnly))
            {
                timeInForce = "PO";
            }
        } else if (isEqual(postOnly, null))
        {
            // timeInForce is not undefined here
            postOnly = isEqual(timeInForce, "PO");
        }
        var timestamp = this.safeInteger(order, "timestamp");
        var datetime = this.safeString(order, "datetime");
        if (isEqual(datetime, null))
        {
            datetime = this.iso8601(timestamp);
        }
        var triggerPrice = this.parseNumber(this.safeString2(order, "triggerPrice", "stopPrice"));
        return this.extend(order, new Dictionary<string, object>() {
            { "id", this.safeString(order, "id") },
            { "clientOrderId", this.safeString(order, "clientOrderId") },
            { "timestamp", timestamp },
            { "datetime", datetime },
            { "symbol", symbol },
            { "type", this.safeString(order, "type") },
            { "side", side },
            { "lastTradeTimestamp", lastTradeTimeTimestamp },
            { "price", this.parseNumber(price) },
            { "amount", this.parseNumber(amount) },
            { "cost", this.parseNumber(cost) },
            { "average", this.parseNumber(average) },
            { "filled", this.parseNumber(filled) },
            { "remaining", this.parseNumber(remaining) },
            { "timeInForce", timeInForce },
            { "postOnly", postOnly },
            { "trades", trades },
            { "reduceOnly", this.safeValue(order, "reduceOnly") },
            { "stopPrice", triggerPrice },
            { "triggerPrice", triggerPrice },
            { "status", this.safeString(order, "status") },
            { "fee", this.safeValue(order, "fee") },
        });
    }

    public virtual object parseOrders(object orders, object market = null, object since = null, object limit = null, object parameters = null)
    {
        //
        // the value of orders is either a dict or a list
        //
        // dict
        //
        //     {
        //         'id1': { ... },
        //         'id2': { ... },
        //         'id3': { ... },
        //         ...
        //     }
        //
        // list
        //
        //     [
        //         { 'id': 'id1', ... },
        //         { 'id': 'id2', ... },
        //         { 'id': 'id3', ... },
        //         ...
        //     ]
        //
        parameters ??= new Dictionary<string, object>();
        var results = new List<object>() {};
        if (isTrue((orders.GetType().IsGenericType && orders.GetType().GetGenericTypeDefinition().IsAssignableFrom(typeof(List<>)))))
        {
            for (var i = 0; isLessThan(i, getArrayLength(orders)); i++)
            {
                var order = this.extend(this.parseOrder(getValue(orders, i), market), parameters);
                ((List<object>)results).Add(order);
            }
        } else
        {
            var ids = new List<string>(((Dictionary<string,object>)orders).Keys);
            for (var i = 0; isLessThan(i, getArrayLength(ids)); i++)
            {
                var id = getValue(ids, i);
                var order = this.extend(this.parseOrder(this.extend(new Dictionary<string, object>() {
                    { "id", id },
                }, getValue(orders, id)), market), parameters);
                ((List<object>)results).Add(order);
            }
        }
                results = (List<object>)(this.sortBy(results, "timestamp"));
        var symbol = (!isEqual(market, null)) ? getValue(market, "symbol") : null;
        var tail = isEqual(since, null);
        return ((List<object>) (this.filterBySymbolSinceLimit(results, symbol, since, limit, tail)));
    }

    public virtual object calculateFee(object symbol, object type, object side, object amount, object price, object takerOrMaker = null, object parameters = null)
    {
        takerOrMaker ??= "taker";
        parameters ??= new Dictionary<string, object>();
        if (isEqual(type, "market") && isEqual(takerOrMaker, "maker"))
        {
throw new ArgumentsRequired(add(this.id, " calculateFee() - you have provided incompatible arguments - \"market\" type order can not be \"maker\". Change either the \"type\" or the \"takerOrMaker\" argument to calculate the fee."));
        }
        var market = getValue(this.markets, symbol);
        var feeSide = this.safeString(market, "feeSide", "quote");
        var key = "quote";
        object cost = null;
        var amountString = this.numberToString(amount);
        var priceString = this.numberToString(price);
        if (isEqual(feeSide, "quote"))
        {
            // the fee is always in quote currency
            cost = Precise.stringMul(amountString, priceString);
        } else if (isEqual(feeSide, "base"))
        {
            // the fee is always in base currency
            cost = amountString;
        } else if (isEqual(feeSide, "get"))
        {
            // the fee is always in the currency you get
            cost = amountString;
            if (isEqual(side, "sell"))
            {
                cost = Precise.stringMul(cost, priceString);
            } else
            {
                key = "base";
            }
        } else if (isEqual(feeSide, "give"))
        {
            // the fee is always in the currency you give
            cost = amountString;
            if (isEqual(side, "buy"))
            {
                cost = Precise.stringMul(cost, priceString);
            } else
            {
                key = "base";
            }
        }
        // for derivatives, the fee is in 'settle' currency
        if (!isTrue(getValue(market, "spot")))
        {
            key = "settle";
        }
        // even if `takerOrMaker` argument was set to 'maker', for 'market' orders we should forcefully override it to 'taker'
        if (isEqual(type, "market"))
        {
            takerOrMaker = "taker";
        }
        var rate = this.safeString(market, takerOrMaker);
        if (!isEqual(cost, null))
        {
            cost = Precise.stringMul(cost, rate);
        }
        return ((Dictionary<string, object>) (new Dictionary<string, object>() {
            { "type", takerOrMaker },
            { "currency", getValue(market, key) },
            { "rate", this.parseNumber(rate) },
            { "cost", this.parseNumber(cost) },
        }));
    }

    public virtual object safeTrade(object trade, object market = null)
    {
        var amount = this.safeString(trade, "amount");
        var price = this.safeString(trade, "price");
        var cost = this.safeString(trade, "cost");
        if (isEqual(cost, null))
        {
            // contract trading
            var contractSize = this.safeString(market, "contractSize");
            var multiplyPrice = price;
            if (!isEqual(contractSize, null))
            {
                var inverse = this.safeValue(market, "inverse", false);
                if (isTrue(inverse))
                {
                    multiplyPrice = Precise.stringDiv("1", price);
                }
                multiplyPrice = Precise.stringMul(multiplyPrice, contractSize);
            }
            cost = Precise.stringMul(multiplyPrice, amount);
        }
        var parseFee = isEqual(this.safeValue(trade, "fee"), null);
        var parseFees = isEqual(this.safeValue(trade, "fees"), null);
        var shouldParseFees = isTrue(parseFee) || isTrue(parseFees);
        var fees = new List<object>() {};
        var fee = this.safeValue(trade, "fee");
        if (isTrue(shouldParseFees))
        {
            var reducedFees = isTrue(this.reduceFees) ? this.reduceFeesByCurrency(fees) : fees;
            var reducedLength = getArrayLength(reducedFees);
            for (var i = 0; isLessThan(i, reducedLength); i++)
            {
                ((Dictionary<string, object>)getValue(reducedFees, i))["cost"] = this.safeNumber(getValue(reducedFees, i), "cost");
                if (((Dictionary<string,object>)getValue(reducedFees, i)).ContainsKey((string)"rate"))
                {
                    ((Dictionary<string, object>)getValue(reducedFees, i))["rate"] = this.safeNumber(getValue(reducedFees, i), "rate");
                }
            }
            if (!isTrue(parseFee) && (isEqual(reducedLength, 0)))
            {
                ((Dictionary<string, object>)fee)["cost"] = this.safeNumber(fee, "cost");
                if (((Dictionary<string,object>)fee).ContainsKey((string)"rate"))
                {
                    ((Dictionary<string, object>)fee)["rate"] = this.safeNumber(fee, "rate");
                }
                ((List<object>)reducedFees).Add(fee);
            }
            if (isTrue(parseFees))
            {
                ((Dictionary<string, object>)trade)["fees"] = reducedFees;
            }
            if (isTrue(parseFee) && (isEqual(reducedLength, 1)))
            {
                ((Dictionary<string, object>)trade)["fee"] = getValue(reducedFees, 0);
            }
            var tradeFee = this.safeValue(trade, "fee");
            if (!isEqual(tradeFee, null))
            {
                ((Dictionary<string, object>)tradeFee)["cost"] = this.safeNumber(tradeFee, "cost");
                if (((Dictionary<string,object>)tradeFee).ContainsKey((string)"rate"))
                {
                    ((Dictionary<string, object>)tradeFee)["rate"] = this.safeNumber(tradeFee, "rate");
                }
                ((Dictionary<string, object>)trade)["fee"] = tradeFee;
            }
        }
        ((Dictionary<string, object>)trade)["amount"] = this.parseNumber(amount);
        ((Dictionary<string, object>)trade)["price"] = this.parseNumber(price);
        ((Dictionary<string, object>)trade)["cost"] = this.parseNumber(cost);
        return trade;
    }

    public virtual object reduceFeesByCurrency(object fees)
    {
        //
        // this function takes a list of fee structures having the following format
        //
        //     string = true
        //
        //     [
        //         { 'currency': 'BTC', 'cost': '0.1' },
        //         { 'currency': 'BTC', 'cost': '0.2'  },
        //         { 'currency': 'BTC', 'cost': '0.2', 'rate': '0.00123' },
        //         { 'currency': 'BTC', 'cost': '0.4', 'rate': '0.00123' },
        //         { 'currency': 'BTC', 'cost': '0.5', 'rate': '0.00456' },
        //         { 'currency': 'USDT', 'cost': '12.3456' },
        //     ]
        //
        //     string = false
        //
        //     [
        //         { 'currency': 'BTC', 'cost': 0.1 },
        //         { 'currency': 'BTC', 'cost': 0.2 },
        //         { 'currency': 'BTC', 'cost': 0.2, 'rate': 0.00123 },
        //         { 'currency': 'BTC', 'cost': 0.4, 'rate': 0.00123 },
        //         { 'currency': 'BTC', 'cost': 0.5, 'rate': 0.00456 },
        //         { 'currency': 'USDT', 'cost': 12.3456 },
        //     ]
        //
        // and returns a reduced fee list, where fees are summed per currency and rate (if any)
        //
        //     string = true
        //
        //     [
        //         { 'currency': 'BTC', 'cost': '0.3'  },
        //         { 'currency': 'BTC', 'cost': '0.6', 'rate': '0.00123' },
        //         { 'currency': 'BTC', 'cost': '0.5', 'rate': '0.00456' },
        //         { 'currency': 'USDT', 'cost': '12.3456' },
        //     ]
        //
        //     string  = false
        //
        //     [
        //         { 'currency': 'BTC', 'cost': 0.3  },
        //         { 'currency': 'BTC', 'cost': 0.6, 'rate': 0.00123 },
        //         { 'currency': 'BTC', 'cost': 0.5, 'rate': 0.00456 },
        //         { 'currency': 'USDT', 'cost': 12.3456 },
        //     ]
        //
        var reduced = new Dictionary<string, object>() {};
        for (var i = 0; isLessThan(i, getArrayLength(fees)); i++)
        {
            var fee = getValue(fees, i);
            var feeCurrencyCode = this.safeString(fee, "currency");
            if (!isEqual(feeCurrencyCode, null))
            {
                var rate = this.safeString(fee, "rate");
                var cost = this.safeValue(fee, "cost");
                if (isTrue(Precise.stringEq(cost, "0")))
                {

                }
                if (!(((Dictionary<string,object>)reduced).ContainsKey((string)feeCurrencyCode)))
                {
                    ((Dictionary<string, object>)reduced)[(string)feeCurrencyCode] = new Dictionary<string, object>() {};
                }
                var rateKey = (isEqual(rate, null)) ? "" : rate;
                if (((Dictionary<string,object>)getValue(reduced, feeCurrencyCode)).ContainsKey((string)rateKey))
                {
                    ((Dictionary<string, object>)getValue(getValue(reduced, feeCurrencyCode), rateKey))["cost"] = Precise.stringAdd(getValue(getValue(getValue(reduced, feeCurrencyCode), rateKey), "cost"), cost);
                } else
                {
                    ((Dictionary<string, object>)getValue(reduced, feeCurrencyCode))[(string)rateKey] = new Dictionary<string, object>() {
                        { "currency", feeCurrencyCode },
                        { "cost", cost },
                    };
                    if (!isEqual(rate, null))
                    {
                        ((Dictionary<string, object>)getValue(getValue(reduced, feeCurrencyCode), rateKey))["rate"] = rate;
                    }
                }
            }
        }
        var result = new List<object>() {};
        var feeValues = new List<object>(((Dictionary<string,object>)reduced).Values);
        for (var i = 0; isLessThan(i, getArrayLength(feeValues)); i++)
        {
            var reducedFeeValues = new List<object>(((Dictionary<string,object>)getValue(feeValues, i)).Values);
                        result = (List<object>)(this.arrayConcat(result, reducedFeeValues));
        }
        return ((List<object>) (result));
    }

    public virtual object safeTicker(object ticker, object market = null)
    {
        var open = this.safeValue(ticker, "open");
        var close = this.safeValue(ticker, "close");
        var last = this.safeValue(ticker, "last");
        var change = this.safeValue(ticker, "change");
        var percentage = this.safeValue(ticker, "percentage");
        var average = this.safeValue(ticker, "average");
        var vwap = this.safeValue(ticker, "vwap");
        var baseVolume = this.safeValue(ticker, "baseVolume");
        var quoteVolume = this.safeValue(ticker, "quoteVolume");
        if (isEqual(vwap, null))
        {
            vwap = Precise.stringDiv(quoteVolume, baseVolume);
        }
        if ((!isEqual(last, null)) && (isEqual(close, null)))
        {
            close = last;
        } else if ((isEqual(last, null)) && (!isEqual(close, null)))
        {
            last = close;
        }
        if ((!isEqual(last, null)) && (!isEqual(open, null)))
        {
            if (isEqual(change, null))
            {
                change = Precise.stringSub(last, open);
            }
            if (isEqual(average, null))
            {
                average = Precise.stringDiv(Precise.stringAdd(last, open), "2");
            }
        }
        if ((isEqual(percentage, null)) && (!isEqual(change, null)) && (!isEqual(open, null)) && isTrue(Precise.stringGt(open, "0")))
        {
            percentage = Precise.stringMul(Precise.stringDiv(change, open), "100");
        }
        if ((isEqual(change, null)) && (!isEqual(percentage, null)) && (!isEqual(open, null)))
        {
            change = Precise.stringDiv(Precise.stringMul(percentage, open), "100");
        }
        if ((isEqual(open, null)) && (!isEqual(last, null)) && (!isEqual(change, null)))
        {
            open = Precise.stringSub(last, change);
        }
        // timestamp and symbol operations don't belong in safeTicker
        // they should be done in the derived classes
        return this.extend(ticker, new Dictionary<string, object>() {
            { "bid", this.safeNumber(ticker, "bid") },
            { "bidVolume", this.safeNumber(ticker, "bidVolume") },
            { "ask", this.safeNumber(ticker, "ask") },
            { "askVolume", this.safeNumber(ticker, "askVolume") },
            { "high", this.safeNumber(ticker, "high") },
            { "low", this.safeNumber(ticker, "low") },
            { "open", this.parseNumber(open) },
            { "close", this.parseNumber(close) },
            { "last", this.parseNumber(last) },
            { "change", this.parseNumber(change) },
            { "percentage", this.parseNumber(percentage) },
            { "average", this.parseNumber(average) },
            { "vwap", this.parseNumber(vwap) },
            { "baseVolume", this.parseNumber(baseVolume) },
            { "quoteVolume", this.parseNumber(quoteVolume) },
            { "previousClose", this.safeNumber(ticker, "previousClose") },
        });
    }

    public async virtual Task<object> fetchOHLCV(object symbol, object timeframe = null, object since = null, object limit = null, object parameters = null)
    {
        timeframe ??= "1m";
        parameters ??= new Dictionary<string, object>();
        if (!isTrue(getValue(this.has, "fetchTrades")))
        {
throw new NotSupported(add(this.id, " fetchOHLCV() is not supported yet"));
        }
        await this.loadMarkets();
        var trades = await this.fetchTrades(symbol, since, limit, parameters);
        var ohlcvc = this.buildOHLCVC(trades, timeframe, since, limit);
        var result = new List<object>() {};
        for (var i = 0; isLessThan(i, getArrayLength(ohlcvc)); i++)
        {
            ((List<object>)result).Add(new List<object> {this.safeInteger(getValue(ohlcvc, i), 0), this.safeNumber(getValue(ohlcvc, i), 1), this.safeNumber(getValue(ohlcvc, i), 2), this.safeNumber(getValue(ohlcvc, i), 3), this.safeNumber(getValue(ohlcvc, i), 4), this.safeNumber(getValue(ohlcvc, i), 5)});
        }
        return ((List<object>) (result));
    }

    public async virtual Task<object> watchOHLCV(object symbol, object timeframe = null, object since = null, object limit = null, object parameters = null)
    {
        timeframe ??= "1m";
        parameters ??= new Dictionary<string, object>();
throw new NotSupported(add(this.id, " watchOHLCV() is not supported yet"));
    }

    public virtual object convertTradingViewToOHLCV(object ohlcvs, object timestamp = null, object open = null, object high = null, object low = null, object close = null, object volume = null, object ms = false)
    {
        timestamp ??= "t";
        open ??= "o";
        high ??= "h";
        low ??= "l";
        close ??= "c";
        volume ??= "v";
        var result = new List<object>() {};
        var timestamps = this.safeValue(ohlcvs, timestamp, new List<object>() {});
        var opens = this.safeValue(ohlcvs, open, new List<object>() {});
        var highs = this.safeValue(ohlcvs, high, new List<object>() {});
        var lows = this.safeValue(ohlcvs, low, new List<object>() {});
        var closes = this.safeValue(ohlcvs, close, new List<object>() {});
        var volumes = this.safeValue(ohlcvs, volume, new List<object>() {});
        for (var i = 0; isLessThan(i, getArrayLength(timestamps)); i++)
        {
            ((List<object>)result).Add(new List<object>() {isTrue(ms) ? this.safeInteger(timestamps, i) : this.safeTimestamp(timestamps, i), this.safeValue(opens, i), this.safeValue(highs, i), this.safeValue(lows, i), this.safeValue(closes, i), this.safeValue(volumes, i)});
        }
        return ((List<object>) (result));
    }

    public virtual object convertOHLCVToTradingView(object ohlcvs, object timestamp = null, object open = null, object high = null, object low = null, object close = null, object volume = null, object ms = false)
    {
        timestamp ??= "t";
        open ??= "o";
        high ??= "h";
        low ??= "l";
        close ??= "c";
        volume ??= "v";
        var result = new Dictionary<string, object>() {};
        ((Dictionary<string, object>)result)[(string)timestamp] = new List<object>() {};
        ((Dictionary<string, object>)result)[(string)open] = new List<object>() {};
        ((Dictionary<string, object>)result)[(string)high] = new List<object>() {};
        ((Dictionary<string, object>)result)[(string)low] = new List<object>() {};
        ((Dictionary<string, object>)result)[(string)close] = new List<object>() {};
        ((Dictionary<string, object>)result)[(string)volume] = new List<object>() {};
        for (var i = 0; isLessThan(i, getArrayLength(ohlcvs)); i++)
        {
            var ts = isTrue(ms) ? getValue(getValue(ohlcvs, i), 0) : this.parseToInt(divide(getValue(getValue(ohlcvs, i), 0), 1000));
            ((List<object>)getValue(result, timestamp)).Add(ts);
            ((List<object>)getValue(result, open)).Add(getValue(getValue(ohlcvs, i), 1));
            ((List<object>)getValue(result, high)).Add(getValue(getValue(ohlcvs, i), 2));
            ((List<object>)getValue(result, low)).Add(getValue(getValue(ohlcvs, i), 3));
            ((List<object>)getValue(result, close)).Add(getValue(getValue(ohlcvs, i), 4));
            ((List<object>)getValue(result, volume)).Add(getValue(getValue(ohlcvs, i), 5));
        }
        return ((Dictionary<string, object>) (result));
    }

    public virtual object marketIds(object symbols)
    {
        if (isEqual(symbols, null))
        {
            return symbols;
        }
        var result = new List<object>() {};
        for (var i = 0; isLessThan(i, getArrayLength(symbols)); i++)
        {
            ((List<object>)result).Add(this.marketId(getValue(symbols, i)));
        }
        return result;
    }

    public virtual object marketSymbols(object symbols)
    {
        if (isEqual(symbols, null))
        {
            return symbols;
        }
        var result = new List<object>() {};
        for (var i = 0; isLessThan(i, getArrayLength(symbols)); i++)
        {
            ((List<object>)result).Add(this.symbol(getValue(symbols, i)));
        }
        return result;
    }

    public virtual object marketCodes(object codes)
    {
        if (isEqual(codes, null))
        {
            return codes;
        }
        var result = new List<object>() {};
        for (var i = 0; isLessThan(i, getArrayLength(codes)); i++)
        {
            ((List<object>)result).Add(this.commonCurrencyCode(getValue(codes, i)));
        }
        return result;
    }

    public virtual object parseBidsAsks(object bidasks, object priceKey = null, object amountKey = null)
    {
        priceKey ??= 0;
        amountKey ??= 1;
        bidasks = this.toArray(bidasks);
        var result = new List<object>() {};
        for (var i = 0; isLessThan(i, getArrayLength(bidasks)); i++)
        {
            ((List<object>)result).Add(this.parseBidAsk(getValue(bidasks, i), priceKey, amountKey));
        }
        return ((List<object>) (result));
    }

    public async virtual Task<object> fetchL2OrderBook(object symbol, object limit = null, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        var orderbook = await this.fetchOrderBook(symbol, limit, parameters);
        return this.extend(orderbook, new Dictionary<string, object>() {
            { "asks", this.sortBy(this.aggregate(getValue(orderbook, "asks")), 0) },
            { "bids", this.sortBy(this.aggregate(getValue(orderbook, "bids")), 0, true) },
        });
    }

    public virtual object filterBySymbol(object objects, object symbol = null)
    {
        if (isEqual(symbol, null))
        {
            return objects;
        }
        var result = new List<object>() {};
        for (var i = 0; isLessThan(i, getArrayLength(objects)); i++)
        {
            var objectSymbol = this.safeString(getValue(objects, i), "symbol");
            if (isEqual(objectSymbol, symbol))
            {
                ((List<object>)result).Add(getValue(objects, i));
            }
        }
        return result;
    }

    public virtual object parseOHLCV(object ohlcv, object market = null)
    {
        if (isTrue((ohlcv.GetType().IsGenericType && ohlcv.GetType().GetGenericTypeDefinition().IsAssignableFrom(typeof(List<>)))))
        {
            return new List<object> {this.safeInteger(ohlcv, 0), this.safeNumber(ohlcv, 1), this.safeNumber(ohlcv, 2), this.safeNumber(ohlcv, 3), this.safeNumber(ohlcv, 4), this.safeNumber(ohlcv, 5)};
        }
        return ohlcv;
    }

    public virtual object getNetwork(object network, object code)
    {
        network = ((string)network).ToUpper();
        var aliases = new Dictionary<string, object>() {
            { "ETHEREUM", "ETH" },
            { "ETHER", "ETH" },
            { "ERC20", "ETH" },
            { "ETH", "ETH" },
            { "TRC20", "TRX" },
            { "TRON", "TRX" },
            { "TRX", "TRX" },
            { "BEP20", "BSC" },
            { "BSC", "BSC" },
            { "HRC20", "HT" },
            { "HECO", "HT" },
            { "SPL", "SOL" },
            { "SOL", "SOL" },
            { "TERRA", "LUNA" },
            { "LUNA", "LUNA" },
            { "POLYGON", "MATIC" },
            { "MATIC", "MATIC" },
            { "EOS", "EOS" },
            { "WAVES", "WAVES" },
            { "AVALANCHE", "AVAX" },
            { "AVAX", "AVAX" },
            { "QTUM", "QTUM" },
            { "CHZ", "CHZ" },
            { "NEO", "NEO" },
            { "ONT", "ONT" },
            { "RON", "RON" },
        };
        if (isEqual(network, code))
        {
            return ((string) (network));
        } else if (((Dictionary<string,object>)aliases).ContainsKey((string)network))
        {
            return ((string) (getValue(aliases, network)));
        } else
        {
throw new NotSupported(add(add(add(this.id, " network "), network), " is not yet supported"));
        }
    }

    public virtual object networkCodeToId(object networkCode, object currencyCode = null)
    {
        /**
         * @ignore
         * @method
         * @name exchange#networkCodeToId
         * @description tries to convert the provided networkCode (which is expected to be an unified network code) to a network id. In order to achieve this, derived class needs to have 'options->networks' defined.
         * @param {string} networkCode unified network code
         * @param {string|undefined} currencyCode unified currency code, but this argument is not required by default, unless there is an exchange (like huobi) that needs an override of the method to be able to pass currencyCode argument additionally
         * @returns {[string|undefined]} exchange-specific network id
         */
        var networkIdsByCodes = this.safeValue(this.options, "networks", new Dictionary<string, object>() {});
        var networkId = this.safeString(networkIdsByCodes, networkCode);
        // for example, if 'ETH' is passed for networkCode, but 'ETH' key not defined in `options->networks` object
        if (isEqual(networkId, null))
        {
            if (isEqual(currencyCode, null))
            {
                // if currencyCode was not provided, then we just set passed value to networkId
                                networkId = (string)(networkCode);
            } else
            {
                // if currencyCode was provided, then we try to find if that currencyCode has a replacement (i.e. ERC20 for ETH)
                var defaultNetworkCodeReplacements = this.safeValue(this.options, "defaultNetworkCodeReplacements", new Dictionary<string, object>() {});
                if (((Dictionary<string,object>)defaultNetworkCodeReplacements).ContainsKey((string)currencyCode))
                {
                    // if there is a replacement for the passed networkCode, then we use it to find network-id in `options->networks` object
                    var replacementObject = getValue(defaultNetworkCodeReplacements, currencyCode); // i.e. { 'ERC20': 'ETH' }
                    var keys = new List<string>(((Dictionary<string,object>)replacementObject).Keys);
                    for (var i = 0; isLessThan(i, getArrayLength(keys)); i++)
                    {
                        var key = getValue(keys, i);
                        var value = getValue(replacementObject, key);
                        // if value matches to provided unified networkCode, then we use it's key to find network-id in `options->networks` object
                        if (isEqual(value, networkCode))
                        {
                            networkId = this.safeString(networkIdsByCodes, key);
                            break;
                        }
                    }
                }
                // if it wasn't found, we just set the provided value to network-id
                if (isEqual(networkId, null))
                {
                                        networkId = (string)(networkCode);
                }
            }
        }
        return ((string) (networkId));
    }

    public virtual object networkIdToCode(object networkId, object currencyCode = null)
    {
        /**
         * @ignore
         * @method
         * @name exchange#networkIdToCode
         * @description tries to convert the provided exchange-specific networkId to an unified network Code. In order to achieve this, derived class needs to have 'options->networksById' defined.
         * @param {string} networkId unified network code
         * @param {string|undefined} currencyCode unified currency code, but this argument is not required by default, unless there is an exchange (like huobi) that needs an override of the method to be able to pass currencyCode argument additionally
         * @returns {[string|undefined]} unified network code
         */
        var networkCodesByIds = this.safeValue(this.options, "networksById", new Dictionary<string, object>() {});
        var networkCode = this.safeString(networkCodesByIds, networkId, networkId);
        // replace mainnet network-codes (i.e. ERC20->ETH)
        if (!isEqual(currencyCode, null))
        {
            var defaultNetworkCodeReplacements = this.safeValue(this.options, "defaultNetworkCodeReplacements", new Dictionary<string, object>() {});
            if (((Dictionary<string,object>)defaultNetworkCodeReplacements).ContainsKey((string)currencyCode))
            {
                var replacementObject = this.safeValue(defaultNetworkCodeReplacements, currencyCode, new Dictionary<string, object>() {});
                networkCode = this.safeString(replacementObject, networkCode, networkCode);
            }
        }
        return ((string) (networkCode));
    }

    public virtual object networkCodesToIds(object networkCodes = null)
    {
        /**
         * @ignore
         * @method
         * @name exchange#networkCodesToIds
         * @description tries to convert the provided networkCode (which is expected to be an unified network code) to a network id. In order to achieve this, derived class needs to have 'options->networks' defined.
         * @param {[string]|undefined} networkCodes unified network codes
         * @returns {[string|undefined]} exchange-specific network ids
         */
        if (isEqual(networkCodes, null))
        {
            return ((List<object>) (null));
        }
        var ids = new List<object>() {};
        for (var i = 0; isLessThan(i, getArrayLength(networkCodes)); i++)
        {
            var networkCode = getValue(networkCodes, i);
            ((List<object>)ids).Add(this.networkCodeToId(networkCode));
        }
        return ((List<object>) (ids));
    }

    public virtual object handleNetworkCodeAndParams(object parameters)
    {
        var networkCodeInParams = this.safeString2(parameters, "networkCode", "network");
        if (!isEqual(networkCodeInParams, null))
        {
            parameters = this.omit(parameters, new List<object>() {"networkCode", "network"});
        }
        // if it was not defined by user, we should not set it from 'defaultNetworks', because handleNetworkCodeAndParams is for only request-side and thus we do not fill it with anything. We can only use 'defaultNetworks' after parsing response-side
        return ((List<object>) (new List<object>() {networkCodeInParams, parameters}));
    }

    public virtual object defaultNetworkCode(object currencyCode)
    {
        object defaultNetworkCode = null;
        var defaultNetworks = this.safeValue(this.options, "defaultNetworks", new Dictionary<string, object>() {});
        if (((Dictionary<string,object>)defaultNetworks).ContainsKey((string)currencyCode))
        {
            // if currency had set its network in "defaultNetworks", use it
            defaultNetworkCode = getValue(defaultNetworks, currencyCode);
        } else
        {
            // otherwise, try to use the global-scope 'defaultNetwork' value (even if that network is not supported by currency, it doesn't make any problem, this will be just used "at first" if currency supports this network at all)
            var defaultNetwork = this.safeValue(this.options, "defaultNetwork");
            if (!isEqual(defaultNetwork, null))
            {
                defaultNetworkCode = defaultNetwork;
            }
        }
        return defaultNetworkCode;
    }

    public virtual object selectNetworkCodeFromUnifiedNetworks(object currencyCode, object networkCode, object indexedNetworkEntries)
    {
        return this.selectNetworkKeyFromNetworks(currencyCode, networkCode, indexedNetworkEntries, true);
    }

    public virtual object selectNetworkIdFromRawNetworks(object currencyCode, object networkCode, object indexedNetworkEntries)
    {
        return this.selectNetworkKeyFromNetworks(currencyCode, networkCode, indexedNetworkEntries, false);
    }

    public virtual object selectNetworkKeyFromNetworks(object currencyCode, object networkCode, object indexedNetworkEntries, object isIndexedByUnifiedNetworkCode = false)
    {
        // this method is used against raw & unparse network entries, which are just indexed by network id
        object chosenNetworkId = null;
        var availableNetworkIds = new List<string>(((Dictionary<string,object>)indexedNetworkEntries).Keys);
        var responseNetworksLength = getArrayLength(availableNetworkIds);
        if (!isEqual(networkCode, null))
        {
            if (isEqual(responseNetworksLength, 0))
            {
throw new NotSupported(add(add(add(add(this.id, " - "), networkCode), " network did not return any result for "), currencyCode));
            } else
            {
                // if networkCode was provided by user, we should check it after response, as the referenced exchange doesn't support network-code during request
                var networkId = isTrue(isIndexedByUnifiedNetworkCode) ? networkCode : this.networkCodeToId(networkCode, currencyCode);
                if (((Dictionary<string,object>)indexedNetworkEntries).ContainsKey((string)networkId))
                {
                    chosenNetworkId = networkId;
                } else
                {
throw new NotSupported(add(add(add(add(add(add(this.id, " - "), networkId), " network was not found for "), currencyCode), ", use one of "), String.Join(", ", availableNetworkIds)));
                }
            }
        } else
        {
            if (isEqual(responseNetworksLength, 0))
            {
throw new NotSupported(add(add(this.id, " - no networks were returned for "), currencyCode));
            } else
            {
                // if networkCode was not provided by user, then we try to use the default network (if it was defined in "defaultNetworks"), otherwise, we just return the first network entry
                var defaultNetworkCode = this.defaultNetworkCode(currencyCode);
                var defaultNetworkId = isTrue(isIndexedByUnifiedNetworkCode) ? defaultNetworkCode : this.networkCodeToId(defaultNetworkCode, currencyCode);
                chosenNetworkId = (((Dictionary<string,object>)indexedNetworkEntries).ContainsKey((string)defaultNetworkId)) ? defaultNetworkId : getValue(availableNetworkIds, 0);
            }
        }
        return chosenNetworkId;
    }

    public virtual object safeNumber2(object dictionary, object key1, object key2, object d = null)
    {
        var value = this.safeString2(dictionary, key1, key2);
        return ((object) (this.parseNumber(value, d)));
    }

    public virtual object parseOrderBook(object orderbook, object symbol, object timestamp = null, object bidsKey = null, object asksKey = null, object priceKey = null, object amountKey = null)
    {
        bidsKey ??= "bids";
        asksKey ??= "asks";
        priceKey ??= 0;
        amountKey ??= 1;
        var bids = this.parseBidsAsks(this.safeValue(orderbook, bidsKey, new List<object>() {}), priceKey, amountKey);
        var asks = this.parseBidsAsks(this.safeValue(orderbook, asksKey, new List<object>() {}), priceKey, amountKey);
        return ((object)new Dictionary<string, object>() {
            { "symbol", symbol },
            { "bids", this.sortBy(bids, 0, true) },
            { "asks", this.sortBy(asks, 0) },
            { "timestamp", timestamp },
            { "datetime", this.iso8601(timestamp) },
            { "nonce", null },
        });
    }

    public virtual object parseOHLCVs(object ohlcvs, object market = null, object timeframe = null, object since = null, object limit = null)
    {
        timeframe ??= "1m";
        var results = new List<object>() {};
        for (var i = 0; isLessThan(i, getArrayLength(ohlcvs)); i++)
        {
            ((List<object>)results).Add(this.parseOHLCV(getValue(ohlcvs, i), market));
        }
        var sorted = this.sortBy(results, 0);
        var tail = (isEqual(since, null));
        return ((List<object>) (((object)this.filterBySinceLimit(sorted, since, limit, 0, tail))));
    }

    public virtual object parseLeverageTiers(object response, object symbols = null, object marketIdKey = null)
    {
        // marketIdKey should only be undefined when response is a dictionary
                symbols = (List<object>)(this.marketSymbols(symbols));
        var tiers = new Dictionary<string, object>() {};
        for (var i = 0; isLessThan(i, getArrayLength(response)); i++)
        {
            var item = getValue(response, i);
            var id = this.safeString(item, marketIdKey);
            var market = this.safeMarket(id, null, null, this.safeString(this.options, "defaultType"));
            var symbol = getValue(market, "symbol");
            var contract = this.safeValue(market, "contract", false);
            if (isTrue(contract) && ((isEqual(symbols, null)) || isTrue(this.inArray(symbol, symbols))))
            {
                ((Dictionary<string, object>)tiers)[(string)symbol] = this.parseMarketLeverageTiers(item, market);
            }
        }
        return ((Dictionary<string, object>) (tiers));
    }

    public async virtual Task<object> loadTradingLimits(object symbols = null, object reload = false, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        if (isTrue(getValue(this.has, "fetchTradingLimits")))
        {
            if (isTrue(reload) || !(((Dictionary<string,object>)this.options).ContainsKey((string)"limitsLoaded")))
            {
                var response = await this.fetchTradingLimits(symbols);
                for (var i = 0; isLessThan(i, getArrayLength(symbols)); i++)
                {
                    var symbol = getValue(symbols, i);
                                        ((Dictionary<string, object>)this.markets)[(string)symbol] = (undefined)(this.deepExtend(getValue(this.markets, symbol), getValue(response, symbol)));
                }
                ((Dictionary<string, object>)this.options)["limitsLoaded"] = this.milliseconds();
            }
        }
        return this.markets;
    }

    public virtual object parsePositions(object positions, object symbols = null, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
                symbols = (List<object>)(this.marketSymbols(symbols));
        positions = this.toArray(positions);
        var result = new List<object>() {};
        for (var i = 0; isLessThan(i, getArrayLength(positions)); i++)
        {
            var position = this.extend(this.parsePosition(getValue(positions, i), null), parameters);
            ((List<object>)result).Add(position);
        }
        return this.filterByArray(result, "symbol", symbols, false);
    }

    public virtual object parseAccounts(object accounts, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        accounts = this.toArray(accounts);
        var result = new List<object>() {};
        for (var i = 0; isLessThan(i, getArrayLength(accounts)); i++)
        {
            var account = this.extend(this.parseAccount(getValue(accounts, i)), parameters);
            ((List<object>)result).Add(account);
        }
        return ((List<object>) (result));
    }

    public virtual object parseTrades(object trades, object market = null, object since = null, object limit = null, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        trades = this.toArray(trades);
        var result = new List<object>() {};
        for (var i = 0; isLessThan(i, getArrayLength(trades)); i++)
        {
            var trade = this.extend(this.parseTrade(getValue(trades, i), market), parameters);
            ((List<object>)result).Add(trade);
        }
                result = (List<object>)(this.sortBy2(result, "timestamp", "id"));
        var symbol = (!isEqual(market, null)) ? getValue(market, "symbol") : null;
        var tail = (isEqual(since, null));
        return ((List<object>) (this.filterBySymbolSinceLimit(result, symbol, since, limit, tail)));
    }

    public virtual object parseTransactions(object transactions, object currency = null, object since = null, object limit = null, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        transactions = this.toArray(transactions);
        var result = new List<object>() {};
        for (var i = 0; isLessThan(i, getArrayLength(transactions)); i++)
        {
            var transaction = this.extend(this.parseTransaction(getValue(transactions, i), currency), parameters);
            ((List<object>)result).Add(transaction);
        }
                result = (List<object>)(this.sortBy(result, "timestamp"));
        var code = (!isEqual(currency, null)) ? getValue(currency, "code") : null;
        var tail = (isEqual(since, null));
        return this.filterByCurrencySinceLimit(result, code, since, limit, tail);
    }

    public virtual object parseTransfers(object transfers, object currency = null, object since = null, object limit = null, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        transfers = this.toArray(transfers);
        var result = new List<object>() {};
        for (var i = 0; isLessThan(i, getArrayLength(transfers)); i++)
        {
            var transfer = this.extend(this.parseTransfer(getValue(transfers, i), currency), parameters);
            ((List<object>)result).Add(transfer);
        }
                result = (List<object>)(this.sortBy(result, "timestamp"));
        var code = (!isEqual(currency, null)) ? getValue(currency, "code") : null;
        var tail = (isEqual(since, null));
        return this.filterByCurrencySinceLimit(result, code, since, limit, tail);
    }

    public virtual object parseLedger(object data, object currency = null, object since = null, object limit = null, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        var result = new List<object>() {};
        var arrayData = this.toArray(data);
        for (var i = 0; isLessThan(i, getArrayLength(arrayData)); i++)
        {
            var itemOrItems = this.parseLedgerEntry(getValue(arrayData, i), currency);
            if (isTrue((itemOrItems.GetType().IsGenericType && itemOrItems.GetType().GetGenericTypeDefinition().IsAssignableFrom(typeof(List<>)))))
            {
                for (var j = 0; isLessThan(j, getArrayLength(itemOrItems)); j++)
                {
                    ((List<object>)result).Add(this.extend(getValue(itemOrItems, j), parameters));
                }
            } else
            {
                ((List<object>)result).Add(this.extend(itemOrItems, parameters));
            }
        }
                result = (List<object>)(this.sortBy(result, "timestamp"));
        var code = (!isEqual(currency, null)) ? getValue(currency, "code") : null;
        var tail = (isEqual(since, null));
        return this.filterByCurrencySinceLimit(result, code, since, limit, tail);
    }

    public virtual object nonce()
    {
        return ((object) (this.seconds()));
    }

    public virtual object setHeaders(object headers)
    {
        return headers;
    }

    public virtual object marketId(object symbol)
    {
        var market = this.market(symbol);
        if (!isEqual(market, null))
        {
            return ((string) (getValue(market, "id")));
        }
        return ((string) (symbol));
    }

    public virtual object symbol(object symbol)
    {
        var market = this.market(symbol);
        return ((string) (this.safeString(market, "symbol", symbol)));
    }

    public virtual object resolvePath(object path, object parameters)
    {
        return ((List<object>) (new List<Task<object>> {this.implodeParams(path, parameters), this.omit(parameters, this.extractParams(path))}));
    }

    public virtual object filterByArray(object objects, object key, object values = null, object indexed = true)
    {
        objects = this.toArray(objects);
        // return all of them if no values were passed
        if (isEqual(values, null) || !isTrue(values))
        {
            return isTrue(indexed) ? this.indexBy(objects, key) : objects;
        }
        var results = new List<object>() {};
        for (var i = 0; isLessThan(i, getArrayLength(objects)); i++)
        {
            if (isTrue(this.inArray(getValue(getValue(objects, i), key), values)))
            {
                ((List<object>)results).Add(getValue(objects, i));
            }
        }
        return isTrue(indexed) ? this.indexBy(results, key) : results;
    }

    public async virtual Task<object> fetch2(object path, object api = null, object method = null, object parameters = null, object headers = null, object body = null, object config = null, object context = null)
    {
        api ??= "public";
        method ??= "GET";
        parameters ??= new Dictionary<string, object>();
        config ??= new Dictionary<string, object>();
        context ??= new Dictionary<string, object>();
        if (isTrue(this.enableRateLimit))
        {
            var cost = this.calculateRateLimiterCost(api, method, path, parameters, config, context);
            await this.callAsync("throttle", cost);
        }
        this.lastRestRequestTimestamp = this.milliseconds();
        var request = this.sign(path, api, method, parameters, headers, body);
        return await this.fetch(getValue(request, "url"), getValue(request, "method"), getValue(request, "headers"), getValue(request, "body"));
    }

    public async virtual Task<object> request(object path, object api = null, object method = null, object parameters = null, object headers = null, object body = null, object config = null, object context = null)
    {
        api ??= "public";
        method ??= "GET";
        parameters ??= new Dictionary<string, object>();
        config ??= new Dictionary<string, object>();
        context ??= new Dictionary<string, object>();
        return await this.fetch2(path, api, method, parameters, headers, body, config, context);
    }

    public async virtual Task<object> loadAccounts(object reload = false, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        if (isTrue(reload))
        {
            this.accounts = await this.fetchAccounts(parameters);
        } else
        {
            if (isTrue(this.accounts))
            {
                return this.accounts;
            } else
            {
                this.accounts = await this.fetchAccounts(parameters);
            }
        }
        this.accountsById = ((object)this.indexBy(this.accounts, "id"));
        return this.accounts;
    }

    public async virtual Task<object> fetchOHLCVC(object symbol, object timeframe = null, object since = null, object limit = null, object parameters = null)
    {
        timeframe ??= "1m";
        parameters ??= new Dictionary<string, object>();
        if (!isTrue(getValue(this.has, "fetchTrades")))
        {
throw new NotSupported(add(this.id, " fetchOHLCV() is not supported yet"));
        }
        await this.loadMarkets();
        var trades = await this.fetchTrades(symbol, since, limit, parameters);
        return ((List<object>) (this.buildOHLCVC(trades, timeframe, since, limit)));
    }

    public virtual object parseTradingViewOHLCV(object ohlcvs, object market = null, object timeframe = null, object since = null, object limit = null)
    {
        timeframe ??= "1m";
        var result = this.convertTradingViewToOHLCV(ohlcvs);
        return ((List<object>) (this.parseOHLCVs(result, market, timeframe, since, limit)));
    }

    public async virtual Task<object> editLimitBuyOrder(object id, object symbol, object amount, object price = null, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        return await this.editLimitOrder(id, symbol, "buy", amount, price, parameters);
    }

    public async virtual Task<object> editLimitSellOrder(object id, object symbol, object amount, object price = null, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        return await this.editLimitOrder(id, symbol, "sell", amount, price, parameters);
    }

    public async virtual Task<object> editLimitOrder(object id, object symbol, object side, object amount, object price = null, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        return await this.editOrder(id, symbol, "limit", side, amount, price, parameters);
    }

    public async virtual Task<object> editOrder(object id, object symbol, object type, object side, object amount, object price = null, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        await this.cancelOrder(id, symbol);
        return await this.createOrder(symbol, type, side, amount, price, parameters);
    }

    public async virtual Task<object> fetchPermissions(object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
throw new NotSupported(add(this.id, " fetchPermissions() is not supported yet"));
    }

    public async virtual Task<object> fetchPosition(object symbol, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
throw new NotSupported(add(this.id, " fetchPosition() is not supported yet"));
    }

    public async virtual Task<object> fetchPositions(object symbols = null, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
throw new NotSupported(add(this.id, " fetchPositions() is not supported yet"));
    }

    public async virtual Task<object> fetchPositionsRisk(object symbols = null, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
throw new NotSupported(add(this.id, " fetchPositionsRisk() is not supported yet"));
    }

    public async virtual Task<object> fetchBidsAsks(object symbols = null, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
throw new NotSupported(add(this.id, " fetchBidsAsks() is not supported yet"));
    }

    public virtual object parseBidAsk(object bidask, object priceKey = null, object amountKey = null)
    {
        priceKey ??= 0;
        amountKey ??= 1;
        var price = this.safeNumber(bidask, priceKey);
        var amount = this.safeNumber(bidask, amountKey);
        return ((List<object>) (new List<object>() {price, amount}));
    }

    public virtual object safeCurrency(object currencyId, object currency = null)
    {
        if ((isEqual(currencyId, null)) && (!isEqual(currency, null)))
        {
            return currency;
        }
        if ((!isEqual(this.currencies_by_id, null)) && (((Dictionary<string,object>)this.currencies_by_id).ContainsKey((string)currencyId)) && (!isEqual(getValue(this.currencies_by_id, currencyId), null)))
        {
            return getValue(this.currencies_by_id, currencyId);
        }
        var code = currencyId;
        if (!isEqual(currencyId, null))
        {
            code = this.commonCurrencyCode(((string)currencyId).ToUpper());
        }
        return new Dictionary<string, object>() {
            { "id", currencyId },
            { "code", code },
        };
    }

    public virtual object safeMarket(object marketId = null, object market = null, object delimiter = null, object marketType = null)
    {
        var result = new Dictionary<string, object>() {
            { "id", marketId },
            { "symbol", marketId },
            { "base", null },
            { "quote", null },
            { "baseId", null },
            { "quoteId", null },
            { "active", null },
            { "type", null },
            { "linear", null },
            { "inverse", null },
            { "spot", false },
            { "swap", false },
            { "future", false },
            { "option", false },
            { "margin", false },
            { "contract", false },
            { "contractSize", null },
            { "expiry", null },
            { "expiryDatetime", null },
            { "optionType", null },
            { "strike", null },
            { "settle", null },
            { "settleId", null },
            { "precision", new Dictionary<string, object>() {
                { "amount", null },
                { "price", null },
            } },
            { "limits", new Dictionary<string, object>() {
                { "amount", new Dictionary<string, object>() {
                    { "min", null },
                    { "max", null },
                } },
                { "price", new Dictionary<string, object>() {
                    { "min", null },
                    { "max", null },
                } },
                { "cost", new Dictionary<string, object>() {
                    { "min", null },
                    { "max", null },
                } },
            } },
            { "info", null },
        };
        if (!isEqual(marketId, null))
        {
            if ((!isEqual(this.markets_by_id, null)) && (((Dictionary<string,object>)this.markets_by_id).ContainsKey((string)marketId)))
            {
                var markets = getValue(this.markets_by_id, marketId);
                var numMarkets = getArrayLength(markets);
                if (isEqual(numMarkets, 1))
                {
                    return getValue(markets, 0);
                } else
                {
                    if (isEqual(marketType, null))
                    {
throw new ArgumentsRequired(add(add(add(this.id, " safeMarket() requires a fourth argument for "), marketId), " to disambiguate between different markets with the same market id"));
                    }
                    for (var i = 0; isLessThan(i, getArrayLength(markets)); i++)
                    {
                        var market = getValue(markets, i);
                        if (isTrue(getValue(market, marketType)))
                        {
                            return market;
                        }
                    }
                }
            } else if (!isEqual(delimiter, null))
            {
                var parts = ((string)marketId).Split(delimiter).ToList<object>();
                var partsLength = getArrayLength(parts);
                if (isEqual(partsLength, 2))
                {
                    ((Dictionary<string, object>)result)["baseId"] = this.safeString(parts, 0);
                    ((Dictionary<string, object>)result)["quoteId"] = this.safeString(parts, 1);
                    ((Dictionary<string, object>)result)["base"] = this.safeCurrencyCode(getValue(result, "baseId"));
                    ((Dictionary<string, object>)result)["quote"] = this.safeCurrencyCode(getValue(result, "quoteId"));
                    ((Dictionary<string, object>)result)["symbol"] = add(add(getValue(result, "base"), "/"), getValue(result, "quote"));
                    return result;
                } else
                {
                    return result;
                }
            }
        }
        if (!isEqual(market, null))
        {
            return market;
        }
        return result;
    }

    public virtual object checkRequiredCredentials(object error = true)
    {
        var keys = new List<string>(((Dictionary<string,object>)this.requiredCredentials).Keys);
        for (var i = 0; isLessThan(i, getArrayLength(keys)); i++)
        {
            var key = getValue(keys, i);
            if (isTrue(getValue(this.requiredCredentials, key)) && !isTrue(getValue(this, key)))
            {
                if (isTrue(error))
                {
throw new AuthenticationError(add(add(add(this.id, " requires \""), key), "\" credential"));
                } else
                {
                    return ((bool) (false));
                }
            }
        }
        return ((bool) (true));
    }

    public virtual object oath()
    {
        if (!isEqual(this.twofa, null))
        {
            return ((string) (this.totp(this.twofa)));
        } else
        {
throw new ExchangeError(add(this.id, " exchange.twofa has not been set for 2FA Two-Factor Authentication"));
        }
    }

    public async virtual Task<object> fetchBalance(object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
throw new NotSupported(add(this.id, " fetchBalance() is not supported yet"));
    }

    public async virtual Task<object> watchBalance(object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
throw new NotSupported(add(this.id, " watchBalance() is not supported yet"));
    }

    public async virtual Task<object> fetchPartialBalance(object part, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        var balance = await this.fetchBalance(parameters);
        return getValue(balance, part);
    }

    public async virtual Task<object> fetchFreeBalance(object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        return await this.fetchPartialBalance("free", parameters);
    }

    public async virtual Task<object> fetchUsedBalance(object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        return await this.fetchPartialBalance("used", parameters);
    }

    public async virtual Task<object> fetchTotalBalance(object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        return await this.fetchPartialBalance("total", parameters);
    }

    public async virtual Task<object> fetchStatus(object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        if (isTrue(getValue(this.has, "fetchTime")))
        {
            var time = await this.fetchTime(parameters);
            this.status = this.extend(this.status, new Dictionary<string, object>() {
                { "updated", time },
            });
        }
        if (!(((Dictionary<string,object>)this.status).ContainsKey((string)"info")))
        {
            ((Dictionary<string, object>)this.status)["info"] = null;
        }
        return this.status;
    }

    public async virtual Task<object> fetchFundingFee(object code, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        var warnOnFetchFundingFee = this.safeValue(this.options, "warnOnFetchFundingFee", true);
        if (isTrue(warnOnFetchFundingFee))
        {
throw new NotSupported(add(this.id, " fetchFundingFee() method is deprecated, it will be removed in July 2022, please, use fetchTransactionFee() or set exchange.options[\"warnOnFetchFundingFee\"] = false to suppress this warning"));
        }
        return await this.fetchTransactionFee(code, parameters);
    }

    public async virtual Task<object> fetchFundingFees(object codes = null, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        var warnOnFetchFundingFees = this.safeValue(this.options, "warnOnFetchFundingFees", true);
        if (isTrue(warnOnFetchFundingFees))
        {
throw new NotSupported(add(this.id, " fetchFundingFees() method is deprecated, it will be removed in July 2022. Please, use fetchTransactionFees() or set exchange.options[\"warnOnFetchFundingFees\"] = false to suppress this warning"));
        }
        return await this.fetchTransactionFees(codes, parameters);
    }

    public async virtual Task<object> fetchTransactionFee(object code, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        if (!isTrue(getValue(this.has, "fetchTransactionFees")))
        {
throw new NotSupported(add(this.id, " fetchTransactionFee() is not supported yet"));
        }
        return await this.fetchTransactionFees(new List<object>() {code}, parameters);
    }

    public async virtual Task<object> fetchTransactionFees(object codes = null, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
throw new NotSupported(add(this.id, " fetchTransactionFees() is not supported yet"));
    }

    public async virtual Task<object> fetchDepositWithdrawFees(object codes = null, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
throw new NotSupported(add(this.id, " fetchDepositWithdrawFees() is not supported yet"));
    }

    public async virtual Task<object> fetchDepositWithdrawFee(object code, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        if (!isTrue(getValue(this.has, "fetchDepositWithdrawFees")))
        {
throw new NotSupported(add(this.id, " fetchDepositWithdrawFee() is not supported yet"));
        }
        var fees = await this.fetchDepositWithdrawFees(new List<object>() {code}, parameters);
        return this.safeValue(fees, code);
    }

    public virtual object getSupportedMapping(object key, object mapping = null)
    {
        mapping ??= new Dictionary<string, object>();
        if (((Dictionary<string,object>)mapping).ContainsKey((string)key))
        {
            return getValue(mapping, key);
        } else
        {
throw new NotSupported(add(add(add(this.id, " "), key), " does not have a value in mapping"));
        }
    }

    public async virtual Task<object> fetchBorrowRate(object code, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        await this.loadMarkets();
        if (!isTrue(getValue(this.has, "fetchBorrowRates")))
        {
throw new NotSupported(add(this.id, " fetchBorrowRate() is not supported yet"));
        }
        var borrowRates = await this.fetchBorrowRates(parameters);
        var rate = this.safeValue(borrowRates, code);
        if (isEqual(rate, null))
        {
throw new ExchangeError(add(add(this.id, " fetchBorrowRate() could not find the borrow rate for currency code "), code));
        }
        return rate;
    }

    public virtual object handleOptionAndParams(object parameters, object methodName, object optionName, object defaultValue = null)
    {
        // This method can be used to obtain method specific properties, i.e: this.handleOptionAndParams (params, 'fetchPosition', 'marginMode', 'isolated')
        var defaultOptionName = add("default", this.capitalize(optionName)); // we also need to check the 'defaultXyzWhatever'
        // check if params contain the key
        var value = this.safeValue2(parameters, optionName, defaultOptionName);
        if (!isEqual(value, null))
        {
            parameters = this.omit(parameters, new List<object>() {optionName, defaultOptionName});
        } else
        {
            // check if exchange has properties for this method
            var exchangeWideMethodOptions = this.safeValue(this.options, methodName);
            if (!isEqual(exchangeWideMethodOptions, null))
            {
                // check if the option is defined in this method's props
                value = this.safeValue2(exchangeWideMethodOptions, optionName, defaultOptionName);
            }
            if (isEqual(value, null))
            {
                // if it's still undefined, check if global exchange-wide option exists
                value = this.safeValue2(this.options, optionName, defaultOptionName);
            }
            // if it's still undefined, use the default value
            value = (!isEqual(value, null)) ? value : defaultValue;
        }
        return ((List<object>) (new List<object>() {value, parameters}));
    }

    public virtual object handleOption(object methodName, object optionName, object defaultValue = null)
    {
        // eslint-disable-next-line no-unused-vars
        var resultemptyVariable = this.handleOptionAndParams(new Dictionary<string, object>() {}, methodName, optionName, defaultValue);
        var result = ((List<object>) resultemptyVariable)[0];
        var empty = ((List<object>) resultemptyVariable)[1];
        return result;
    }

    public virtual object handleMarketTypeAndParams(object methodName, object market = null, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        var defaultType = this.safeString2(this.options, "defaultType", "type", "spot");
        var methodOptions = this.safeValue(this.options, methodName);
        var methodType = defaultType;
        if (!isEqual(methodOptions, null))
        {
            if ((methodOptions).GetType() == typeof(string))
            {
                methodType = methodOptions;
            } else
            {
                methodType = this.safeString2(methodOptions, "defaultType", "type", methodType);
            }
        }
        var marketType = (isEqual(market, null)) ? methodType : getValue(market, "type");
        var type = this.safeString2(parameters, "defaultType", "type", marketType);
                parameters = (Dictionary<string, object>)(this.omit(parameters, new List<object>() {"defaultType", "type"}));
        return new List<object>() {type, parameters};
    }

    public virtual object handleSubTypeAndParams(object methodName, object market = null, object parameters = null, object defaultValue = null)
    {
        parameters ??= new Dictionary<string, object>();
        object subType = null;
        // if set in params, it takes precedence
        var subTypeInParams = this.safeString2(parameters, "subType", "defaultSubType");
        // avoid omitting if it's not present
        if (!isEqual(subTypeInParams, null))
        {
            subType = subTypeInParams;
                        parameters = (Dictionary<string, object>)(this.omit(parameters, new List<object>() {"subType", "defaultSubType"}));
        } else
        {
            // at first, check from market object
            if (!isEqual(market, null))
            {
                if (isTrue(getValue(market, "linear")))
                {
                    subType = "linear";
                } else if (isTrue(getValue(market, "inverse")))
                {
                    subType = "inverse";
                }
            }
            // if it was not defined in market object
            if (isEqual(subType, null))
            {
                var values = this.handleOptionAndParams(null, methodName, "subType", defaultValue); // no need to re-test params here
                subType = getValue(values, 0);
            }
        }
        return ((List<object>) (new List<object>() {subType, parameters}));
    }

    public virtual object handleMarginModeAndParams(object methodName, object parameters = null, object defaultValue = null)
    {
        /**
        * @ignore
        * @method
        * @param {object} params extra parameters specific to the exchange api endpoint
        * @returns {[string|undefined, object]} the marginMode in lowercase as specified by params["marginMode"], params["defaultMarginMode"] this.options["marginMode"] or this.options["defaultMarginMode"]
        */
        parameters ??= new Dictionary<string, object>();
        return ((List<object>) (this.handleOptionAndParams(parameters, methodName, "marginMode", defaultValue)));
    }

    public virtual object throwExactlyMatchedException(object exact, object str, object message)
    {
        if (((Dictionary<string,object>)exact).ContainsKey((string)str))
        {
throw new Exception ((string) message);
        }
    }

    public virtual object throwBroadlyMatchedException(object broad, object str, object message)
    {
        var broadKey = this.findBroadlyMatchedKey(broad, str);
        if (!isEqual(broadKey, null))
        {
throw new Exception ((string) message);
        }
    }

    public virtual object findBroadlyMatchedKey(object broad, object str)
    {
        // a helper for matching error strings exactly vs broadly
        var keys = new List<string>(((Dictionary<string,object>)broad).Keys);
        for (var i = 0; isLessThan(i, getArrayLength(keys)); i++)
        {
            var key = getValue(keys, i);
            if (!isEqual(str, null))
            {
                if (isGreaterThanOrEqual(getIndexOf(str, key), 0))
                {
                    return ((string) (key));
                }
            }
        }
        return ((string) (null));
    }

    public virtual object handleErrors(object statusCode, object statusText, object url, object method, object responseHeaders, object responseBody, object response, object requestHeaders, object requestBody)
    {
        // it is a stub method that must be overrided in the derived exchange classes
        // throw new NotSupported (this.id + ' handleErrors() not implemented yet');
        return null;
    }

    public virtual object calculateRateLimiterCost(object api, object method, object path, object parameters, object config = null, object context = null)
    {
        config ??= new Dictionary<string, object>();
        context ??= new Dictionary<string, object>();
        return this.safeValue(config, "cost", 1);
    }

    public async virtual Task<object> fetchTicker(object symbol, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        if (isTrue(getValue(this.has, "fetchTickers")))
        {
            await this.loadMarkets();
            var market = this.market(symbol);
                        symbol = (string)(getValue(market, "symbol"));
            var tickers = await this.fetchTickers(new List<object>() {symbol}, parameters);
            var ticker = this.safeValue(tickers, symbol);
            if (isEqual(ticker, null))
            {
throw new NullResponse(add(add(this.id, " fetchTickers() could not find a ticker for "), symbol));
            } else
            {
                return ticker;
            }
        } else
        {
throw new NotSupported(add(this.id, " fetchTicker() is not supported yet"));
        }
    }

    public async virtual Task<object> watchTicker(object symbol, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
throw new NotSupported(add(this.id, " watchTicker() is not supported yet"));
    }

    public async virtual Task<object> fetchTickers(object symbols = null, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
throw new NotSupported(add(this.id, " fetchTickers() is not supported yet"));
    }

    public async virtual Task<object> watchTickers(object symbols = null, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
throw new NotSupported(add(this.id, " watchTickers() is not supported yet"));
    }

    public async virtual Task<object> fetchOrder(object id, object symbol = null, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
throw new NotSupported(add(this.id, " fetchOrder() is not supported yet"));
    }

    public async virtual Task<object> fetchOrderStatus(object id, object symbol = null, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        var order = await this.fetchOrder(id, symbol, parameters);
        return ((string) (getValue(order, "status")));
    }

    public async virtual Task<object> fetchUnifiedOrder(object order, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        return await this.fetchOrder(this.safeValue(order, "id"), this.safeValue(order, "symbol"), parameters);
    }

    public async virtual Task<object> createOrder(object symbol, object type, object side, object amount, object price = null, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
throw new NotSupported(add(this.id, " createOrder() is not supported yet"));
    }

    public async virtual Task<object> cancelOrder(object id, object symbol = null, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
throw new NotSupported(add(this.id, " cancelOrder() is not supported yet"));
    }

    public async virtual Task<object> cancelUnifiedOrder(object order, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        return this.cancelOrder(this.safeValue(order, "id"), this.safeValue(order, "symbol"), parameters);
    }

    public async virtual Task<object> fetchOrders(object symbol = null, object since = null, object limit = null, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
throw new NotSupported(add(this.id, " fetchOrders() is not supported yet"));
    }

    public async virtual Task<object> watchOrders(object symbol = null, object since = null, object limit = null, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
throw new NotSupported(add(this.id, " watchOrders() is not supported yet"));
    }

    public async virtual Task<object> fetchOpenOrders(object symbol = null, object since = null, object limit = null, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
throw new NotSupported(add(this.id, " fetchOpenOrders() is not supported yet"));
    }

    public async virtual Task<object> fetchClosedOrders(object symbol = null, object since = null, object limit = null, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
throw new NotSupported(add(this.id, " fetchClosedOrders() is not supported yet"));
    }

    public async virtual Task<object> fetchMyTrades(object symbol = null, object since = null, object limit = null, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
throw new NotSupported(add(this.id, " fetchMyTrades() is not supported yet"));
    }

    public async virtual Task<object> watchMyTrades(object symbol = null, object since = null, object limit = null, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
throw new NotSupported(add(this.id, " watchMyTrades() is not supported yet"));
    }

    public async virtual Task<object> fetchTransactions(object symbol = null, object since = null, object limit = null, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
throw new NotSupported(add(this.id, " fetchTransactions() is not supported yet"));
    }

    public async virtual Task<object> fetchDeposits(object symbol = null, object since = null, object limit = null, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
throw new NotSupported(add(this.id, " fetchDeposits() is not supported yet"));
    }

    public async virtual Task<object> fetchWithdrawals(object symbol = null, object since = null, object limit = null, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
throw new NotSupported(add(this.id, " fetchWithdrawals() is not supported yet"));
    }

    public virtual object parseLastPrice(object price, object market = null)
    {
throw new NotSupported(add(this.id, " parseLastPrice() is not supported yet"));
    }

    public async virtual Task<object> fetchDepositAddress(object code, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        if (isTrue(getValue(this.has, "fetchDepositAddresses")))
        {
            var depositAddresses = await this.fetchDepositAddresses(new List<object>() {code}, parameters);
            var depositAddress = this.safeValue(depositAddresses, code);
            if (isEqual(depositAddress, null))
            {
throw new InvalidAddress(add(add(add(this.id, " fetchDepositAddress() could not find a deposit address for "), code), ", make sure you have created a corresponding deposit address in your wallet on the exchange website"));
            } else
            {
                return depositAddress;
            }
        } else
        {
throw new NotSupported(add(this.id, " fetchDepositAddress() is not supported yet"));
        }
    }

    public virtual object account()
    {
        return new Dictionary<string, object>() {
            { "free", null },
            { "used", null },
            { "total", null },
        };
    }

    public virtual object commonCurrencyCode(object currency)
    {
        if (!isTrue(this.substituteCommonCurrencyCodes))
        {
            return ((string) (currency));
        }
        return ((string) (this.safeString(this.commonCurrencies, currency, currency)));
    }

    public virtual object currency(object code)
    {
        if (isEqual(this.currencies, null))
        {
throw new ExchangeError(add(this.id, " currencies not loaded"));
        }
        if ((code).GetType() == typeof(string))
        {
            if (((Dictionary<string,object>)this.currencies).ContainsKey((string)code))
            {
                return getValue(this.currencies, code);
            } else if (((Dictionary<string,object>)this.currencies_by_id).ContainsKey((string)code))
            {
                return getValue(this.currencies_by_id, code);
            }
        }
throw new ExchangeError(add(add(this.id, " does not have currency code "), code));
    }

    public virtual object market(object symbol)
    {
        if (isEqual(this.markets, null))
        {
throw new ExchangeError(add(this.id, " markets not loaded"));
        }
        if ((symbol).GetType() == typeof(string))
        {
            if (((Dictionary<string,object>)this.markets).ContainsKey((string)symbol))
            {
                return getValue(this.markets, symbol);
            } else if (((Dictionary<string,object>)this.markets_by_id).ContainsKey((string)symbol))
            {
                var markets = getValue(this.markets_by_id, symbol);
                var defaultType = this.safeString2(this.options, "defaultType", "defaultSubType", "spot");
                for (var i = 0; isLessThan(i, getArrayLength(markets)); i++)
                {
                    var market = getValue(markets, i);
                    if (isTrue(getValue(market, defaultType)))
                    {
                        return market;
                    }
                }
                return getValue(markets, 0);
            }
        }
throw new BadSymbol(add(add(this.id, " does not have market symbol "), symbol));
    }

    public virtual object handleWithdrawTagAndParams(object tag, object parameters)
    {
        if ((tag).GetType() == typeof(Dictionary<string, object>))
        {
            parameters = this.extend(tag, parameters);
            tag = null;
        }
        if (isEqual(tag, null))
        {
            tag = this.safeString(parameters, "tag");
            if (!isEqual(tag, null))
            {
                parameters = this.omit(parameters, "tag");
            }
        }
        return ((List<object>) (new List<object>() {tag, parameters}));
    }

    public async virtual Task<object> createLimitOrder(object symbol, object side, object amount, object price, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        return await this.createOrder(symbol, "limit", side, amount, price, parameters);
    }

    public async virtual Task<object> createMarketOrder(object symbol, object side, object amount, object price = null, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        return await this.createOrder(symbol, "market", side, amount, price, parameters);
    }

    public async virtual Task<object> createLimitBuyOrder(object symbol, object amount, object price, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        return await this.createOrder(symbol, "limit", "buy", amount, price, parameters);
    }

    public async virtual Task<object> createLimitSellOrder(object symbol, object amount, object price, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        return await this.createOrder(symbol, "limit", "sell", amount, price, parameters);
    }

    public async virtual Task<object> createMarketBuyOrder(object symbol, object amount, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        return await this.createOrder(symbol, "market", "buy", amount, null, parameters);
    }

    public async virtual Task<object> createMarketSellOrder(object symbol, object amount, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        return await this.createOrder(symbol, "market", "sell", amount, null, parameters);
    }

    public virtual object costToPrecision(object symbol, object cost)
    {
        var market = this.market(symbol);
        return this.decimalToPrecision(cost, TRUNCATE, getValue(getValue(market, "precision"), "price"), this.precisionMode, this.paddingMode);
    }

    public virtual object priceToPrecision(object symbol, object price)
    {
        var market = this.market(symbol);
        var result = this.decimalToPrecision(price, ROUND, getValue(getValue(market, "precision"), "price"), this.precisionMode, this.paddingMode);
        if (isEqual(result, "0"))
        {
throw new ArgumentsRequired(add(add(add(add(this.id, " price of "), getValue(market, "symbol")), " must be greater than minimum price precision of "), this.numberToString(getValue(getValue(market, "precision"), "price"))));
        }
        return ((string) (result));
    }

    public virtual object amountToPrecision(object symbol, object amount)
    {
        var market = this.market(symbol);
        var result = this.decimalToPrecision(amount, TRUNCATE, getValue(getValue(market, "precision"), "amount"), this.precisionMode, this.paddingMode);
        if (isEqual(result, "0"))
        {
throw new ArgumentsRequired(add(add(add(add(this.id, " amount of "), getValue(market, "symbol")), " must be greater than minimum amount precision of "), this.numberToString(getValue(getValue(market, "precision"), "amount"))));
        }
        return result;
    }

    public virtual object feeToPrecision(object symbol, object fee)
    {
        var market = this.market(symbol);
        return this.decimalToPrecision(fee, ROUND, getValue(getValue(market, "precision"), "price"), this.precisionMode, this.paddingMode);
    }

    public virtual object currencyToPrecision(object code, object fee, object networkCode = null)
    {
        var currency = getValue(this.currencies, code);
        var precision = this.safeValue(currency, "precision");
        if (!isEqual(networkCode, null))
        {
            var networks = this.safeValue(currency, "networks", new Dictionary<string, object>() {});
            var networkItem = this.safeValue(networks, networkCode, new Dictionary<string, object>() {});
            precision = this.safeValue(networkItem, "precision", precision);
        }
        if (isEqual(precision, null))
        {
            return fee;
        } else
        {
            return this.decimalToPrecision(fee, ROUND, precision, this.precisionMode, this.paddingMode);
        }
    }

    public virtual object safeNumber(object obj, object key, object defaultNumber = null)
    {
        var value = this.safeString(obj, key);
        return ((object) (this.parseNumber(value, defaultNumber)));
    }

    public virtual object safeNumberN(object obj, object arr, object defaultNumber = null)
    {
        var value = this.safeStringN(obj, arr);
        return ((object) (this.parseNumber(value, defaultNumber)));
    }

    public virtual object parsePrecision(object precision)
    {
        /**
         * @ignore
         * @method
         * @param {string} precision The number of digits to the right of the decimal
         * @returns {string} a string number equal to 1e-precision
         */
        if (isEqual(precision, null))
        {
            return ((string) (null));
        }
        var precisionNumber = parseInt(precision);
        var parsedPrecision = "0.";
        for (var i = 0; isLessThan(i, subtract(precisionNumber, 1)); i++)
        {
            parsedPrecision = add(parsedPrecision, "0");
        }
        return ((string) (add(parsedPrecision, "1")));
    }

    public async virtual Task<object> loadTimeDifference(object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        var serverTime = await this.fetchTime(parameters);
        var after = this.milliseconds();
        ((Dictionary<string, object>)this.options)["timeDifference"] = subtract(after, serverTime);
        return getValue(this.options, "timeDifference");
    }

    public virtual object implodeHostname(object url)
    {
        return this.implodeParams(url, new Dictionary<string, object>() {
            { "hostname", this.hostname },
        });
    }

    public async virtual Task<object> fetchMarketLeverageTiers(object symbol, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        if (isTrue(getValue(this.has, "fetchLeverageTiers")))
        {
            var market = await this.market(symbol);
            if (!isTrue(getValue(market, "contract")))
            {
throw new BadSymbol(add(this.id, " fetchMarketLeverageTiers() supports contract markets only"));
            }
            var tiers = await this.fetchLeverageTiers(new List<object>() {symbol});
            return this.safeValue(tiers, symbol);
        } else
        {
throw new NotSupported(add(this.id, " fetchMarketLeverageTiers() is not supported yet"));
        }
    }

    public async virtual Task<object> createPostOnlyOrder(object symbol, object type, object side, object amount, object price, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        if (!isTrue(getValue(this.has, "createPostOnlyOrder")))
        {
throw new NotSupported(add(this.id, "createPostOnlyOrder() is not supported yet"));
        }
        var query = this.extend(parameters, new Dictionary<string, object>() {
            { "postOnly", true },
        });
        return await this.createOrder(symbol, type, side, amount, price, query);
    }

    public async virtual Task<object> createReduceOnlyOrder(object symbol, object type, object side, object amount, object price, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        if (!isTrue(getValue(this.has, "createReduceOnlyOrder")))
        {
throw new NotSupported(add(this.id, "createReduceOnlyOrder() is not supported yet"));
        }
        var query = this.extend(parameters, new Dictionary<string, object>() {
            { "reduceOnly", true },
        });
        return await this.createOrder(symbol, type, side, amount, price, query);
    }

    public async virtual Task<object> createStopOrder(object symbol, object type, object side, object amount, object price = null, object stopPrice = null, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        if (!isTrue(getValue(this.has, "createStopOrder")))
        {
throw new NotSupported(add(this.id, " createStopOrder() is not supported yet"));
        }
        if (isEqual(stopPrice, null))
        {
throw new ArgumentsRequired(add(this.id, " create_stop_order() requires a stopPrice argument"));
        }
        var query = this.extend(parameters, new Dictionary<string, object>() {
            { "stopPrice", stopPrice },
        });
        return await this.createOrder(symbol, type, side, amount, price, query);
    }

    public async virtual Task<object> createStopLimitOrder(object symbol, object side, object amount, object price, object stopPrice, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        if (!isTrue(getValue(this.has, "createStopLimitOrder")))
        {
throw new NotSupported(add(this.id, " createStopLimitOrder() is not supported yet"));
        }
        var query = this.extend(parameters, new Dictionary<string, object>() {
            { "stopPrice", stopPrice },
        });
        return await this.createOrder(symbol, "limit", side, amount, price, query);
    }

    public async virtual Task<object> createStopMarketOrder(object symbol, object side, object amount, object stopPrice, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        if (!isTrue(getValue(this.has, "createStopMarketOrder")))
        {
throw new NotSupported(add(this.id, " createStopMarketOrder() is not supported yet"));
        }
        var query = this.extend(parameters, new Dictionary<string, object>() {
            { "stopPrice", stopPrice },
        });
        return await this.createOrder(symbol, "market", side, amount, null, query);
    }

    public virtual object safeCurrencyCode(object currencyId, object currency = null)
    {
                currency = (string)(this.safeCurrency(currencyId, currency));
        return getValue(currency, "code");
    }

    public virtual object filterBySymbolSinceLimit(object array, object symbol = null, object since = null, object limit = null, object tail = false)
    {
        return this.filterByValueSinceLimit(array, "symbol", symbol, since, limit, "timestamp", tail);
    }

    public virtual object filterByCurrencySinceLimit(object array, object code = null, object since = null, object limit = null, object tail = false)
    {
        return this.filterByValueSinceLimit(array, "currency", code, since, limit, "timestamp", tail);
    }

    public virtual object parseLastPrices(object pricesData, object symbols = null, object parameters = null)
    {
        //
        // the value of tickers is either a dict or a list
        //
        // dict
        //
        //     {
        //         'marketId1': { ... },
        //         'marketId2': { ... },
        //         ...
        //     }
        //
        // list
        //
        //     [
        //         { 'market': 'marketId1', ... },
        //         { 'market': 'marketId2', ... },
        //         ...
        //     ]
        //
        parameters ??= new Dictionary<string, object>();
        var results = new List<object>() {};
        if (isTrue((pricesData.GetType().IsGenericType && pricesData.GetType().GetGenericTypeDefinition().IsAssignableFrom(typeof(List<>)))))
        {
            for (var i = 0; isLessThan(i, getArrayLength(pricesData)); i++)
            {
                var priceData = this.extend(this.parseLastPrice(getValue(pricesData, i)), parameters);
                ((List<object>)results).Add(priceData);
            }
        } else
        {
            var marketIds = new List<string>(((Dictionary<string,object>)pricesData).Keys);
            for (var i = 0; isLessThan(i, getArrayLength(marketIds)); i++)
            {
                var marketId = getValue(marketIds, i);
                var market = this.safeMarket(marketId);
                var priceData = this.extend(this.parseLastPrice(getValue(pricesData, marketId), market), parameters);
                ((List<object>)results).Add(priceData);
            }
        }
                symbols = (List<object>)(this.marketSymbols(symbols));
        return this.filterByArray(results, "symbol", symbols);
    }

    public virtual object parseTickers(object tickers, object symbols = null, object parameters = null)
    {
        //
        // the value of tickers is either a dict or a list
        //
        // dict
        //
        //     {
        //         'marketId1': { ... },
        //         'marketId2': { ... },
        //         'marketId3': { ... },
        //         ...
        //     }
        //
        // list
        //
        //     [
        //         { 'market': 'marketId1', ... },
        //         { 'market': 'marketId2', ... },
        //         { 'market': 'marketId3', ... },
        //         ...
        //     ]
        //
        parameters ??= new Dictionary<string, object>();
        var results = new List<object>() {};
        if (isTrue((tickers.GetType().IsGenericType && tickers.GetType().GetGenericTypeDefinition().IsAssignableFrom(typeof(List<>)))))
        {
            for (var i = 0; isLessThan(i, getArrayLength(tickers)); i++)
            {
                var ticker = this.extend(this.parseTicker(getValue(tickers, i)), parameters);
                ((List<object>)results).Add(ticker);
            }
        } else
        {
            var marketIds = new List<string>(((Dictionary<string,object>)tickers).Keys);
            for (var i = 0; isLessThan(i, getArrayLength(marketIds)); i++)
            {
                var marketId = getValue(marketIds, i);
                var market = this.safeMarket(marketId);
                var ticker = this.extend(this.parseTicker(getValue(tickers, marketId), market), parameters);
                ((List<object>)results).Add(ticker);
            }
        }
                symbols = (List<object>)(this.marketSymbols(symbols));
        return this.filterByArray(results, "symbol", symbols);
    }

    public virtual object parseDepositAddresses(object addresses, object codes = null, object indexed = true, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        var result = new List<object>() {};
        for (var i = 0; isLessThan(i, getArrayLength(addresses)); i++)
        {
            var address = this.extend(this.parseDepositAddress(getValue(addresses, i)), parameters);
            ((List<object>)result).Add(address);
        }
        if (!isEqual(codes, null))
        {
                        result = (List<object>)(this.filterByArray(result, "currency", codes, false));
        }
        if (isTrue(indexed))
        {
            return ((Dictionary<string, object>) (this.indexBy(result, "currency")));
        }
        return ((Dictionary<string, object>) (result));
    }

    public virtual object parseBorrowInterests(object response, object market = null)
    {
        var interests = new List<object>() {};
        for (var i = 0; isLessThan(i, getArrayLength(response)); i++)
        {
            var row = getValue(response, i);
            ((List<object>)interests).Add(this.parseBorrowInterest(row, market));
        }
        return ((List<object>) (interests));
    }

    public virtual object parseFundingRateHistories(object response, object market = null, object since = null, object limit = null)
    {
        var rates = new List<object>() {};
        for (var i = 0; isLessThan(i, getArrayLength(response)); i++)
        {
            var entry = getValue(response, i);
            ((List<object>)rates).Add(this.parseFundingRateHistory(entry, market));
        }
        var sorted = this.sortBy(rates, "timestamp");
        var symbol = (isEqual(market, null)) ? null : getValue(market, "symbol");
        return this.filterBySymbolSinceLimit(sorted, symbol, since, limit);
    }

    public virtual object safeSymbol(object marketId, object market = null, object delimiter = null, object marketType = null)
    {
        market = this.safeMarket(marketId, market, delimiter, marketType);
        return getValue(market, "symbol");
    }

    public virtual object parseFundingRate(object contract, object market = null)
    {
throw new NotSupported(add(this.id, " parseFundingRate() is not supported yet"));
    }

    public virtual object parseFundingRates(object response, object market = null)
    {
        var result = new Dictionary<string, object>() {};
        for (var i = 0; isLessThan(i, getArrayLength(response)); i++)
        {
            var parsed = this.parseFundingRate(getValue(response, i), market);
            ((Dictionary<string, object>)result)[(string)getValue(parsed, "symbol")] = parsed;
        }
        return ((Dictionary<string, object>) (result));
    }

    public virtual object isTriggerOrder(object parameters)
    {
        var isTrigger = this.safeValue2(parameters, "trigger", "stop");
        if (isTrue(isTrigger))
        {
            parameters = this.omit(parameters, new List<object>() {"trigger", "stop"});
        }
        return ((List<object>) (new List<object>() {isTrigger, parameters}));
    }

    public virtual object isPostOnly(object isMarketOrder, object exchangeSpecificParam, object parameters = null)
    {
        /**
        * @ignore
        * @method
        * @param {string} type Order type
        * @param {boolean} exchangeSpecificParam exchange specific postOnly
        * @param {object} params exchange specific params
        * @returns {boolean} true if a post only order, false otherwise
        */
        parameters ??= new Dictionary<string, object>();
        var timeInForce = this.safeStringUpper(parameters, "timeInForce");
        var postOnly = this.safeValue2(parameters, "postOnly", "post_only", false);
        // we assume timeInForce is uppercase from safeStringUpper (params, 'timeInForce')
        var ioc = isEqual(timeInForce, "IOC");
        var fok = isEqual(timeInForce, "FOK");
        var timeInForcePostOnly = isEqual(timeInForce, "PO");
        postOnly = isTrue(postOnly) || isTrue(timeInForcePostOnly) || isTrue(exchangeSpecificParam);
        if (isTrue(postOnly))
        {
            if (isTrue(ioc) || isTrue(fok))
            {
throw new InvalidOrder(add(add(this.id, " postOnly orders cannot have timeInForce equal to "), timeInForce));
            } else if (isTrue(isMarketOrder))
            {
throw new InvalidOrder(add(this.id, " market orders cannot be postOnly"));
            } else
            {
                return ((bool) (true));
            }
        } else
        {
            return ((bool) (false));
        }
    }

    public async virtual Task<object> fetchLastPrices(object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
throw new NotSupported(add(this.id, " fetchLastPrices() is not supported yet"));
    }

    public async virtual Task<object> fetchTradingFees(object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
throw new NotSupported(add(this.id, " fetchTradingFees() is not supported yet"));
    }

    public async virtual Task<object> fetchTradingFee(object symbol, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        if (!isTrue(getValue(this.has, "fetchTradingFees")))
        {
throw new NotSupported(add(this.id, " fetchTradingFee() is not supported yet"));
        }
        return await this.fetchTradingFees(parameters);
    }

    public virtual object parseOpenInterest(object interest, object market = null)
    {
throw new NotSupported(add(this.id, " parseOpenInterest () is not supported yet"));
    }

    public virtual object parseOpenInterests(object response, object market = null, object since = null, object limit = null)
    {
        var interests = new List<object>() {};
        for (var i = 0; isLessThan(i, getArrayLength(response)); i++)
        {
            var entry = getValue(response, i);
            var interest = this.parseOpenInterest(entry, market);
            ((List<object>)interests).Add(interest);
        }
        var sorted = this.sortBy(interests, "timestamp");
        var symbol = this.safeString(market, "symbol");
        return this.filterBySymbolSinceLimit(sorted, symbol, since, limit);
    }

    public async virtual Task<object> fetchFundingRate(object symbol, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        if (isTrue(getValue(this.has, "fetchFundingRates")))
        {
            await this.loadMarkets();
            var market = this.market(symbol);
            if (!isTrue(getValue(market, "contract")))
            {
throw new BadSymbol(add(this.id, " fetchFundingRate() supports contract markets only"));
            }
            var rates = await this.fetchFundingRates(new List<object>() {symbol}, parameters);
            var rate = this.safeValue(rates, symbol);
            if (isEqual(rate, null))
            {
throw new NullResponse(add(add(this.id, " fetchFundingRate () returned no data for "), symbol));
            } else
            {
                return rate;
            }
        } else
        {
throw new NotSupported(add(this.id, " fetchFundingRate () is not supported yet"));
        }
    }

    public async virtual Task<object> fetchMarkOHLCV(object symbol, object timeframe = null, object since = null, object limit = null, object parameters = null)
    {
        /**
        * @method
        * @name exchange#fetchMarkOHLCV
        * @description fetches historical mark price candlestick data containing the open, high, low, and close price of a market
        * @param {string} symbol unified symbol of the market to fetch OHLCV data for
        * @param {string} timeframe the length of time each candle represents
        * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
        * @param {int|undefined} limit the maximum amount of candles to fetch
        * @param {object} params extra parameters specific to the exchange api endpoint
        * @returns {[[int|float]]} A list of candles ordered as timestamp, open, high, low, close, undefined
        */
        timeframe ??= "1m";
        parameters ??= new Dictionary<string, object>();
        if (isTrue(getValue(this.has, "fetchMarkOHLCV")))
        {
            var request = new Dictionary<string, object>() {
                { "price", "mark" },
            };
            return ((List<object>) (await this.fetchOHLCV(symbol, timeframe, since, limit, this.extend(request, parameters))));
        } else
        {
throw new NotSupported(add(this.id, " fetchMarkOHLCV () is not supported yet"));
        }
    }

    public async virtual Task<object> fetchIndexOHLCV(object symbol, object timeframe = null, object since = null, object limit = null, object parameters = null)
    {
        /**
        * @method
        * @name exchange#fetchIndexOHLCV
        * @description fetches historical index price candlestick data containing the open, high, low, and close price of a market
        * @param {string} symbol unified symbol of the market to fetch OHLCV data for
        * @param {string} timeframe the length of time each candle represents
        * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
        * @param {int|undefined} limit the maximum amount of candles to fetch
        * @param {object} params extra parameters specific to the exchange api endpoint
        * @returns {[[int|float]]} A list of candles ordered as timestamp, open, high, low, close, undefined
        */
        timeframe ??= "1m";
        parameters ??= new Dictionary<string, object>();
        if (isTrue(getValue(this.has, "fetchIndexOHLCV")))
        {
            var request = new Dictionary<string, object>() {
                { "price", "index" },
            };
            return ((List<object>) (await this.fetchOHLCV(symbol, timeframe, since, limit, this.extend(request, parameters))));
        } else
        {
throw new NotSupported(add(this.id, " fetchIndexOHLCV () is not supported yet"));
        }
    }

    public async virtual Task<object> fetchPremiumIndexOHLCV(object symbol, object timeframe = null, object since = null, object limit = null, object parameters = null)
    {
        /**
        * @method
        * @name exchange#fetchPremiumIndexOHLCV
        * @description fetches historical premium index price candlestick data containing the open, high, low, and close price of a market
        * @param {string} symbol unified symbol of the market to fetch OHLCV data for
        * @param {string} timeframe the length of time each candle represents
        * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
        * @param {int|undefined} limit the maximum amount of candles to fetch
        * @param {object} params extra parameters specific to the exchange api endpoint
        * @returns {[[int|float]]} A list of candles ordered as timestamp, open, high, low, close, undefined
        */
        timeframe ??= "1m";
        parameters ??= new Dictionary<string, object>();
        if (isTrue(getValue(this.has, "fetchPremiumIndexOHLCV")))
        {
            var request = new Dictionary<string, object>() {
                { "price", "premiumIndex" },
            };
            return ((List<object>) (await this.fetchOHLCV(symbol, timeframe, since, limit, this.extend(request, parameters))));
        } else
        {
throw new NotSupported(add(this.id, " fetchPremiumIndexOHLCV () is not supported yet"));
        }
    }

    public virtual object handleTimeInForce(object parameters = null)
    {
        /**
        * @ignore
        * @method
        * * Must add timeInForce to this.options to use this method
        * @return {string} returns the exchange specific value for timeInForce
        */
        parameters ??= new Dictionary<string, object>();
        var timeInForce = this.safeStringUpper(parameters, "timeInForce"); // supported values GTC, IOC, PO
        if (!isEqual(timeInForce, null))
        {
            var exchangeValue = this.safeString(getValue(this.options, "timeInForce"), timeInForce);
            if (isEqual(exchangeValue, null))
            {
throw new ExchangeError(add(add(add(this.id, " does not support timeInForce \""), timeInForce), "\""));
            }
            return ((string) (exchangeValue));
        }
        return ((string) (null));
    }

    public virtual object convertTypeToAccount(object account)
    {
        /**
         * @ignore
         * @method
         * * Must add accountsByType to this.options to use this method
         * @param {string} account key for account name in this.options['accountsByType']
         * @returns the exchange specific account name or the isolated margin id for transfers
         */
        var accountsByType = this.safeValue(this.options, "accountsByType", new Dictionary<string, object>() {});
        var lowercaseAccount = ((string)account).ToLower();
        if (((Dictionary<string,object>)accountsByType).ContainsKey((string)lowercaseAccount))
        {
            return getValue(accountsByType, lowercaseAccount);
        } else if ((((Dictionary<string,object>)this.markets).ContainsKey((string)account)) || (((Dictionary<string,object>)this.markets_by_id).ContainsKey((string)account)))
        {
            var market = this.market(account);
            return getValue(market, "id");
        } else
        {
            return account;
        }
    }

    public virtual object checkRequiredArgument(object methodName, object argument, object argumentName, object options = null)
    {
        /**
        * @ignore
        * @method
        * @param {string} argument the argument to check
        * @param {string} argumentName the name of the argument to check
        * @param {string} methodName the name of the method that the argument is being checked for
        * @param {[string]} options a list of options that the argument can be
        * @returns {undefined}
        */
        options ??= new List<object>();
        var optionsLength = getArrayLength(options);
        if ((isEqual(argument, null)) || ((isGreaterThan(optionsLength, 0)) && (!(this.inArray(argument, options)))))
        {
            var messageOptions = String.Join(", ", options);
            var message = add(add(add(add(add(this.id, " "), methodName), "() requires a "), argumentName), " argument");
            if (!isEqual(messageOptions, ""))
            {
                message += add(add(add(", one of ", "("), messageOptions), ")");
            }
throw new ArgumentsRequired(message);
        }
    }

    public virtual object checkRequiredMarginArgument(object methodName, object symbol, object marginMode)
    {
        /**
         * @ignore
         * @method
         * @param {string} symbol unified symbol of the market
         * @param {string} methodName name of the method that requires a symbol
         * @param {string} marginMode is either 'isolated' or 'cross'
         */
        if ((isEqual(marginMode, "isolated")) && (isEqual(symbol, null)))
        {
throw new ArgumentsRequired(add(add(add(this.id, " "), methodName), "() requires a symbol argument for isolated margin"));
        } else if ((isEqual(marginMode, "cross")) && (!isEqual(symbol, null)))
        {
throw new ArgumentsRequired(add(add(add(this.id, " "), methodName), "() cannot have a symbol argument for cross margin"));
        }
    }

    public virtual object checkRequiredSymbol(object methodName, object symbol)
    {
        /**
         * @ignore
         * @method
         * @param {string} symbol unified symbol of the market
         * @param {string} methodName name of the method that requires a symbol
         */
        this.checkRequiredArgument(methodName, symbol, "symbol");
    }

    public virtual object parseDepositWithdrawFees(object response, object codes = null, object currencyIdKey = null)
    {
        /**
         * @ignore
         * @method
         * @param {[object]|object} response unparsed response from the exchange
         * @param {[string]|undefined} codes the unified currency codes to fetch transactions fees for, returns all currencies when undefined
         * @param {str|undefined} currencyIdKey *should only be undefined when response is a dictionary* the object key that corresponds to the currency id
         * @returns {object} objects with withdraw and deposit fees, indexed by currency codes
         */
        var depositWithdrawFees = new Dictionary<string, object>() {};
                codes = (List<object>)(this.marketCodes(codes));
        var isArray = (response.GetType().IsGenericType && response.GetType().GetGenericTypeDefinition().IsAssignableFrom(typeof(List<>)));
        var responseKeys = response;
        if (!isTrue(isArray))
        {
            responseKeys = new List<string>(((Dictionary<string,object>)response).Keys);
        }
        for (var i = 0; isLessThan(i, getArrayLength(responseKeys)); i++)
        {
            var entry = getValue(responseKeys, i);
            var dictionary = isTrue(isArray) ? entry : getValue(response, entry);
            var currencyId = isTrue(isArray) ? this.safeString(dictionary, currencyIdKey) : entry;
            var currency = this.safeValue(this.currencies_by_id, currencyId);
            var code = this.safeString(currency, "code", currencyId);
            if ((isEqual(codes, null)) || (this.inArray(code, codes)))
            {
                ((Dictionary<string, object>)depositWithdrawFees)[(string)code] = this.parseDepositWithdrawFee(dictionary, currency);
            }
        }
        return depositWithdrawFees;
    }

    public virtual object parseDepositWithdrawFee(object fee, object currency = null)
    {
throw new NotSupported(add(this.id, " parseDepositWithdrawFee() is not supported yet"));
    }

    public virtual object depositWithdrawFee(object info)
    {
        return new Dictionary<string, object>() {
            { "info", info },
            { "withdraw", new Dictionary<string, object>() {
                { "fee", null },
                { "percentage", null },
            } },
            { "deposit", new Dictionary<string, object>() {
                { "fee", null },
                { "percentage", null },
            } },
            { "networks", new Dictionary<string, object>() {} },
        };
    }

    public virtual object assignDefaultDepositWithdrawFees(object fee, object currency = null)
    {
        /**
         * @ignore
         * @method
         * @description Takes a depositWithdrawFee structure and assigns the default values for withdraw and deposit
         * @param {object} fee A deposit withdraw fee structure
         * @param {object} currency A currency structure, the response from this.currency ()
         * @returns {object} A deposit withdraw fee structure
         */
        var networkKeys = new List<string>(((Dictionary<string,object>)getValue(fee, "networks")).Keys);
        var numNetworks = getArrayLength(networkKeys);
        if (isEqual(numNetworks, 1))
        {
            ((Dictionary<string, object>)fee)["withdraw"] = getValue(getValue(getValue(fee, "networks"), getValue(networkKeys, 0)), "withdraw");
            ((Dictionary<string, object>)fee)["deposit"] = getValue(getValue(getValue(fee, "networks"), getValue(networkKeys, 0)), "deposit");
            return fee;
        }
        var currencyCode = this.safeString(currency, "code");
        for (var i = 0; isLessThan(i, numNetworks); i++)
        {
            var network = getValue(networkKeys, i);
            if (isEqual(network, currencyCode))
            {
                ((Dictionary<string, object>)fee)["withdraw"] = getValue(getValue(getValue(fee, "networks"), getValue(networkKeys, i)), "withdraw");
                ((Dictionary<string, object>)fee)["deposit"] = getValue(getValue(getValue(fee, "networks"), getValue(networkKeys, i)), "deposit");
            }
        }
        return fee;
    }

    public virtual object parseIncome(object info, object market = null)
    {
throw new NotSupported(add(this.id, " parseIncome () is not supported yet"));
    }

    public virtual object parseIncomes(object incomes, object market = null, object since = null, object limit = null)
    {
        /**
         * @ignore
         * @method
         * @description parses funding fee info from exchange response
         * @param {[object]} incomes each item describes once instance of currency being received or paid
         * @param {object|undefined} market ccxt market
         * @param {int|undefined} since when defined, the response items are filtered to only include items after this timestamp
         * @param {int|undefined} limit limits the number of items in the response
         * @returns {[object]} an array of [funding history structures]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
         */
        var result = new List<object>() {};
        for (var i = 0; isLessThan(i, getArrayLength(incomes)); i++)
        {
            var entry = getValue(incomes, i);
            var parsed = this.parseIncome(entry, market);
            ((List<object>)result).Add(parsed);
        }
        var sorted = this.sortBy(result, "timestamp");
        return this.filterBySinceLimit(sorted, since, limit);
    }

    public virtual object getMarketFromSymbols(object symbols = null)
    {
        if (isEqual(symbols, null))
        {
            return null;
        }
        var firstMarket = this.safeString(symbols, 0);
        var market = this.market(firstMarket);
        return market;
    }
}

