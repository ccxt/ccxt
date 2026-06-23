```csharp
using ccxt;

namespace examples;

// Prediction markets example
//
// Prediction-market exchanges live in the ccxt.prediction namespace and extend
// PredictionExchange, which adds events/outcomes helpers on top of Exchange.

partial class Examples
{
    public static void PredictionMarkets()
    {
        var exchange = new ccxt.prediction.polymarket();
        Console.WriteLine("id: " + exchange.id);
        Console.WriteLine("isPrediction: " + exchange.isPrediction());
        var markets = exchange.FetchMarkets();
        markets.Wait();
        Console.WriteLine("fetched markets: " + markets.Result.Count);
    }
}

```
