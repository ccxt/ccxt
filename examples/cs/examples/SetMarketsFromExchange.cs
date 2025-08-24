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
        
        var binance = new Binance();
        Console.WriteLine($"Memory usage after creating binance: {GetMemoryUsage():F2} MB");
        
        await binance.LoadMarkets();
        Console.WriteLine($"Memory usage after loading markets: {GetMemoryUsage():F2} MB");
        
        var binance2 = new Binance();
        Console.WriteLine($"Memory usage after creating binance2: {GetMemoryUsage():F2} MB");
        
        binance2.SetMarketsFromExchange(binance);
        Console.WriteLine($"Memory usage after setting markets from exchange: {GetMemoryUsage():F2} MB");
        Console.WriteLine($"binance2.symbols loaded: {binance2.Symbols?.Count ?? 0}");
        
        await binance.Close();
        await binance2.Close();
        Console.WriteLine($"Final memory usage after closing: {GetMemoryUsage():F2} MB");
    }
}
