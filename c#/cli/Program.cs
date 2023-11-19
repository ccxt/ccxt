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
    public static string exchangesPath = System.AppDomain.CurrentDomain.BaseDirectory + "../../../../.." + "/exchanges.json"; // when using debugguer

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

        if (args.Contains("--ws"))
        {
            // instance.verbose = true;
            // Exchange.runWs().Wait();
            var ws = new Exchange();
            ws.runWs().Wait();
            return;
        }

        if (args.Length < 2)
        {
            Helper.Red("Exchange name and method required!");
            return;
        }


        var exchangeName = args[0];
        var methodName = args[1];

        if (!exchangesId.Contains(exchangeName.ToLower()))
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

        var instance = Exchange.MagicallyCreateInstance(exchangeName);

        InitOptions(instance, flags);
        SetCredentials(instance);

        try
        {
            Console.WriteLine(JsonConvert.SerializeObject(parameters, Formatting.Indented));
            var task = instance.loadMarkets();
            task.Wait();
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

            var result = method.Invoke(instance, parameters.ToArray());
            var resultNew = result.GetType().GetProperty("Result").GetValue(result, null);
            Console.WriteLine(JsonConvert.SerializeObject(resultNew, Formatting.Indented));
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
        }
    }
}
