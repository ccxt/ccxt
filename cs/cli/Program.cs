namespace Example;

using ccxt;

using System;
using System.Threading.Tasks;

using dict = Dictionary<string, object>;
using list = List<object>;

using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

public static class Program
{

    public static bool verbose = false;
    public static bool noLoadMarkets = false;

    public class Options
    {
        public bool Verbose { get; set; }
        public bool Sandbox { get; set; }
        public bool NoLoadMarkets { get; set; }
        public bool Demo { get; set; }
    }
    public static string exchangesPath = System.AppDomain.CurrentDomain.BaseDirectory + "../../../../.." + "/exchanges.json"; // when using debugguer

    public static List<string> exchangesId;
    // prediction-only ids (not present in the regular namespace) carry their own watch*
    // methods, so the ccxt.pro prefix must not be applied to them
    public static List<string> predictionOnlyIds = new List<string>();
    public static List<Exchange> exchanges = new List<Exchange>();

    public static void InitOptions(BaseExchange instance, IEnumerable<string> args)
    {
        if (args.Contains("--verbose"))
        {
            // instance.verbose = true;
            verbose = true;
        }
        if (args.Contains("--sandbox") || args.Contains("--test") || args.Contains("--testnet"))
        {
            instance.setSandboxMode(true);
        }
        if (args.Contains("--no-load-markets"))
        {
            noLoadMarkets = true;
        }

        if (args.Contains("--demo"))
        {
            instance.enableDemoTrading(true);
        }
    }

