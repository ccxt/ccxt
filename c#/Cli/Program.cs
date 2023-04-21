namespace Example;
using ccxt;
using System;
using System.Threading.Tasks;
using dict = Dictionary<string, object>;
using list = List<object>;
using Newtonsoft.Json;

public static class Program
{

    public class Options
    {
        public bool Verbose { get; set; }
        public bool Sandbox { get; set; }
    }
    public static string exchangesPath = "../../exchanges.json"; // when using debugguer

    public static List<string> exchangesId;
    public static List<Exchange> exchanges = new List<Exchange>();

    public static void InitOptions(Exchange instance, IEnumerable<string> args)
    {
        if (args.Contains("--verbose"))
        {
            instance.verbose = true;
        }
        if (args.Contains("--sandbox"))
        {
            instance.setSandboxMode(true);
        }
    }

    public static void SetCredentials(Exchange instance)
    {
        var credentials = instance.requiredCredentials as dict;
        foreach (var credential in credentials)
        {
            var key = credential.Key;
            var value = credential.Value;
            var boolValue = (bool)value;
            if (boolValue)
            {
                var parsedKey = instance.id.ToUpper() + "_" + key.ToUpper();
                var env = Environment.GetEnvironmentVariable(parsedKey);
                if (env != null)
                {
                    instance.GetType().GetProperty(key).SetValue(instance, env, null);
                }
            }
        }
    }

    public async static Task<int> Test()
    {
        return 1;
    }

    public static void Main(string[] args)
    {

        var file = File.ReadAllText(exchangesPath);
        var converted = (dict)JsonHelper.Deserialize(file);
        var ids = (list)converted["ids"];
        List<string> strings = ids.Select(s => (string)s).ToList();
        exchangesId = strings;

        // var exchangeName = args[0];
        // var methodName = args[1];
        // var teste = (Task)tmpClass.GetType().GetMethod("Test").Invoke(null, new object[] { });
        // teste.Wait();
        var exchangeName = "huobi";
        var methodName = "fetchBalance";

        if (!exchangesId.Contains(exchangeName))
        {
            Helper.Red($"Exchange {exchangeName} not found!");
            return;
        }

        // options
        var flags = args
            .Where(x => x.StartsWith("-"))
            .ToList();

        // var parameters = args[2..]
        //     .Where(x => !x.StartsWith("-"))
        //     .ToList();

        var parameters = new List<object> { };

        var instance = Exchange.MagicallyCreateInstance(exchangeName);
        // var instance = new bybit();

        InitOptions(instance, flags);
        SetCredentials(instance);
        // instance.apiKey = "ptaewRhqoVgNqOKwxV";
        // instance.secret = "LqS5HBIeH2IWRPnEQzuMca5rEBrWqSzB2dHc";
        // instance.setSandboxMode(true);
        // instance.loadMarkets().Wait();
        // instance.verbose = true;
        // var result = instance.FetchMarkets();
        // result.Wait();
        // instance.loadTimeDifference().Wait();
        // instance.isUnifiedEnabled().Wait();
        // var balance = instance.CreateOrder("LTC/USDT", "limit", "buy", 1, 30);
        // balance.Wait();
        // var result = balance.Result;
        // Console.WriteLine(result);

        foreach (var parameter in parameters)
        {
            System.Console.WriteLine(parameter);
        }
        try
        {

            var res = instance.FetchTrades("BTC/USDT");
            res.Wait();
            Console.WriteLine(res.Result);
            // // var result = Exchange.DynamicallyCallMethod(instance, methodName, parameters.ToArray()) as Task<object>;
            // // result.Wait();
            // var Exchange = new Bybit();
            // Exchange.setSandboxMode(true);
            // Exchange.apiKey = "TB81qD33qY0fmy49qW";
            // Exchange.secret = "mLPouiMi1ewh3NTeFOi1Ss7me151i9v7caTt";
            // var markets = Exchange.FetchBalance();
            // markets.Wait();
            // // var first = markets.Result[0];
            // var resultNew = markets.Result;
            // // Console.WriteLine("{first.Id} {first.Base} {first.Quote}");
            // var precise = new Precise("1.0003");
            // precise.decimals = 9;
            // // var div = Exchange.Precise.stringDiv("163407908.476457644", "6053.28807166");
            // // System.Console.WriteLine(div);
            // instance.loadMarkets().Wait();
            // var before = instance.milliseconds();
            // Helper.Green($"Calling {methodName}...");
            // var result = instance.fetchTrades("BTC/USDT");
            // result.Wait();
            // var middle = instance.milliseconds();
            // var result2 = instance.fetchTrades("BTC/USDT");
            // result2.Wait();
            // var after = instance.milliseconds();
            // Console.WriteLine($"First call: {middle - before}ms");
            // Console.WriteLine($"Second call: {after - middle}ms");
            // var result = instance.fetchBalance();
            // result.Wait();
            // var final = result.Result;
            // Console.WriteLine(JsonConvert.SerializeObject(final, Formatting.Indented));
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
        }


    }
}
