using ccxt;
using Newtonsoft.Json;

namespace examples;

partial class Examples
{
    public static void Main(string[] args)
    {
        // FetchMarkets();
        // FetchTrades();
        // FetchOrderBook();
        // FetchBalance().Wait();
        // FetchPositions().Wait();
        watchTradesForSymbols().Wait();
    }
}