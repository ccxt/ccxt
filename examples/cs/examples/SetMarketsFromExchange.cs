using ccxt;
using System.Diagnostics;

namespace examples;

partial class Examples
{
    public static double GetMemoryUsage()
    {
        // Get current memory usage in MB
        var process = Process.GetCurrentProcess();
        var memoryInfo = process.WorkingSet64;
        return memoryInfo / 1024.0 / 1024.0; // Convert to MB
    }

    public static async Task SetMarketsFromExchange()
    {
        Console.WriteLine($"Initial memory usage: {GetMemoryUsage():F2} MB");
        
        // Create the first Binance exchange and load markets
        var binance1 = new Binance();
        Console.WriteLine($"Memory usage after creating binance1: {GetMemoryUsage():F2} MB");
        
        await binance1.LoadMarkets();
        Console.WriteLine($"Memory usage after loading markets in binance1: {GetMemoryUsage():F2} MB");
        Console.WriteLine($"binance1.symbols loaded: {binance1.symbols?.Count ?? 0}");
        
        // Create 9 more Binance exchanges
        var exchanges = new List<Binance>();
        for (int i = 2; i <= 10; i++)
        {
            var exchange = new Binance();
            exchanges.Add(exchange);
            Console.WriteLine($"Memory usage after creating binance{i}: {GetMemoryUsage():F2} MB");
        }
        
        // Use the first exchange to set markets for all others
        foreach (var exchange in exchanges)
        {
            exchange.setMarketsFromExchange(binance1);
            Console.WriteLine($"Memory usage after setting markets from exchange: {GetMemoryUsage():F2} MB");
        }
        
        // Verify that all exchanges now have markets
        for (int i = 0; i < exchanges.Count; i++)
        {
            var exchange = exchanges[i];
            Console.WriteLine($"binance{i + 2}.symbols loaded: {exchange.symbols?.Count ?? 0}");
        }
        
        // Close all exchanges
        await binance1.Close();
        foreach (var exchange in exchanges)
        {
            await exchange.Close();
        }
        Console.WriteLine($"Final memory usage after closing all exchanges: {GetMemoryUsage():F2} MB");
    }
}
