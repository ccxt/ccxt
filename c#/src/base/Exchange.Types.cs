namespace Main;

//
// Exchange Types that are used in the Exchange.Wrappers.cs file to type the generic methods
//

public partial class Exchange
{

    public struct Precision
    {
        public float amount;
        public float price;
        public Precision(object precision2)
        {
            var precision = (Dictionary<string, object>)precision2;
            amount = precision.ContainsKey("amount") ? (float)precision["amount"] : 0;
            price = precision.ContainsKey("price") ? (float)precision["price"] : 0;
        }
    }

    public struct MinMax
    {
        public float min;
        public float max;
        public MinMax(object minMax2)
        {
            var minMax = (Dictionary<string, object>)minMax2;
            min = minMax.ContainsKey("min") ? (float)minMax["min"] : 0;
            max = minMax.ContainsKey("max") ? (float)minMax["max"] : 0;
        }
    }

    public struct Fee
    {
        public float rate;
        public float cost;

        public Fee(object fee2)
        {
            var fee = (Dictionary<string, object>)fee2;
            rate = fee.ContainsKey("rate") ? (float)fee["rate"] : 0;
            cost = fee.ContainsKey("cost") ? (float)fee["cost"] : 0;
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
        public float contractSize;
        public bool? linear;
        public bool? inverse;
        public float expiry;
        public string? expiryDatetime;
        public float strike;
        public string? optionType;
        public float taker;
        public float maker;
        public bool? percentage;
        public bool? tierBased;
        public string? feeSide;

        public Precision? precision;

        public Limits? limits;
        public Dictionary<string, object> info;

        public Market(object market2)
        {
            var market = (Dictionary<string, object>)market2;
            id = market.ContainsKey("id") ? (string)market["id"] : null;
            symbol = market.ContainsKey("symbol") ? (string)market["symbol"] : null;
            baseCurrency = market.ContainsKey("base") ? (string)market["base"] : null;
            quote = market.ContainsKey("quote") ? (string)market["quote"] : null;
            baseId = market.ContainsKey("baseId") ? (string)market["baseId"] : null;
            quoteId = market.ContainsKey("quoteId") ? (string)market["quoteId"] : null;
            active = market.ContainsKey("active") ? (bool)market["active"] : null;
            type = market.ContainsKey("type") ? (string)market["type"] : null;
            spot = market.ContainsKey("spot") ? (bool)market["spot"] : null;
            margin = market.ContainsKey("margin") ? (bool)market["margin"] : null;
            swap = market.ContainsKey("swap") ? (bool)market["swap"] : null;
            future = market.ContainsKey("future") ? (bool)market["future"] : null;
            option = market.ContainsKey("option") ? (bool)market["option"] : null;
            contract = market.ContainsKey("contract") ? (bool)market["contract"] : null;
            settle = market.ContainsKey("settle") ? (string)market["settle"] : null;
            settleId = market.ContainsKey("settleId") ? (string)market["settleId"] : null;
            contractSize = market.ContainsKey("contractSize") ? (float)market["contractSize"] : 0;
            linear = market.ContainsKey("linear") ? (bool)market["linear"] : null;
            inverse = market.ContainsKey("inverse") ? (bool)market["inverse"] : null;
            expiry = market.ContainsKey("expiry") ? (float)market["expiry"] : 0;
            expiryDatetime = market.ContainsKey("expiryDatetime") ? (string)market["expiryDatetime"] : null;
            strike = market.ContainsKey("strike") ? (float)market["strike"] : 0;
            optionType = market.ContainsKey("optionType") ? (string)market["optionType"] : null;
            taker = market.ContainsKey("taker") ? (float)market["taker"] : 0;
            maker = market.ContainsKey("maker") ? (float)market["maker"] : 0;
            percentage = market.ContainsKey("percentage") ? (bool)market["percentage"] : null;
            tierBased = market.ContainsKey("tierBased") ? (bool)market["tierBased"] : null;
            feeSide = market.ContainsKey("feeSide") ? (string)market["feeSide"] : null;
            precision = market.ContainsKey("precision") ? new Precision(market["precision"]) : null;
            limits = market.ContainsKey("limits") ? new Limits(market["limits"]) : null;
            info = market;
        }
    }

