namespace ccxt;

// Native dedicated prediction-market structs. C# structs cannot inherit, so each
// carries only the prediction-meaningful fields (flat typed access) plus the
// prediction identity fields. These types are standalone — there is no `symbol`;
// `outcome` (the "MARKET:LABEL" handle) is the canonical identity. Mirrors the
// standalone `Prediction*` interfaces in ts/src/base/types.ts. The transpiler
// wraps a `-> PredictionTicker` return with `new PredictionTicker(res)`.

public struct PredictionTicker
{
    public Int64? timestamp;
    public string? datetime;
    public double? high;
    public double? low;
    public double? bid;
    public double? bidVolume;
    public double? ask;
    public double? askVolume;
    public double? open;
    public double? close;
    public double? last;
    public double? change;
    public double? percentage;
    public double? average;
    public double? baseVolume;
    public double? quoteVolume;
    // prediction-specific
    public string? outcome;
    public string? outcomeId;
    public string? label;
    public string? market;
    public string? eventId;
    public double? openInterest;
    public Dictionary<string, object> info;

    public PredictionTicker(object ticker2)
    {
        var ticker = (Dictionary<string, object>)ticker2;
        timestamp = Exchange.SafeInteger(ticker, "timestamp");
        datetime = Exchange.SafeString(ticker, "datetime");
        high = Exchange.SafeFloat(ticker, "high");
        low = Exchange.SafeFloat(ticker, "low");
        bid = Exchange.SafeFloat(ticker, "bid");
        bidVolume = Exchange.SafeFloat(ticker, "bidVolume");
        ask = Exchange.SafeFloat(ticker, "ask");
        askVolume = Exchange.SafeFloat(ticker, "askVolume");
        open = Exchange.SafeFloat(ticker, "open");
        close = Exchange.SafeFloat(ticker, "close");
        last = Exchange.SafeFloat(ticker, "last");
        change = Exchange.SafeFloat(ticker, "change");
        percentage = Exchange.SafeFloat(ticker, "percentage");
        average = Exchange.SafeFloat(ticker, "average");
        baseVolume = Exchange.SafeFloat(ticker, "baseVolume");
        quoteVolume = Exchange.SafeFloat(ticker, "quoteVolume");
        outcome = Exchange.SafeString(ticker, "outcome");
        outcomeId = Exchange.SafeString(ticker, "outcomeId");
        label = Exchange.SafeString(ticker, "label");
        market = Exchange.SafeString(ticker, "market");
        eventId = Exchange.SafeString(ticker, "event");
        openInterest = Exchange.SafeFloat(ticker, "openInterest");
        info = Helper.GetInfo(ticker);
    }
}

public struct PredictionOrder
{
    public string? id;
    public string? clientOrderId;
    public Int64? timestamp;
    public string? datetime;
    public string? lastTradeTimestamp;
    public Int64? lastUpdateTimestamp;
    public string? timeInForce;
    public string? type;
    public string? side;
    public double? price;
    public double? cost;
    public double? average;
    public double? amount;
    public double? filled;
    public double? remaining;
    public string? status;
    public bool? reduceOnly;
    public bool? postOnly;
    public Fee? fee;
    public IEnumerable<Trade>? trades;
    // prediction-specific
    public string? outcome;
    public string? outcomeId;
    public string? label;
    public string? market;
    public string? eventId;
    public Dictionary<string, object>? info;

    public PredictionOrder(object order2)
    {
        var order = (Dictionary<string, object>)order2;
        id = Exchange.SafeString(order, "id");
        clientOrderId = Exchange.SafeString(order, "clientOrderId");
        timestamp = Exchange.SafeInteger(order, "timestamp");
        datetime = Exchange.SafeString(order, "datetime");
        lastTradeTimestamp = Exchange.SafeString(order, "lastTradeTimestamp");
        lastUpdateTimestamp = Exchange.SafeInteger(order, "lastUpdateTimestamp");
        timeInForce = Exchange.SafeString(order, "timeInForce");
        type = Exchange.SafeString(order, "type");
        side = Exchange.SafeString(order, "side");
        price = Exchange.SafeFloat(order, "price");
        cost = Exchange.SafeFloat(order, "cost");
        average = Exchange.SafeFloat(order, "average");
        amount = Exchange.SafeFloat(order, "amount");
        filled = Exchange.SafeFloat(order, "filled");
        remaining = Exchange.SafeFloat(order, "remaining");
        status = Exchange.SafeString(order, "status");
        fee = order.ContainsKey("fee") ? new Fee(order["fee"]) : null;
        trades = order.ContainsKey("trades") ? ((IEnumerable<object>)order["trades"]).Select(x => new Trade(x)) : null;
        reduceOnly = Exchange.SafeBool(order, "reduceOnly", false);
        postOnly = Exchange.SafeBool(order, "postOnly", false);
        outcome = Exchange.SafeString(order, "outcome");
        outcomeId = Exchange.SafeString(order, "outcomeId");
        label = Exchange.SafeString(order, "label");
        market = Exchange.SafeString(order, "market");
        eventId = Exchange.SafeString(order, "event");
        info = Helper.GetInfo(order);
    }
}

