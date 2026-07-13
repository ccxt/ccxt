using ccxt;

namespace examples;

// Polymarket end-to-end example (read market data + place/fetch/cancel one order).
//
// Flow:
//   1. pick a high-volume event, a market inside it, and an outcome with a live two-sided book
//   2. fetch the order book, ticker and recent trades for that outcome
//   3. place a resting limit BUY well below the book, fetch it back, then cancel it
//
// Usage:
//   POLYMARKET_PRIVATEKEY=... POLYMARKET_WALLETADDRESS=0x... dotnet run
//
// walletAddress is the polymarket account wallet (the proxy / deposit wallet shown in
// your polymarket profile), privateKey is the key of the EOA that owns it.

partial class Examples
{
    const double MaxNotionalUsd = 25;  // hard cap per trade
    const double OrderSizeShares = 5;  // polymarket minimum order size

    public static async Task PolymarketEndToEnd()
    {
        var privateKey = Environment.GetEnvironmentVariable("POLYMARKET_PRIVATEKEY");
        var walletAddress = Environment.GetEnvironmentVariable("POLYMARKET_WALLETADDRESS");
        if (string.IsNullOrEmpty(privateKey) || string.IsNullOrEmpty(walletAddress))
        {
            Console.WriteLine("Set POLYMARKET_PRIVATEKEY and POLYMARKET_WALLETADDRESS env vars first.");
            return;
        }
        var exchange = new ccxt.prediction.polymarket(new Dictionary<string, object>() {
            { "privateKey", privateKey },
            { "walletAddress", walletAddress },
        });

        // 1) pick a high-volume event and an outcome with a live two-sided book ------------
        var events = await exchange.FetchEvents(new Dictionary<string, object>() { { "sort", "volume" }, { "limit", 15 } });
        string symbol = null;
        PredictionOrderBook? chosenBook = null;
        double tick = 0.01;
        var probes = 0;
        foreach (var ev in events)
        {
            foreach (var market in ev.markets ?? new List<PredictionMarket>())
            {
                foreach (var outcome in market.outcomes ?? new List<PredictionOutcome>())
                {
                    if (probes >= 20 || outcome.outcome == null)
                    {
                        break;
                    }
                    probes += 1;
                    var book = await exchange.FetchOrderBook(outcome.outcome);
                    if ((book.bids?.Count ?? 0) > 0 && (book.asks?.Count ?? 0) > 0)
                    {
                        symbol = outcome.outcome;
                        chosenBook = book;
                        tick = outcome.precision?.price ?? 0.01;
                        Console.WriteLine("event:    " + ev.title);
                        Console.WriteLine("outcome:  " + symbol + " (" + outcome.label + ")");
                        break;
                    }
                }
                if (symbol != null) break;
            }
            if (symbol != null) break;
        }
        if (symbol == null)
        {
            Console.WriteLine("Could not find an outcome with a live two-sided order book right now.");
            return;
        }

        // 2) market data for the chosen outcome --------------------------------------------
        var bestBid = chosenBook.Value.bids[0];
        var bestAsk = chosenBook.Value.asks[0];
        Console.WriteLine("\n--- market data ---");
        Console.WriteLine("orderbook bid/ask: [" + bestBid[0] + ", " + bestBid[1] + "] / [" + bestAsk[0] + ", " + bestAsk[1] + "]");
        try
        {
            var ticker = await exchange.FetchTicker(symbol);
            Console.WriteLine("ticker bid/ask/last: " + ticker.bid + " / " + ticker.ask + " / " + ticker.last);
        }
        catch (Exception e) { Console.WriteLine("ticker:        n/a (" + e.GetType().Name + ")"); }
        try
        {
            var trades = await exchange.FetchTrades(symbol, null, 3);
            Console.WriteLine("recent trades: " + trades.Count + (trades.Count > 0 ? (" last @ " + trades[0].price) : ""));
        }
        catch (Exception e) { Console.WriteLine("trades:        n/a (" + e.GetType().Name + ")"); }

        // 3) place a resting limit BUY well below the book, fetch it, then cancel -----------
        var bidPrice = bestBid[0];
        // half the best bid, floored to the tick — far below the ask, so it cannot fill
        var price = Math.Max(tick, Math.Round(Math.Floor((bidPrice * 0.5) / tick) * tick, 4));
        var notional = OrderSizeShares * price;
        Console.WriteLine("\n--- order ---");
        Console.WriteLine("placing limit BUY " + OrderSizeShares + " shares @ " + price + " (notional " + Math.Round(notional, 2) + " USD)");
        if (notional >= MaxNotionalUsd)
        {
            Console.WriteLine("ABORT: notional >= " + MaxNotionalUsd + " USD safety cap.");
            return;
        }

        PredictionOrder? order = null;
        try
        {
            order = await exchange.CreateOrder(symbol, "limit", "buy", OrderSizeShares, price);
            Console.WriteLine("placed:  id " + order.Value.id + " | status " + order.Value.status);
            var fetched = await exchange.FetchOrder(order.Value.id, symbol);
            Console.WriteLine("fetched: id " + fetched.id + " | status " + fetched.status + " | remaining " + fetched.remaining);
        }
        finally
        {
            if (order != null && order.Value.id != null)
            {
                var canceled = await exchange.CancelOrder(order.Value.id, symbol);
                Console.WriteLine("canceled: id " + canceled.id + " | status " + canceled.status);
            }
        }
    }
}
