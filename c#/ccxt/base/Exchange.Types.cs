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
        public List<List<double>>? bids;
        public List<List<double>>? asks;

        public string? symbol;
        public Int64? timestamp;
        public string? datetime;
        public Int64? nonce;

        public OrderBook(object orderbook2)
        {
            var orderbook = (Dictionary<string, object>)orderbook2;
            bids = orderbook.ContainsKey("bids") ? ((IEnumerable<object>)orderbook["bids"]).Select(x => ((IEnumerable<object>)x).Select(y => (double)y).ToList()).ToList() : null;
            asks = orderbook.ContainsKey("asks") ? ((IEnumerable<object>)orderbook["asks"]).Select(x => ((IEnumerable<object>)x).Select(y => (double)y).ToList()).ToList() : null;
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

    public struct BorrowRate
    {
        public string? currency;
        public double? rate;
        public Int64? timestamp;
        public string? datetime;
        public Dictionary<string, object> info;

        public BorrowRate(object borrowRate)
        {
            var borrowRate2 = (Dictionary<string, object>)borrowRate;
            currency = SafeString(borrowRate2, "currency");
            rate = SafeFloat(borrowRate2, "rate");
            timestamp = SafeInteger(borrowRate2, "timestamp");
            datetime = SafeString(borrowRate2, "datetime");
            info = borrowRate2.ContainsKey("info") ? (Dictionary<string, object>)borrowRate2["info"] : null;
        }
    }

    public struct BorrowInterest
    {
        public string? account;
        public string? currency;
        public double? interest;
        public double? interestRate;
        public double? amountBorrowed;
        public Int64? timestamp;
        public string? datetime;
        public string? marginMode;
        public Dictionary<string, object> info;

        public BorrowInterest(object borrowInterest)
        {
            account = SafeString(borrowInterest, "account");
            currency = SafeString(borrowInterest, "currency");
            interest = SafeFloat(borrowInterest, "interest");
            interestRate = SafeFloat(borrowInterest, "interestRate");
            amountBorrowed = SafeFloat(borrowInterest, "amountBorrowed");
            timestamp = SafeInteger(borrowInterest, "timestamp");
            datetime = SafeString(borrowInterest, "datetime");
            marginMode = SafeString(borrowInterest, "marginMode");
            info = SafeValue(borrowInterest, "info", new Dictionary<string, object>()) as Dictionary<string, object>;
        }
    }

    public struct OpenInterest
    {
        public string? symbol;
        public double? openInterestAmount;
        public double? openInterestValue;
        public Int64? timestamp;
        public string? datetime;
        public Dictionary<string, object> info;

        public OpenInterest(object openInterest)
        {
            symbol = SafeString(openInterest, "symbol");
            openInterestAmount = SafeFloat(openInterest, "openInterestAmount");
            openInterestValue = SafeFloat(openInterest, "openInterestValue");
            timestamp = SafeInteger(openInterest, "timestamp");
            datetime = SafeString(openInterest, "datetime");
            info = SafeValue(openInterest, "info", new Dictionary<string, object>()) as Dictionary<string, object>;
        }
    }

    public struct FundingRate
    {
        public string? symbol;
        public Int64? timestamp;
        public string? datetime;
        public double? fundingRate;
        public double? markPrice;
        public double? indexPrice;
        public double? interestRate;
        public double? estimatedSettlePrice;
        public double? fundingTimestamp;
        public double? nextFundingTimestamp;
        public double? nextFundingRate;
        public Int64? nextFundingDatetime;
        public double? previousFundingTimestamp;
        public string? previousFundingDatetime;
        public double? previousFundingRate;

        public FundingRate(object fundingRateEntry)
        {
            symbol = SafeString(fundingRateEntry, "symbol");
            datetime = SafeString(fundingRateEntry, "datetime");
            timestamp = SafeInteger(fundingRateEntry, "timestamp");
            fundingRate = SafeFloat(fundingRateEntry, "fundingRate");
            markPrice = SafeFloat(fundingRateEntry, "markPrice");
            indexPrice = SafeFloat(fundingRateEntry, "indexPrice");
            interestRate = SafeFloat(fundingRateEntry, "interestRate");
            estimatedSettlePrice = SafeFloat(fundingRateEntry, "estimatedSettlePrice");
            fundingTimestamp = SafeFloat(fundingRateEntry, "fundingTimestamp");
            nextFundingTimestamp = SafeFloat(fundingRateEntry, "nextFundingTimestamp");
            nextFundingRate = SafeFloat(fundingRateEntry, "nextFundingRate");
            nextFundingDatetime = SafeInteger(fundingRateEntry, "nextFundingDatetime");
            previousFundingTimestamp = SafeFloat(fundingRateEntry, "previousFundingTimestamp");
            previousFundingDatetime = SafeString(fundingRateEntry, "previousFundingDatetime");
            previousFundingRate = SafeFloat(fundingRateEntry, "previousFundingRate");
        }
    }

    public struct FundingRateHistory
    {
        public string? symbol;
        public Int64? timestamp;
        public string? datetime;
        public double? fundingRate;

        public FundingRateHistory(object fundingRateEntry)
        {
            symbol = SafeString(fundingRateEntry, "symbol");
            datetime = SafeString(fundingRateEntry, "datetime");
            timestamp = SafeInteger(fundingRateEntry, "timestamp");
            fundingRate = SafeFloat(fundingRateEntry, "fundingRate");
        }
    }


    public struct Transaction
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
        public Fee? fee;
        public string? tagFrom;
        public string? tagTo;
        public string? addressTo;
        public string? addressFrom;
        public string? comment;

        public Transaction(object transaction)
        {
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
            fee = SafeValue(transaction, "fee") != null ? new Fee(SafeValue(transaction, "fee")) : null;
            tagFrom = SafeString(transaction, "tagFrom");
            tagTo = SafeString(transaction, "tagTo");
            addressTo = SafeString(transaction, "addressTo");
            addressFrom = SafeString(transaction, "addressFrom");
            comment = SafeString(transaction, "comment");
        }
    }

    public struct Position
    {
        public string symbol;
        public string? id;
        public Dictionary<string, object>? info;
        public double? timestamp;
        public string? datetime;
        public double? contracts;
        public double? contractsSize;
        public string? side;
        public double? notional;
        public double? leverage;
        public double? unrealizedPnl;
        public double? collateral;
        public double? entryPrice;
        public double? markPrice;
        public double? liquidationPrice;
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

        public Position(object position)
        {
            symbol = SafeString(position, "symbol");
            id = SafeString(position, "id");
            info = SafeValue(position, "info") != null ? (Dictionary<string, object>)SafeValue(position, "info") : null;
            timestamp = SafeInteger(position, "timestamp");
            datetime = SafeString(position, "datetime");
            contracts = SafeFloat(position, "contracts");
            contractsSize = SafeFloat(position, "contractsSize");
            side = SafeString(position, "side");
            notional = SafeFloat(position, "notional");
            leverage = SafeFloat(position, "leverage");
            unrealizedPnl = SafeFloat(position, "unrealizedPnl");
            collateral = SafeFloat(position, "collateral");
            entryPrice = SafeFloat(position, "entryPrice");
            markPrice = SafeFloat(position, "markPrice");
            liquidationPrice = SafeFloat(position, "liquidationPrice");
            marginMode = SafeString(position, "marginMode");
            hedged = SafeValue(position, "hedged") != null ? (bool)SafeValue(position, "hedged") : null;
            maintenenceMargin = SafeFloat(position, "maintenenceMargin");
            maintenanceMarginPercentage = SafeFloat(position, "maintenanceMarginPercentage");
            initialMargin = SafeFloat(position, "initialMargin");
            initialMarginPercentage = SafeFloat(position, "initialMarginPercentage");
            marginRatio = SafeFloat(position, "marginRatio");
            lastUpdateTimestamp = SafeFloat(position, "lastUpdateTimestamp");
            lastPrice = SafeFloat(position, "lastPrice");
            percentage = SafeFloat(position, "percentage");
        }

    }

    public struct LeverageTier
    {
        public Int64? tier;
        public string? currency;
        public double? minNotional;
        public double? maxNotional;
        public double? maintenanceMarginRate;
        public double? maxLeverage;
        public Dictionary<string, object>? info;

        public LeverageTier(object leverageTier)
        {
            tier = SafeInteger(leverageTier, "tier");
            currency = SafeString(leverageTier, "currency");
            minNotional = SafeFloat(leverageTier, "minNotional");
            maxNotional = SafeFloat(leverageTier, "maxNotional");
            maintenanceMarginRate = SafeFloat(leverageTier, "maintenanceMarginRate");
            maxLeverage = SafeFloat(leverageTier, "maxLeverage");
            info = SafeValue(leverageTier, "info") != null ? (Dictionary<string, object>)SafeValue(leverageTier, "info") : null;
        }
    }

    public struct LedgerEntry
    {
        public string? id;
        public Dictionary<string, object>? info;
        public Int64? timestamp;
        public string? datetime;
        public string? direction;
        public string? account;
        public string? referenceId;
        public string? referenceAccount;
        public string? type;
        public string? currency;
        public double? amount;
        public double? before;
        public double? after;
        public string? status;
        public Fee? fee;

        public LedgerEntry(object ledgerEntry)
        {
            id = SafeString(ledgerEntry, "id");
            info = SafeValue(ledgerEntry, "info") != null ? (Dictionary<string, object>)SafeValue(ledgerEntry, "info") : null;
            timestamp = SafeInteger(ledgerEntry, "timestamp");
            datetime = SafeString(ledgerEntry, "datetime");
            direction = SafeString(ledgerEntry, "direction");
            account = SafeString(ledgerEntry, "account");
            referenceId = SafeString(ledgerEntry, "referenceId");
            referenceAccount = SafeString(ledgerEntry, "referenceAccount");
            type = SafeString(ledgerEntry, "type");
            currency = SafeString(ledgerEntry, "currency");
            amount = SafeFloat(ledgerEntry, "amount");
            before = SafeFloat(ledgerEntry, "before");
            after = SafeFloat(ledgerEntry, "after");
            status = SafeString(ledgerEntry, "status");
            fee = SafeValue(ledgerEntry, "fee") != null ? new Fee(SafeValue(ledgerEntry, "fee")) : null;
        }
    }

    public struct DepositWithdrawFeeNetwork
    {
        public double? fee;
        public bool? percentage;

        public DepositWithdrawFeeNetwork(object depositWithdrawFeeNetwork)
        {
            var pct = SafeValue(depositWithdrawFeeNetwork, "percentage");
            fee = SafeFloat(depositWithdrawFeeNetwork, "fee");
            percentage = pct != null ? (bool)pct : null;
        }
    }

    public struct DepositWithdrawFee
    {
        public Dictionary<string, object>? info;
        public DepositWithdrawFeeNetwork? withdraw;
        public DepositWithdrawFeeNetwork? deposit;
        public Dictionary<string, DepositWithdrawFeeNetwork> networks;

        public DepositWithdrawFee(object depositWithdrawFee)
        {
            info = SafeValue(depositWithdrawFee, "info") != null ? (Dictionary<string, object>)SafeValue(depositWithdrawFee, "info") : null;
            withdraw = SafeValue(depositWithdrawFee, "withdraw") != null ? new DepositWithdrawFeeNetwork(SafeValue(depositWithdrawFee, "withdraw")) : null;
            deposit = SafeValue(depositWithdrawFee, "deposit") != null ? new DepositWithdrawFeeNetwork(SafeValue(depositWithdrawFee, "deposit")) : null;
            networks = new Dictionary<string, DepositWithdrawFeeNetwork>();
            if (SafeValue(depositWithdrawFee, "networks") != null)
            {
                var networks2 = (Dictionary<string, object>)SafeValue(depositWithdrawFee, "networks");
                foreach (var network in networks2)
                {
                    networks.Add(network.Key, new DepositWithdrawFeeNetwork(network.Value));
                }
            }
        }
    }

    public struct TransferEntry
    {
        public Dictionary<string, object>? info;

        public string? id;
        public Int64? timestamp;
        public string? datetime;
        public string? currency;
        public double? amount;
        public string? fromAccount;
        public string? toAccount;
        public string? status;

        public TransferEntry(object transfer)
        {
            info = SafeValue(transfer, "info") != null ? (Dictionary<string, object>)SafeValue(transfer, "info") : null;
            id = SafeString(transfer, "id");
            timestamp = SafeInteger(transfer, "timestamp");
            datetime = SafeString(transfer, "datetime");
            currency = SafeString(transfer, "currency");
            amount = SafeFloat(transfer, "amount");
            fromAccount = SafeString(transfer, "fromAccount");
            toAccount = SafeString(transfer, "toAccount");
            status = SafeString(transfer, "status");
        }
    }
}
