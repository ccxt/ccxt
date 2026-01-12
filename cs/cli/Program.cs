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

    public class Options
    {
        public bool Verbose { get; set; }
        public bool Sandbox { get; set; }
        public bool Demo { get; set; }
    }
    public static string exchangesPath = System.AppDomain.CurrentDomain.BaseDirectory + "../../../../.." + "/exchanges.json"; // when using debugguer

    public static List<string> exchangesId;
    public static List<Exchange> exchanges = new List<Exchange>();

    public static void InitOptions(Exchange instance, IEnumerable<string> args)
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
        if (args.Contains("--demo"))
        {
            instance.enableDemoTrading(true);
        }
    }

    public static void SetCredentials(Exchange instance)
    {
        JObject localKeys = null;
        try
        {
            if (File.Exists("keys.local.json"))
            {
                var jsonText = File.ReadAllText("keys.local.json");
                localKeys = JsonConvert.DeserializeObject<JObject>(jsonText);
            }
            if (File.Exists("./../../keys.local.json"))
            {
                var jsonText = File.ReadAllText("./../../keys.local.json");
                localKeys = JsonConvert.DeserializeObject<JObject>(jsonText);
            }
        }
        catch (JsonException je)
        {
            Console.WriteLine($"Error parsing keys.local.json: {je.Message}");
        }

        var credentials = instance.requiredCredentials as dict;
        foreach (var credential in credentials)
        {
            var key = credential.Key;
            var value = credential.Value;
            var boolValue = (bool)value;
            if (boolValue)
            {
                string credentialValue = null;

                // The instance ID in lowercase is used as the key in the JSON file
                var instanceIdKey = instance.id.ToLower();
                if (localKeys != null && localKeys.ContainsKey(instanceIdKey))
                {
                    var instanceCredentials = localKeys[instanceIdKey] as JObject;
                    // The specific credential key is sought within the instance's credentials
                    if (instanceCredentials.ContainsKey(key))
                    {
                        credentialValue = instanceCredentials[key].ToString();
                    }
                }

                // If the credential is not found in the JSON file, fall back to environment variables
                if (credentialValue == null)
                {
                    var parsedKey = instance.id.ToUpper() + "_" + key.ToUpper();
                    credentialValue = Environment.GetEnvironmentVariable(parsedKey);
                    if (credentialValue != null && credentialValue.StartsWith("-----BEGIN"))
                    {
                        credentialValue = credentialValue.Replace("\\n", "\n");
                    }
                }

                // If a value was found, set the property on the instance
                if (credentialValue != null)
                {
                    instance.GetType().GetProperty(key).SetValue(instance, credentialValue, null);
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
        var exchangeNameAdapted = (isWsMethod || isWsCrudeMethod) ? "ccxt.pro." + exchangeName : exchangeName;
        var instance = Exchange.DynamicallyCreateInstance(exchangeNameAdapted);

        InitOptions(instance, flags);
        SetCredentials(instance);

        // tmp
        // instance.setSandboxMode(true);
        try
        {
            Console.WriteLine(JsonConvert.SerializeObject(parameters, Formatting.Indented));
            var task = instance.loadMarkets();
            task.Wait();
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