public struct PredictionTrade
{
    public double? amount;
    public double? price;
    public double? cost;
    public string? id;
    public string? order;
    public Int64? timestamp;
    public string? datetime;
    public string? type;
    public string? side;
    public string? takerOrMaker;
    public Fee? fee;
    // prediction-specific
    public string? outcome;
    public string? outcomeId;
    public string? label;
    public string? market;
    public double? realizedPnl;
    public Dictionary<string, object>? info;

    public PredictionTrade(object trade2)
    {
        var trade = (Dictionary<string, object>)trade2;
        amount = Exchange.SafeFloat(trade, "amount");
        price = Exchange.SafeFloat(trade, "price");
        cost = Exchange.SafeFloat(trade, "cost");
        id = Exchange.SafeString(trade, "id");
        order = Exchange.SafeString(trade, "order");
        timestamp = Exchange.SafeInteger(trade, "timestamp");
        datetime = Exchange.SafeString(trade, "datetime");
        type = Exchange.SafeString(trade, "type");
        side = Exchange.SafeString(trade, "side");
        takerOrMaker = Exchange.SafeString(trade, "takerOrMaker");
        fee = trade.ContainsKey("fee") ? new Fee(trade["fee"]) : null;
        outcome = Exchange.SafeString(trade, "outcome");
        outcomeId = Exchange.SafeString(trade, "outcomeId");
        label = Exchange.SafeString(trade, "label");
        market = Exchange.SafeString(trade, "market");
        realizedPnl = Exchange.SafeFloat(trade, "realizedPnl");
        info = Helper.GetInfo(trade);
    }
}

public struct PredictionPosition
{
    public string? id;
    public double? timestamp;
    public string? datetime;
    public double? contracts;
    public double? contractSize;
    public string? side;
    public double? notional;
    public double? unrealizedPnl;
    public double? realizedPnl;
    public double? collateral;
    public double? entryPrice;
    public double? markPrice;
    public double? lastPrice;
    public double? percentage;
    // prediction-specific
    public string? outcome;
    public string? outcomeId;
    public string? label;
    public string? market;
    public string? eventId;
    public string? oppositeOutcome;
    public bool? resolved;
    public bool? won;
    public double? settleFraction;
    public double? payout;
    public Dictionary<string, object>? info;

    public PredictionPosition(object position)
    {
        id = Exchange.SafeString(position, "id");
        info = Helper.GetInfo(position);
        timestamp = Exchange.SafeInteger(position, "timestamp");
        datetime = Exchange.SafeString(position, "datetime");
        contracts = Exchange.SafeFloat(position, "contracts");
        contractSize = Exchange.SafeFloat(position, "contractSize");
        side = Exchange.SafeString(position, "side");
        notional = Exchange.SafeFloat(position, "notional");
        unrealizedPnl = Exchange.SafeFloat(position, "unrealizedPnl");
        realizedPnl = Exchange.SafeFloat(position, "realizedPnl");
        collateral = Exchange.SafeFloat(position, "collateral");
        entryPrice = Exchange.SafeFloat(position, "entryPrice");
        markPrice = Exchange.SafeFloat(position, "markPrice");
        lastPrice = Exchange.SafeFloat(position, "lastPrice");
        percentage = Exchange.SafeFloat(position, "percentage");
        outcome = Exchange.SafeString(position, "outcome");
        outcomeId = Exchange.SafeString(position, "outcomeId");
        label = Exchange.SafeString(position, "label");
        market = Exchange.SafeString(position, "market");
        eventId = Exchange.SafeString(position, "event");
        oppositeOutcome = Exchange.SafeString(position, "oppositeOutcome");
        resolved = Exchange.SafeValue(position, "resolved") != null ? (bool)Exchange.SafeValue(position, "resolved") : null;
        won = Exchange.SafeValue(position, "won") != null ? (bool)Exchange.SafeValue(position, "won") : null;
        settleFraction = Exchange.SafeFloat(position, "settleFraction");
        payout = Exchange.SafeFloat(position, "payout");
    }
}

