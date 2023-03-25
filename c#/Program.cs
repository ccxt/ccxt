using System;
using System.Collections.Generic;
using System.Net.NetworkInformation;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace Main
{
    using dict = Dictionary<string, object>;
    using list = List<object>;
    internal class Program
    {
        static void Main(string[] args)
        {
            bot().Wait();
        }

        private static Exchange MagicallyCreateInstance(string className)
        {
            var assembly = Assembly.GetExecutingAssembly();

            var type = assembly.GetTypes()
                .First(t => t.Name == className);

            return Activator.CreateInstance(type) as Exchange;
        }

        async static Task bot()
        {
            // var exchanges = new List<string> { "huobi", "gate", "binance", "bybit", "okx", "whitebit", "kucoin", "cryptocom", "bitstamp", "mexc3", "mexc" };
            var exchanges = new List<string> { "binance" };
            var promises = new List<Task<object>>();
            foreach (string exchange in exchanges)
            {
                var instance = MagicallyCreateInstance(exchange);
                // instance.verbose = true;
                promises.Add(instance.fetchOHLCV("BTC/USDT"));

            }
            var resolved = await Task.WhenAll(promises);
            for (int i = 0; i < resolved.Length; i++)
            {
                var ticker = resolved[i];
                var ticker2 = (list)ticker;
                Console.WriteLine(JsonConvert.SerializeObject(ticker2, Formatting.Indented));
                // Console.WriteLine($"{exchanges[i]} :: Ticker :: {ticker2["symbol"]}, {ticker2["timestamp"]},  {ticker2["datetime"]}, {ticker2["high"]}, {ticker2["change"]}, {ticker2["baseVolume"]}");
            }
        }
    }
}

// var = new binance();
// exchange.apiKey = "379bd8d205cf01b232eb442cf1eae7c3";
// exchange.secret = "071d5958c584ee175eaa7ca0eb357156";
// var markets = await exchange.loadMarkets();
// exchange.verbose = false;
// var balance = await exchange.fetchBalance();
// Console.WriteLine("Will print the balance!!!!\n");
// Console.WriteLine(JsonConvert.SerializeObject(balance, Formatting.Indented));