    public struct Trade
    {
        public float amount;
        public float price;
        public float cost;
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
            amount = trade.ContainsKey("amount") ? (float)trade["amount"] : 0;
            price = trade.ContainsKey("price") ? (float)trade["price"] : 0;
            cost = trade.ContainsKey("cost") ? (float)trade["cost"] : 0;
            id = trade.ContainsKey("id") ? (string)trade["id"] : null;
            orderId = trade.ContainsKey("orderId") ? (string)trade["orderId"] : null;
            info = trade.ContainsKey("info") ? (Dictionary<string, object>)trade["info"] : null;
            timestamp = trade.ContainsKey("timestamp") ? (Int64)trade["timestamp"] : null;
            datetime = trade.ContainsKey("datetime") ? (string)trade["datetime"] : null;
            symbol = trade.ContainsKey("symbol") ? (string)trade["symbol"] : null;
            type = trade.ContainsKey("type") ? (string)trade["type"] : null;
            side = trade.ContainsKey("side") ? (string)trade["side"] : null;
            takerOrMaker = trade.ContainsKey("takerOrMaker") ? (string)trade["takerOrMaker"] : null;
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
        public string? price;
        public float? cost;
        public float? average;
        public float? amount;
        public float? filled;
        public float? remaining;
        public string? status;
        public Fee? fee;
        public IEnumerable<Trade>? trades;
        public Dictionary<string, object>? info;
        public Order(object order2)
        {
            var order = (Dictionary<string, object>)order2;
            id = order.ContainsKey("id") ? (string)order["id"] : null;
            clientOrderId = order.ContainsKey("clientOrderId") ? (string)order["clientOrderId"] : null;
            timestamp = order.ContainsKey("timestamp") ? (Int64)order["timestamp"] : null;
            datetime = order.ContainsKey("datetime") ? (string)order["datetime"] : null;
            lastTradeTimestamp = order.ContainsKey("lastTradeTimestamp") ? (string)order["lastTradeTimestamp"] : null;
            symbol = order.ContainsKey("symbol") ? (string)order["symbol"] : null;
            type = order.ContainsKey("type") ? (string)order["type"] : null;
            side = order.ContainsKey("side") ? (string)order["side"] : null;
            price = order.ContainsKey("price") ? (string)order["price"] : null;
            cost = order.ContainsKey("cost") ? (float)order["cost"] : null;
            average = order.ContainsKey("average") ? (float)order["average"] : null;
            amount = order.ContainsKey("amount") ? (float)order["amount"] : null;
            filled = order.ContainsKey("filled") ? (float)order["filled"] : null;
            remaining = order.ContainsKey("remaining") ? (float)order["remaining"] : null;
            status = order.ContainsKey("status") ? (string)order["status"] : null;
            fee = order.ContainsKey("fee") ? new Fee(order["fee"]) : null;
            trades = order.ContainsKey("trades") ? ((IEnumerable<object>)order["trades"]).Select(x => new Trade(x)) : null;
            info = order.ContainsKey("info") ? (Dictionary<string, object>)order["info"] : null;
        }
    }

    public struct Ticker
    {
        public string? symbol;
        public Int64 timestamp;
        public string? datetime;
        public float high;
        public float low;
        public float bid;
        public float bidVolume;
        public float ask;
        public float askVolume;
        public float vwap;
        public float open;

        public float close;
        public float last;
        public float previousClose;
        public float change;
        public float percentage;
        public float average;
        public float baseVolume;
        public float quoteVolume;

        public Ticker(object ticker2)
        {
            var ticker = (Dictionary<string, object>)ticker2;
            symbol = ticker.ContainsKey("symbol") ? (string)ticker["symbol"] : null;
            timestamp = ticker.ContainsKey("timestamp") ? (Int64)ticker["timestamp"] : 0;
            datetime = ticker.ContainsKey("datetime") ? (string)ticker["datetime"] : null;
            high = ticker.ContainsKey("high") ? (float)ticker["high"] : 0;
            low = ticker.ContainsKey("low") ? (float)ticker["low"] : 0;
            bid = ticker.ContainsKey("bid") ? (float)ticker["bid"] : 0;
            bidVolume = ticker.ContainsKey("bidVolume") ? (float)ticker["bidVolume"] : 0;
            ask = ticker.ContainsKey("ask") ? (float)ticker["ask"] : 0;
            askVolume = ticker.ContainsKey("askVolume") ? (float)ticker["askVolume"] : 0;
            vwap = ticker.ContainsKey("vwap") ? (float)ticker["vwap"] : 0;
            open = ticker.ContainsKey("open") ? (float)ticker["open"] : 0;
            close = ticker.ContainsKey("close") ? (float)ticker["close"] : 0;
            last = ticker.ContainsKey("last") ? (float)ticker["last"] : 0;
            previousClose = ticker.ContainsKey("previousClose") ? (float)ticker["previousClose"] : 0;
            change = ticker.ContainsKey("change") ? (float)ticker["change"] : 0;
            percentage = ticker.ContainsKey("percentage") ? (float)ticker["percentage"] : 0;
            average = ticker.ContainsKey("average") ? (float)ticker["average"] : 0;
            baseVolume = ticker.ContainsKey("baseVolume") ? (float)ticker["baseVolume"] : 0;
            quoteVolume = ticker.ContainsKey("quoteVolume") ? (float)ticker["quoteVolume"] : 0;
        }