public struct PredictionOrderBook
{
    public List<List<double>>? bids;
    public List<List<double>>? asks;
    public Int64? timestamp;
    public string? datetime;
    public Int64? nonce;
    // prediction-specific
    public string? outcome;
    public string? outcomeId;
    public string? market;

    public PredictionOrderBook(object orderbook2)
    {
        var orderbook = (IDictionary<string, object>)orderbook2;
        bids = orderbook.ContainsKey("bids") ? ((IEnumerable<object>)orderbook["bids"]).Select(x => ((IEnumerable<object>)x).Select(y => Convert.ToDouble(y)).ToList()).ToList() : null;
        asks = orderbook.ContainsKey("asks") ? ((IEnumerable<object>)orderbook["asks"]).Select(x => ((IEnumerable<object>)x).Select(y => Convert.ToDouble(y)).ToList()).ToList() : null;
        timestamp = Exchange.SafeInteger(orderbook, "timestamp");
        datetime = Exchange.SafeString(orderbook, "datetime");
        nonce = Exchange.SafeInteger(orderbook, "nonce");
        outcome = Exchange.SafeString(orderbook, "outcome");
        outcomeId = Exchange.SafeString(orderbook, "outcomeId");
        market = Exchange.SafeString(orderbook, "market");
    }
}

public struct PredictionTradingFee
{
    public double? maker;
    public double? taker;
    public bool? percentage;
    public bool? tierBased;
    // prediction-specific
    public string? outcome;
    public string? outcomeId;
    public string? market;
    public Dictionary<string, object> info;

    public PredictionTradingFee(object fee2)
    {
        var fee = (Dictionary<string, object>)fee2;
        maker = Exchange.SafeFloat(fee, "maker");
        taker = Exchange.SafeFloat(fee, "taker");
        percentage = fee.ContainsKey("percentage") && fee["percentage"] != null ? (bool)fee["percentage"] : null;
        tierBased = fee.ContainsKey("tierBased") && fee["tierBased"] != null ? (bool)fee["tierBased"] : null;
        outcome = Exchange.SafeString(fee, "outcome");
        outcomeId = Exchange.SafeString(fee, "outcomeId");
        market = Exchange.SafeString(fee, "market");
        info = Helper.GetInfo(fee);
    }
}

public struct PredictionOpenInterest
{
    public double? openInterestAmount;
    public double? openInterestValue;
    public Int64? timestamp;
    public string? datetime;
    // prediction-specific
    public string? outcome;
    public string? outcomeId;
    public string? market;
    public Dictionary<string, object> info;

    public PredictionOpenInterest(object openInterest)
    {
        openInterestAmount = Exchange.SafeFloat(openInterest, "openInterestAmount");
        openInterestValue = Exchange.SafeFloat(openInterest, "openInterestValue");
        timestamp = Exchange.SafeInteger(openInterest, "timestamp");
        datetime = Exchange.SafeString(openInterest, "datetime");
        outcome = Exchange.SafeString(openInterest, "outcome");
        outcomeId = Exchange.SafeString(openInterest, "outcomeId");
        market = Exchange.SafeString(openInterest, "market");
        info = Helper.GetInfo(openInterest);
    }
}

public struct PredictionTickers
{
    public Dictionary<string, object> info;
    public Dictionary<string, PredictionTicker> tickers;

    public PredictionTickers(object tickers2)
    {
        var tickers = (Dictionary<string, object>)tickers2;
        info = Helper.GetInfo(tickers);
        this.tickers = new Dictionary<string, PredictionTicker>();
        foreach (var ticker in tickers)
        {
            if (ticker.Key != "info")
                this.tickers.Add(ticker.Key, new PredictionTicker(ticker.Value));
        }
    }

    public PredictionTicker this[string key]
    {
        get
        {
            if (tickers.ContainsKey(key))
            {
                return tickers[key];
            }
            else
            {
                throw new KeyNotFoundException($"The key '{key}' was not found in the tickers.");
            }
        }
    }
}

// PredictionFees / PredictionOutcome / PredictionMarket / PredictionEvent mirror the
// Event -> Market -> Outcome hierarchy in ts/src/base/types.ts. The Outcome is the
// tradeable unit; PredictionEvent.markets holds the grouped ccxt market rows (each
// carrying its outcomes list), matching what fetchEvents() returns at runtime.

