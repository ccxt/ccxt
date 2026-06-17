namespace ccxt;

// Native dedicated prediction-market structs. C# structs cannot inherit, so each
// duplicates its base unified struct's fields (flat typed access) and adds the
// prediction identity fields. The inherited `symbol` is left unpopulated — `outcome`
// (the "MARKET:LABEL" handle) is the canonical identity. Mirrors the
// `Prediction* extends <Base>` interfaces in ts/src/base/types.ts. The transpiler
// wraps a `-> PredictionTicker` return with `new PredictionTicker(res)`.

public struct PredictionTicker
{
    public string? symbol;
    public Int64? timestamp;
    public string? datetime;
    public double? high;
    public double? low;
    public double? bid;
    public double? bidVolume;
    public double? ask;
    public double? askVolume;
    public double? vwap;
    public double? open;
    public double? close;
    public double? last;
    public double? previousClose;
    public double? change;
    public double? percentage;
    public double? average;
    public double? baseVolume;
    public double? quoteVolume;
    public double? indexPrice;
    public double? markPrice;
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
        symbol = Exchange.SafeString(ticker, "symbol");
        timestamp = Exchange.SafeInteger(ticker, "timestamp");
        datetime = Exchange.SafeString(ticker, "datetime");
        high = Exchange.SafeFloat(ticker, "high");
        low = Exchange.SafeFloat(ticker, "low");
        bid = Exchange.SafeFloat(ticker, "bid");
        bidVolume = Exchange.SafeFloat(ticker, "bidVolume");
        ask = Exchange.SafeFloat(ticker, "ask");
        askVolume = Exchange.SafeFloat(ticker, "askVolume");
        vwap = Exchange.SafeFloat(ticker, "vwap");
        open = Exchange.SafeFloat(ticker, "open");
        close = Exchange.SafeFloat(ticker, "close");
        last = Exchange.SafeFloat(ticker, "last");
        previousClose = Exchange.SafeFloat(ticker, "previousClose");
        change = Exchange.SafeFloat(ticker, "change");
        percentage = Exchange.SafeFloat(ticker, "percentage");
        average = Exchange.SafeFloat(ticker, "average");
        baseVolume = Exchange.SafeFloat(ticker, "baseVolume");
        quoteVolume = Exchange.SafeFloat(ticker, "quoteVolume");
        indexPrice = Exchange.SafeFloat(ticker, "indexPrice");
        markPrice = Exchange.SafeFloat(ticker, "markPrice");
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
    public string? symbol;
    public string? type;
    public string? side;
    public double? price;
    public double? cost;
    public double? average;
    public double? amount;
    public double? filled;
    public double? triggerPrice;
    public double? stopLossPrice;
    public double? takeProfitPrice;
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
        symbol = Exchange.SafeString(order, "symbol");
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
        triggerPrice = Exchange.SafeFloat(order, "triggerPrice");
        stopLossPrice = Exchange.SafeFloat(order, "stopLossPrice");
        takeProfitPrice = Exchange.SafeFloat(order, "takeProfitPrice");
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
    public string? symbol;
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
        symbol = Exchange.SafeString(trade, "symbol");
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
    public string symbol;
    public string? id;
    public double? timestamp;
    public string? datetime;
    public double? contracts;
    public double? contractsSize;
    public string? side;
    public double? notional;
    public double? leverage;
    public double? unrealizedPnl;
    public double? realizedPnl;
    public double? collateral;
    public double? entryPrice;
    public double? markPrice;
    public double? liquidationPrice;
    public double? stopLossPrice;
    public double? takeProfitPrice;
    public string? marginMode;
    public bool? hedged;
    public double? maintenenceMargin;
    public double? maintenanceMarginPercentage;
    public double? initialMargin;
    public double? initialMarginPercentage;
    public double? marginRatio;
    public double? lastUpdateTimestamp;
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
        symbol = Exchange.SafeString(position, "symbol");
        id = Exchange.SafeString(position, "id");
        info = Helper.GetInfo(position);
        timestamp = Exchange.SafeInteger(position, "timestamp");
        datetime = Exchange.SafeString(position, "datetime");
        contracts = Exchange.SafeFloat(position, "contracts");
        contractsSize = Exchange.SafeFloat(position, "contractsSize");
        side = Exchange.SafeString(position, "side");
        notional = Exchange.SafeFloat(position, "notional");
        leverage = Exchange.SafeFloat(position, "leverage");
        unrealizedPnl = Exchange.SafeFloat(position, "unrealizedPnl");
        realizedPnl = Exchange.SafeFloat(position, "realizedPnl");
        collateral = Exchange.SafeFloat(position, "collateral");
        entryPrice = Exchange.SafeFloat(position, "entryPrice");
        markPrice = Exchange.SafeFloat(position, "markPrice");
        liquidationPrice = Exchange.SafeFloat(position, "liquidationPrice");
        marginMode = Exchange.SafeString(position, "marginMode");
        hedged = Exchange.SafeValue(position, "hedged") != null ? (bool)Exchange.SafeValue(position, "hedged") : null;
        maintenenceMargin = Exchange.SafeFloat(position, "maintenenceMargin");
        maintenanceMarginPercentage = Exchange.SafeFloat(position, "maintenanceMarginPercentage");
        initialMargin = Exchange.SafeFloat(position, "initialMargin");
        initialMarginPercentage = Exchange.SafeFloat(position, "initialMarginPercentage");
        marginRatio = Exchange.SafeFloat(position, "marginRatio");
        lastUpdateTimestamp = Exchange.SafeFloat(position, "lastUpdateTimestamp");
        lastPrice = Exchange.SafeFloat(position, "lastPrice");
        percentage = Exchange.SafeFloat(position, "percentage");
        takeProfitPrice = Exchange.SafeFloat(position, "takeProfitPrice");
        stopLossPrice = Exchange.SafeFloat(position, "stopLossPrice");
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