        struct Transaction
        {
            public string? id;
            public string? txid;
            public string? address;
            public string? tag;
            public string? type;
            public string? currency;
            public float amount;
            public string? status;
            public Int64? updated;
            public Int64? timestamp;
            public string? datetime;

            public Transaction(object transaction2)
            {
                var transaction = (Dictionary<string, object>)transaction2;
                id = transaction.ContainsKey("id") ? (string)transaction["id"] : null;
                txid = transaction.ContainsKey("txid") ? (string)transaction["txid"] : null;
                address = transaction.ContainsKey("address") ? (string)transaction["address"] : null;
                tag = transaction.ContainsKey("tag") ? (string)transaction["tag"] : null;
                type = transaction.ContainsKey("type") ? (string)transaction["type"] : null;
                currency = transaction.ContainsKey("currency") ? (string)transaction["currency"] : null;
                amount = transaction.ContainsKey("amount") ? (float)transaction["amount"] : 0;
                status = transaction.ContainsKey("status") ? (string)transaction["status"] : null;
                updated = transaction.ContainsKey("updated") ? (Int64)transaction["updated"] : null;
                timestamp = transaction.ContainsKey("timestamp") ? (Int64)transaction["timestamp"] : null;
                datetime = transaction.ContainsKey("datetime") ? (string)transaction["datetime"] : null;
            }
        }
    }

    public struct OrderBook
    {
        public List<List<float>>? bids;
        public List<List<float>>? asks;

        public string? symbol;
        public Int64 timestamp;
        public string? datetime;
        public Int64? nonce;

        public OrderBook(object orderbook2)
        {
            var orderbook = (Dictionary<string, object>)orderbook2;
            bids = orderbook.ContainsKey("bids") ? ((IEnumerable<object>)orderbook["bids"]).Select(x => ((IEnumerable<object>)x).Select(y => (float)y).ToList()).ToList() : null;
            asks = orderbook.ContainsKey("asks") ? ((IEnumerable<object>)orderbook["asks"]).Select(x => ((IEnumerable<object>)x).Select(y => (float)y).ToList()).ToList() : null;
            symbol = orderbook.ContainsKey("symbol") ? (string)orderbook["symbol"] : null;
            timestamp = orderbook.ContainsKey("timestamp") ? (Int64)orderbook["timestamp"] : 0;
            datetime = orderbook.ContainsKey("datetime") ? (string)orderbook["datetime"] : null;
            nonce = orderbook.ContainsKey("nonce") ? (Int64)orderbook["nonce"] : null;
        }
    }

    public struct OHLCV
    {
        public Int64 timestamp;
        public float open;
        public float high;
        public float low;
        public float close;
        public float volume;

        public OHLCV(object ohlcv2)
        {
            var ohlcv = (List<object>)ohlcv2;
            timestamp = (Int64)ohlcv[0];
            open = (float)ohlcv[1];
            high = (float)ohlcv[2];
            low = (float)ohlcv[3];
            close = (float)ohlcv[4];
            volume = (float)ohlcv[5];
        }
    }

    public struct OHLCVC
    {
        public Int64 timestamp;
        public float open;
        public float high;
        public float low;
        public float close;
        public float volume;
        public float cost;

        public OHLCVC(object ohlcv2)
        {
            var ohlcv = (List<object>)ohlcv2;
            timestamp = (Int64)ohlcv[0];
            open = (float)ohlcv[1];
            high = (float)ohlcv[2];
            low = (float)ohlcv[3];
            close = (float)ohlcv[4];
            volume = (float)ohlcv[5];
            cost = (float)ohlcv[6];
        }
    }
}