public struct PredictionFees
{
    public double? trading;
    public double? resolution;

    public PredictionFees(object fees2)
    {
        var fees = (Dictionary<string, object>)fees2;
        trading = Exchange.SafeFloat(fees, "trading");
        resolution = Exchange.SafeFloat(fees, "resolution");
    }
}

public struct PredictionOutcome
{
    public string? outcome;
    public string? outcomeId;
    public string? label;
    public string? market;
    public string? marketId;
    public string? eventId;
    public double? price;
    public double? bid;
    public double? ask;
    public bool? active;
    public bool? winner;
    public double? settleFraction;
    public Precision? precision;
    public Dictionary<string, object> info;

    public PredictionOutcome(object outcome2)
    {
        var outcomeDict = (Dictionary<string, object>)outcome2;
        outcome = Exchange.SafeString(outcomeDict, "outcome");
        outcomeId = Exchange.SafeString(outcomeDict, "outcomeId");
        label = Exchange.SafeString(outcomeDict, "label");
        market = Exchange.SafeString(outcomeDict, "market");
        marketId = Exchange.SafeString(outcomeDict, "marketId");
        eventId = Exchange.SafeString(outcomeDict, "event");
        price = Exchange.SafeFloat(outcomeDict, "price");
        bid = Exchange.SafeFloat(outcomeDict, "bid");
        ask = Exchange.SafeFloat(outcomeDict, "ask");
        active = Exchange.SafeBool(outcomeDict, "active");
        winner = Exchange.SafeBool(outcomeDict, "winner");
        settleFraction = Exchange.SafeFloat(outcomeDict, "settleFraction");
        precision = Exchange.SafeValue(outcomeDict, "precision") != null ? new Precision(Exchange.SafeValue(outcomeDict, "precision")) : null;
        info = Helper.GetInfo(outcomeDict);
    }
}

public struct PredictionMarket
{
    public string? id;
    public string? market;
    public string? eventId;
    public string? marketType;
    public string? executionModel;
    public string? title;
    public string? description;
    public List<PredictionOutcome>? outcomes;
    public string? underlying;
    public double? floorStrike;
    public double? capStrike;
    public string? strikeType;
    public string? collateral;
    public bool? active;
    public bool? closed;
    public bool? resolved;
    public string? resolvedOutcome;
    public double? settlementValue;
    public Int64? created;
    public string? createdDatetime;
    public Int64? end;
    public string? endDatetime;
    public double? volume;
    public double? liquidity;
    public double? openInterest;
    public double? tickSize;
    public Limits? limits;
    public PredictionFees? fees;
    public string? resolutionSource;
    public string? image;
    public Dictionary<string, object> info;

    public PredictionMarket(object market2)
    {
        var marketDict = (Dictionary<string, object>)market2;
        id = Exchange.SafeString(marketDict, "id");
        market = Exchange.SafeString(marketDict, "market");
        eventId = Exchange.SafeString(marketDict, "event");
        marketType = Exchange.SafeString(marketDict, "marketType");
        executionModel = Exchange.SafeString(marketDict, "executionModel");
        title = Exchange.SafeString(marketDict, "title");
        description = Exchange.SafeString(marketDict, "description");
        outcomes = marketDict.ContainsKey("outcomes") && marketDict["outcomes"] != null ? ((IEnumerable<object>)marketDict["outcomes"]).Select(x => new PredictionOutcome(x)).ToList() : null;
        underlying = Exchange.SafeString(marketDict, "underlying");
        floorStrike = Exchange.SafeFloat(marketDict, "floorStrike");
        capStrike = Exchange.SafeFloat(marketDict, "capStrike");
        strikeType = Exchange.SafeString(marketDict, "strikeType");
        collateral = Exchange.SafeString(marketDict, "collateral");
        active = Exchange.SafeBool(marketDict, "active");
        closed = Exchange.SafeBool(marketDict, "closed");
        resolved = Exchange.SafeBool(marketDict, "resolved");
        resolvedOutcome = Exchange.SafeString(marketDict, "resolvedOutcome");
        settlementValue = Exchange.SafeFloat(marketDict, "settlementValue");
        created = Exchange.SafeInteger(marketDict, "created");
        createdDatetime = Exchange.SafeString(marketDict, "createdDatetime");
        end = Exchange.SafeInteger(marketDict, "end");
        endDatetime = Exchange.SafeString(marketDict, "endDatetime");
        volume = Exchange.SafeFloat(marketDict, "volume");
        liquidity = Exchange.SafeFloat(marketDict, "liquidity");
        openInterest = Exchange.SafeFloat(marketDict, "openInterest");
        tickSize = Exchange.SafeFloat(marketDict, "tickSize");
        limits = Exchange.SafeValue(marketDict, "limits") != null ? new Limits(Exchange.SafeValue(marketDict, "limits")) : null;
        fees = Exchange.SafeValue(marketDict, "fees") != null ? new PredictionFees(Exchange.SafeValue(marketDict, "fees")) : null;
        resolutionSource = Exchange.SafeString(marketDict, "resolutionSource");
        image = Exchange.SafeString(marketDict, "image");
        info = Helper.GetInfo(marketDict);
    }
}

