using ccxt;
using Newtonsoft.Json;

namespace examples;

partial class Examples
{
    public async static Task CreateOrder()
    {
        var exchange = new Bybit();
        exchange.apiKey = Environment.GetEnvironmentVariable("BYBIT_APIKEY");
        exchange.secret = Environment.GetEnvironmentVariable("BYBIT_SECRET");
        exchange.setSandboxMode(true);
        var parameters = new Dictionary<string, object>() { { "stopPrice", 120 } };
        var order = await exchange.CreateOrder("LTC/USDT", "limit", "buy", 1, 50, parameters);
        var orderId = order.id;
        Console.WriteLine("Placed Order: Order Id: " + orderId);

        // fetch Order
        var orders = await exchange.FetchOpenOrders("LTC/USDT");
        Console.WriteLine("Fetched Order: " + JsonConvert.SerializeObject(orders, Formatting.Indented));
    }
}