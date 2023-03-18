using System;
using System.Collections.Generic;
using System.Net.NetworkInformation;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace Main
{

    internal class Program
    {
        static void Main(string[] args)
        {
            bot().Wait();
        }

        async static Task bot()
        {
            var exchange = new whitebit();
            exchange.apiKey = "379bd8d205cf01b232eb442cf1eae7c3";
            exchange.secret = "071d5958c584ee175eaa7ca0eb357156";
            await exchange.loadMarkets();
            exchange.verbose = false;
            var balance = await exchange.fetchBalance();
            Console.WriteLine("Will print the balance!!!!\n");
            Console.WriteLine(JsonConvert.SerializeObject(balance, Formatting.Indented));
        }
    }
}