public struct PredictionEvent
{
    public string? id;
    public string? eventId;
    public string? title;
    public string? description;
    public string? slug;
    public string? category;
    public List<string>? tags;
    public List<PredictionMarket>? markets;
    public bool? mutuallyExclusive;
    public bool? active;
    public bool? resolved;
    public double? volume;
    public double? liquidity;
    public Int64? created;
    public string? createdDatetime;
    public Int64? end;
    public string? endDatetime;
    public string? image;
    public string? url;
    public Dictionary<string, object> info;

    public PredictionEvent(object event2)
    {
        var eventDict = (Dictionary<string, object>)event2;
        id = Exchange.SafeString(eventDict, "id");
        eventId = Exchange.SafeString(eventDict, "event");
        title = Exchange.SafeString(eventDict, "title");
        description = Exchange.SafeString(eventDict, "description");
        slug = Exchange.SafeString(eventDict, "slug");
        category = Exchange.SafeString(eventDict, "category");
        tags = eventDict.ContainsKey("tags") && eventDict["tags"] != null ? ((IEnumerable<object>)eventDict["tags"]).Select(x => (string)x).ToList() : null;
        markets = eventDict.ContainsKey("markets") && eventDict["markets"] != null ? ((IEnumerable<object>)eventDict["markets"]).Select(x => new PredictionMarket(x)).ToList() : null;
        mutuallyExclusive = Exchange.SafeBool(eventDict, "mutuallyExclusive");
        active = Exchange.SafeBool(eventDict, "active");
        resolved = Exchange.SafeBool(eventDict, "resolved");
        volume = Exchange.SafeFloat(eventDict, "volume");
        liquidity = Exchange.SafeFloat(eventDict, "liquidity");
        created = Exchange.SafeInteger(eventDict, "created");
        createdDatetime = Exchange.SafeString(eventDict, "createdDatetime");
        end = Exchange.SafeInteger(eventDict, "end");
        endDatetime = Exchange.SafeString(eventDict, "endDatetime");
        image = Exchange.SafeString(eventDict, "image");
        url = Exchange.SafeString(eventDict, "url");
        info = Helper.GetInfo(eventDict);
    }
}

// PredictionSettlement is a standalone record (no base unified struct): one settled outcome
// the user held, with the collateral paid in and paid out. Mirrors the PredictionSettlement
// interface in ts/src/base/types.ts.
public struct PredictionSettlement
{
    public string? id;
    public Int64? timestamp;
    public string? datetime;
    public string? outcome;
    public string? outcomeId;
    public string? market;
    public string? eventId;
    public string? result;
    public bool? won;
    public double? amount;
    public double? price;
    public double? cost;
    public double? payout;
    public double? pnl;
    public Dictionary<string, object>? info;

    public PredictionSettlement(object settlement)
    {
        id = Exchange.SafeString(settlement, "id");
        info = Helper.GetInfo(settlement);
        timestamp = Exchange.SafeInteger(settlement, "timestamp");
        datetime = Exchange.SafeString(settlement, "datetime");
        outcome = Exchange.SafeString(settlement, "outcome");
        outcomeId = Exchange.SafeString(settlement, "outcomeId");
        market = Exchange.SafeString(settlement, "market");
        eventId = Exchange.SafeString(settlement, "event");
        result = Exchange.SafeString(settlement, "result");
        won = Exchange.SafeValue(settlement, "won") != null ? (bool)Exchange.SafeValue(settlement, "won") : null;
        amount = Exchange.SafeFloat(settlement, "amount");
        price = Exchange.SafeFloat(settlement, "price");
        cost = Exchange.SafeFloat(settlement, "cost");
        payout = Exchange.SafeFloat(settlement, "payout");
        pnl = Exchange.SafeFloat(settlement, "pnl");
    }
}
