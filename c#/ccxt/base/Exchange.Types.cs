namespace ccxt;

//
// Exchange Types that are used in the Exchange.Wrappers.cs file to type the generic methods
//

public partial class Exchange
{

    public struct Precision
    {
        public double? amount;
        public double? price;
        public Precision(object precision2)
        {
            var precision = (Dictionary<string, object>)precision2;
            amount = SafeFloat(precision, "amount");
            price = SafeFloat(precision, "price");
        }
    }

    public struct MinMax
    {
        public double? min;
        public double? max;
        public MinMax(object minMax2)
        {
            var minMax = (Dictionary<string, object>)minMax2;
            min = SafeFloat(minMax, "min");
            max = SafeFloat(minMax, "max");
        }
    }

    public struct Fee
    {
        public double? rate;
        public double? cost;

        public Fee(object fee2)
        {
            var fee = (Dictionary<string, object>)fee2;
            rate = SafeFloat(fee, "rate");
            cost = SafeFloat(fee, "cost");
        }
    }

    public struct Limits
    {
        public MinMax? amount;
        public MinMax? cost;
        public MinMax? leverage;
        public MinMax? price;

        public Limits(object limits2)
        {
            var limits = (Dictionary<string, object>)limits2;
            amount = limits.ContainsKey("amount") ? new MinMax(limits["amount"]) : null;
            cost = limits.ContainsKey("cost") ? new MinMax(limits["cost"]) : null;
            leverage = limits.ContainsKey("leverage") ? new MinMax(limits["leverage"]) : null;
            price = limits.ContainsKey("price") ? new MinMax(limits["price"]) : null;
        }
    }

    public struct Market
    {
        public string? id;
        public string? symbol;
        public string? baseCurrency;
        public string? quote;
        public string? baseId;
        public string? quoteId;
        public bool? active;
        public string? type;
        public bool? spot;
        public bool? margin;
        public bool? swap;
        public bool? future;
        public bool? option;
        public bool? contract;
        public string? settle;
        public string? settleId;
        public double? contractSize;
        public bool? linear;
        public bool? inverse;
        public double? expiry;
        public string? expiryDatetime;
        public double? strike;
        public string? optionType;
        public double? taker;
        public double? maker;
        public bool? percentage;
        public bool? tierBased;
        public string? feeSide;

        public Precision? precision;

        public Limits? limits;
        public Dictionary<string, object> info;

        public Market(object market2)
        {
            var market = (Dictionary<string, object>)market2;
            id = SafeString(market, "id");
            symbol = SafeString(market, "symbol");
            baseCurrency = SafeString(market, "base");
            quote = SafeString(market, "quote");
            baseId = SafeString(market, "baseId");
            quoteId = SafeString(market, "quoteId");
            active = market.ContainsKey("active") && market["active"] != null ? (bool)market["active"] : null;
            type = SafeString(market, "type");
            spot = market.ContainsKey("spot") && market["spot"] != null ? (bool)market["spot"] : null;
            margin = market.ContainsKey("margin") && market["margin"] != null ? (bool)market["margin"] : null;
            swap = market.ContainsKey("swap") && market["swap"] != null ? (bool)market["swap"] : null;
            future = market.ContainsKey("future") && market["future"] != null ? (bool)market["future"] : null;
            option = market.ContainsKey("option") && market["option"] != null ? (bool)market["option"] : null;
            contract = market.ContainsKey("contract") && market["contract"] != null ? (bool)market["contract"] : null;
            settle = SafeString(market, "settle");
            settleId = SafeString(market, "settleId");
            contractSize = SafeFloat(market, "contractSize");
            linear = market.ContainsKey("linear") && market["linear"] != null ? (bool)market["linear"] : null;
            inverse = market.ContainsKey("inverse") && market["inverse"] != null ? (bool)market["inverse"] : null;
            expiry = SafeFloat(market, "expiry");
            expiryDatetime = SafeString(market, "expiryDatetime");
            strike = SafeFloat(market, "strike");
            optionType = SafeString(market, "optionType");
            taker = SafeFloat(market, "taker");
            maker = SafeFloat(market, "maker");
            percentage = market.ContainsKey("percentage") && market["percentage"] != null ? (bool)market["percentage"] : null;
            tierBased = market.ContainsKey("tierBased") && market["tierBased"] != null ? (bool)market["tierBased"] : null;
            feeSide = SafeString(market, "feeSide");
            precision = market.ContainsKey("precision") ? new Precision(market["precision"]) : null;
            limits = market.ContainsKey("limits") ? new Limits(market["limits"]) : null;
            info = market;
        }
    }