    // mirrors cli.ts loadSettingsAndCreateExchange: keys.json provides the defaults,
    // keys.local.json overrides it (shallow, per top-level exchange entry), and the
    // whole entry (credentials AND options etc.) goes into the exchange constructor
    public static dict LoadSettings(string exchangeId)
    {
        var allSettings = new dict();
        var fileNames = new string[] { "keys.json", "keys.local.json" };
        foreach (var fileName in fileNames)
        {
            // repo root (cwd of `npm run cli.cs`) first, then ../../ for runs from cs/cli
            var candidatePaths = new string[] { fileName, "./../../" + fileName };
            foreach (var candidatePath in candidatePaths)
            {
                if (!File.Exists(candidatePath))
                {
                    continue;
                }
                try
                {
                    var parsed = JsonHelper.Deserialize(File.ReadAllText(candidatePath)) as dict;
                    if (parsed != null)
                    {
                        foreach (var entry in parsed)
                        {
                            allSettings[entry.Key] = entry.Value;
                        }
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine($"Error parsing {candidatePath}: {e.Message}");
                }
            }
        }
        if (allSettings.ContainsKey(exchangeId) && allSettings[exchangeId] is dict exchangeSettings)
        {
            return exchangeSettings;
        }
        return new dict();
    }

    public static void SetCredentials(BaseExchange instance)
    {
        // keys.json / keys.local.json are applied through the constructor (LoadSettings),
        // this only fills credentials still missing from environment variables
        var credentials = instance.requiredCredentials as dict;
        foreach (var credential in credentials)
        {
            var key = credential.Key;
            var value = credential.Value;
            var boolValue = (bool)value;
            if (boolValue)
            {
                var property = instance.GetType().GetProperty(key);
                if (property == null)
                {
                    continue;
                }
                var currentValue = property.GetValue(instance) as string;
                if (!string.IsNullOrEmpty(currentValue))
                {
                    continue;
                }
                var parsedKey = instance.id.ToUpper() + "_" + key.ToUpper();
                var credentialValue = Environment.GetEnvironmentVariable(parsedKey);
                if (credentialValue != null && credentialValue.StartsWith("-----BEGIN"))
                {
                    credentialValue = credentialValue.Replace("\\n", "\n");
                }
                if (credentialValue != null)
                {
                    property.SetValue(instance, credentialValue, null);
                }
            }
        }
    }


    public static void Main(string[] args)
    {
        if (File.Exists(exchangesPath))
        {
            var file = File.ReadAllText(exchangesPath);
            var converted = (dict)JsonHelper.Deserialize(file);
            var ids = (list)converted["ids"];
            List<string> strings = ids.Select(s => (string)s).ToList();
            if (converted.ContainsKey("prediction"))
            {
                var predictionIds = (list)converted["prediction"];
                var predictionStrings = predictionIds.Select(s => (string)s).ToList();
                predictionOnlyIds = predictionStrings.Where(s => !strings.Contains(s)).ToList();
                strings.AddRange(predictionStrings);
            }
            exchangesId = strings;
        }
        else
        {
            exchangesId = null;
        }

        // if (true || args.Contains("--ws"))
        // {
        //     // instance.verbose = true;
        //     // Exchange.runWs().Wait();
        //     var ws = new Exchange();
        //     ws.runWs().Wait();
        //     return;
        // }

        if (args.Length < 2)
        {
            Helper.Red("Exchange name and method required!");
            return;
        }
        // var args = new string[3];
        // args[0] = "bybit";
        // args[1] = "watchOrders";
        // args[2] = "LTC/USDT";

        var exchangeName = args[0];
        var methodName = args[1];


        if (exchangesId != null && !exchangesId.Contains(exchangeName.ToLower()))
        {
            Helper.Red($"Exchange {exchangeName} not found!");
            return;
        }

        // // options
        var flags = args
            .Where(x => x.StartsWith("-"))
            .ToList();

        var parameters = args[2..]
            .Where(x => !x.StartsWith("-"))
            .Select(x =>
            {
                if (x.StartsWith("{"))
                    return (dict)JsonHelper.Deserialize(x);
                if (x.StartsWith("["))
                    return (IList<object>)JsonHelper.Deserialize(x);
                if (x == "null")
                    return null;
                if (x == "true")
                    return true;
                if (x == "false")
                    return false;
                if (Int64.TryParse(x, out var i))
                    return i;
                return (object)x;
            })
            .ToList();

        var isWsMethod = methodName.StartsWith("watch") || methodName.StartsWith("Watch");
        var isWsCrudeMethod = methodName.EndsWith("Ws");
        // --prediction forces the prediction-markets namespace for ids present in both
        // (e.g. hyperliquid); prediction-only ids resolve there automatically. prediction
        // classes carry their own watch* methods, so the ccxt.pro prefix does not apply
        var forcePrediction = args.Contains("--prediction") || args.Contains("-p");
        // prediction-only ids (e.g. polymarket) resolve from ccxt.prediction and merge REST+WS
        // in one class — never route them through ccxt.pro even for watch* methods
        var isPredictionOnly = predictionOnlyIds.Contains(exchangeName);
        var exchangeNameAdapted = ((isWsMethod || isWsCrudeMethod) && !forcePrediction && !isPredictionOnly) ? "ccxt.pro." + exchangeName : exchangeName;
        var settings = LoadSettings(exchangeName.ToLower());
        var instance = Exchange.DynamicallyCreateInstance(exchangeNameAdapted, settings, false, forcePrediction);

        InitOptions(instance, flags);
        SetCredentials(instance);

        // tmp
        // instance.setSandboxMode(true);
        try
        {
            Console.WriteLine(JsonConvert.SerializeObject(parameters, Formatting.Indented));
            if (!noLoadMarkets)
            {
                var task = instance.loadMarkets();
                task.Wait();
            }
            if (verbose)
            {
                instance.verbose = true;
            }
            // instance.verbose = true; // hardcoded verboe log
            var method = instance.GetType().GetMethod(methodName);
            var parametersNumber = method.GetParameters().Length;
            var missing = parametersNumber - parameters.Count;
            if (missing > 0)
            {
                for (int i = 0; i < missing; i++)
                {
                    parameters.Add(null);
                }
            }
            while (true)
            {

                var result = method.Invoke(instance, parameters.ToArray());
                var resultNew = result.GetType().GetProperty("Result").GetValue(result, null);
                // var resultNew = instance.watchOrders("LTC/USDT");
                // resultNew.Wait();
                Console.WriteLine(JsonConvert.SerializeObject(resultNew, Formatting.Indented));

                if (!isWsMethod)
                {
                    break;
                }

            }
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
        }
    }
}
