namespace Example;
using Main;
using System;
using System.Threading.Tasks;
using dict = Dictionary<string, object>;
using list = List<object>;
using CommandLine;
using Newtonsoft.Json;

public static class Program
{

    public class Options
    {
        [Option('v', "verbose", Required = false, HelpText = "Set output to verbose messages.")]
        public bool Verbose { get; set; }

        [Option('s', "sandbox", Required = false, HelpText = "Set sandbox mode.")]
        public bool Sandbox { get; set; }
    }

    public static string exchangesPath = "../../exchanges.json";

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

    public static void Main(string[] args)
    {

        var file = File.ReadAllText(exchangesPath);
        var converted = (dict)Exchange.JsonHelper.Deserialize(file);
        var ids = (list)converted["ids"];
        List<string> strings = ids.Select(s => (string)s).ToList();
        exchangesId = strings;

        var exchangeName = args[0];
        var methodName = args[1];

        // var exchangeName = "binance";
        // var methodName = "fetchTicker";

        if (!exchangesId.Contains(exchangeName))
        {
            Helper.Red($"Exchange {exchangeName} not found!");
            return;
        }

        var instance = Exchange.MagicallyCreateInstance(exchangeName);

        // options
        var flags = args
            .Where(x => x.StartsWith("-"))
            .ToList();

        var parameters = args[2..]
            .Where(x => !x.StartsWith("-"))
            .ToList();

        // var parameters = new List<object> { "BTC/USDT" };

        InitOptions(instance, flags);
        SetCredentials(instance);

        foreach (var parameter in parameters)
        {
            System.Console.WriteLine(parameter);
        }
        var result = Exchange.DynamicallyCallMethod(instance, methodName, parameters.ToArray()) as Task<object>;
        result.Wait();
        var final = result.Result;
        Console.WriteLine(JsonConvert.SerializeObject(final, Formatting.Indented));

    }
}