    public struct Trade
    {
        public double? amount;
        public double? price;
        public double? cost;
        public string? id;
        public string? orderId;
        public Dictionary<string, object>? info;
        public Int64? timestamp;
        public string? datetime;
        public string? symbol;
        public string? type;
        public string? side;
        public string? takerOrMaker;
        public Fee? fee;
        public Trade(object trade2)
        {
            var trade = (Dictionary<string, object>)trade2;
            amount = SafeFloat(trade, "amount");
            price = SafeFloat(trade, "price");
            cost = SafeFloat(trade, "cost");
            id = SafeString(trade, "id");
            orderId = SafeString(trade, "orderId");
            info = trade.ContainsKey("info") ? (Dictionary<string, object>)trade["info"] : null;
            timestamp = SafeInteger(trade, "timestamp");
            datetime = SafeString(trade, "datetime");
            symbol = SafeString(trade, "symbol");
            type = SafeString(trade, "type");
            side = SafeString(trade, "side");
            takerOrMaker = SafeString(trade, "takerOrMaker");
            fee = trade.ContainsKey("fee") ? new Fee(trade["fee"]) : null;
        }
    }

    public struct Order
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
        public double? remaining;
        public string? status;
        public Fee? fee;
        public IEnumerable<Trade>? trades;
        public Dictionary<string, object>? info;
        public Order(object order2)
        {
            var order = (Dictionary<string, object>)order2;
            id = SafeString(order, "id");
            clientOrderId = SafeString(order, "clientOrderId");
            timestamp = SafeInteger(order, "timestamp");
            datetime = SafeString(order, "datetime");
            lastTradeTimestamp = SafeString(order, "lastTradeTimestamp");
            symbol = SafeString(order, "symbol");
            type = SafeString(order, "type");
            side = SafeString(order, "side");
            price = SafeFloat(order, "price");
            cost = SafeFloat(order, "cost");
            average = SafeFloat(order, "average");
            amount = SafeFloat(order, "amount");
            filled = SafeFloat(order, "filled");
            remaining = SafeFloat(order, "remaining");
            status = SafeString(order, "status");
            fee = order.ContainsKey("fee") ? new Fee(order["fee"]) : null;
            trades = order.ContainsKey("trades") ? ((IEnumerable<object>)order["trades"]).Select(x => new Trade(x)) : null;
            info = order.ContainsKey("info") ? (Dictionary<string, object>)order["info"] : null;
        }
    }

    public struct Ticker
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

        public Ticker(object ticker2)
        {
            var ticker = (Dictionary<string, object>)ticker2;
            symbol = SafeString(ticker, "symbol");
            timestamp = SafeInteger(ticker, "timestamp");
            datetime = SafeString(ticker, "datetime");
            high = SafeFloat(ticker, "high");
            low = SafeFloat(ticker, "low");
            bid = SafeFloat(ticker, "bid");
            bidVolume = SafeFloat(ticker, "bidVolume");
            ask = SafeFloat(ticker, "ask");
            askVolume = SafeFloat(ticker, "askVolume");
            vwap = SafeFloat(ticker, "vwap");
            open = SafeFloat(ticker, "open");
            close = SafeFloat(ticker, "close");
            last = SafeFloat(ticker, "last");
            previousClose = SafeFloat(ticker, "previousClose");
            change = SafeFloat(ticker, "change");
            percentage = SafeFloat(ticker, "percentage");
            average = SafeFloat(ticker, "average");
            baseVolume = SafeFloat(ticker, "baseVolume");
            quoteVolume = SafeFloat(ticker, "quoteVolume");
        }

        struct Transaction
        {
            public string? id;
            public string? txid;
            public string? address;
            public string? tag;
            public string? type;
            public string? currency;
            public double? amount;
            public string? status;
            public Int64? updated;
            public Int64? timestamp;
            public string? datetime;

            public Transaction(object transaction2)
            {
                var transaction = (Dictionary<string, object>)transaction2;
                id = SafeString(transaction, "id");
                txid = SafeString(transaction, "txid");
                address = SafeString(transaction, "address");
                tag = SafeString(transaction, "tag");
                type = SafeString(transaction, "type");
                currency = SafeString(transaction, "currency");
                amount = SafeFloat(transaction, "amount");
                status = SafeString(transaction, "status");
                updated = SafeInteger(transaction, "updated");
                timestamp = SafeInteger(transaction, "timestamp");
                datetime = SafeString(transaction, "datetime");
            }
        }
    }

    public struct OrderBook
    {
        public List<List<float>>? bids;
        public List<List<float>>? asks;

        public string? symbol;
        public Int64? timestamp;
        public string? datetime;
        public Int64? nonce;

        public OrderBook(object orderbook2)
        {
            var orderbook = (Dictionary<string, object>)orderbook2;
            bids = orderbook.ContainsKey("bids") ? ((IEnumerable<object>)orderbook["bids"]).Select(x => ((IEnumerable<object>)x).Select(y => (float)y).ToList()).ToList() : null;
            asks = orderbook.ContainsKey("asks") ? ((IEnumerable<object>)orderbook["asks"]).Select(x => ((IEnumerable<object>)x).Select(y => (float)y).ToList()).ToList() : null;
            symbol = SafeString(orderbook, "symbol");
            timestamp = SafeInteger(orderbook, "timestamp");
            datetime = SafeString(orderbook, "datetime");
            nonce = SafeInteger(orderbook, "nonce");
        }
    }

    public struct OHLCV
    {
        public Int64? timestamp;
        public double? open;
        public double? high;
        public double? low;
        public double? close;
        public double? volume;

        public OHLCV(object ohlcv2)
        {
            var ohlcv = (List<object>)ohlcv2;
            timestamp = SafeInteger(ohlcv, 0);
            open = SafeFloat(ohlcv, 1);
            high = SafeFloat(ohlcv, 2);
            low = SafeFloat(ohlcv, 3);
            close = SafeFloat(ohlcv, 4);
            volume = SafeFloat(ohlcv, 5);
        }
    }

    public struct OHLCVC
    {
        public Int64? timestamp;
        public double? open;
        public double? high;
        public double? low;
        public double? close;
        public double? volume;
        public double? cost;

        public OHLCVC(object ohlcv2)
        {
            var ohlcv = (List<object>)ohlcv2;
            timestamp = SafeInteger(ohlcv, 0);
            open = SafeFloat(ohlcv, 1);
            high = SafeFloat(ohlcv, 2);
            low = SafeFloat(ohlcv, 3);
            close = SafeFloat(ohlcv, 4);
            volume = SafeFloat(ohlcv, 5);
            cost = SafeFloat(ohlcv, 6);
        }
    }

    public struct Balance
    {
        public double? free;
        public double? used;
        public double? total;

        public Balance(object balance2)
        {
            var balance = (Dictionary<string, object>)balance2;
            free = SafeFloat(balance, "free");
            used = SafeFloat(balance, "used");
            total = SafeFloat(balance, "total");
        }
    }

    public struct Balances
    {
        public Dictionary<string, Balance> balances;
        public Dictionary<string, object> info;

        public Balances(object balances2)
        {
            var balances = (Dictionary<string, object>)balances2;
            this.balances = new Dictionary<string, Balance>();
            foreach (var balance in balances)
            {
                if (balance.Key != "info" && balance.Key != "free" && balance.Key != "used" && balance.Key != "total")
                {
                    this.balances.Add(balance.Key, new Balance(balance.Value));
                }
            }
            info = (Dictionary<string, object>)balances["info"];
        }
    }

    public struct WithdrawlResponse
    {
        public Dictionary<string, object> info;
        public string? id;

        public WithdrawlResponse(object withdrawlResponse2)
        {
            var withdrawlResponse = (Dictionary<string, object>)withdrawlResponse2;
            info = (Dictionary<string, object>)withdrawlResponse["info"];
            id = SafeString(withdrawlResponse, "id");
        }
    }

    public struct DepositAddressResponse
    {
        public string? address;
        public string? tag;
        public string? status;
        public Dictionary<string, object>? info;

        public DepositAddressResponse(object depositAddressResponse2)
        {
            var depositAddressResponse = (Dictionary<string, object>)depositAddressResponse2;
            address = SafeString(depositAddressResponse, "address");
            tag = SafeString(depositAddressResponse, "tag");
            status = SafeString(depositAddressResponse, "status");
            info = depositAddressResponse.ContainsKey("info") ? (Dictionary<string, object>)depositAddressResponse["info"] : null;
        }
    }
}
