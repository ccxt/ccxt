using ccxt;
using Newtonsoft.Json;

namespace examples;

partial class Examples
{
    public async static Task CreateExchangesDynamically()
    {
        var exchangeId = "binance";
        var restInstance = Exchange.DynamicallyCreateInstance(exchangeId);
        Console.WriteLine($"Exchange id: {restInstance.id}");
        var wsInstance = Exchange.DynamicallyCreateInstance("binance", null, true);
        Console.WriteLine($"Exchange id {wsInstance.id}");
    }
}