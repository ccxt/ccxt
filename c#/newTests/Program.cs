using System;
using System.Reflection;
using Main;
namespace Tests; // Note: actual namespace depends on the project name.

using dict = Dictionary<string, object>;
using nestedDict = Dictionary<string, Dictionary<string, object>>;
using list = List<object>;

public class Tests
{
    public static string ccxtBaseDir = System.AppDomain.CurrentDomain.BaseDirectory + "../../../../..";

    public static List<string> exchangesId;

    public static string exchangesPath = ccxtBaseDir + "/exchanges.json";

    public static string skipTestsPath = ccxtBaseDir + "/skip-tests.json";

    public static string keysPath = ccxtBaseDir + "/keys.json";

    public static nestedDict exchanges = new nestedDict();

    public static Exchange exchange = null;

    public static string exchangeId = null;
    public static string symbol = null;
    public static bool verbose = false;
    public static bool sandbox = false;
    public static bool privateTests = false;
    public static bool privateOnly = false;
    public static bool baseTests = false;
    public static bool info = false;

    public static BaseTest tests = new BaseTest();

    static void InitOptions(string[] args)
    {
        if (args.Contains("--verbose"))
            verbose = true;
        if (args.Contains("--sandbox"))
            sandbox = true;
        if (args.Contains("--private"))
            privateTests = true;
        if (args.Contains("--private-only"))
            privateOnly = true;
        if (args.Contains("--base"))
            baseTests = true;
        if (args.Contains("--info"))
            info = true;

        var argsWithoutOptions = args.Where(arg => !arg.StartsWith("--")).ToList();
        if (argsWithoutOptions.Count > 0)
        {
            exchangeId = argsWithoutOptions[0];
        }
        else if (false && !baseTests)
        {
            throw new Exception("Exchange name is required");
        }
        if (argsWithoutOptions.Count > 1)
        {
            symbol = argsWithoutOptions[1];
        }
    }

    static void ReadConfig()
    {
        var file = File.ReadAllText(exchangesPath);
        var converted = (dict)JsonHelper.Deserialize(file);
        var ids = (list)converted["ids"];
        List<string> strings = ids.Select(s => (string)s).ToList();
        exchangesId = strings;

        var keysFile = File.ReadAllText(keysPath);
        dict keys = JsonHelper.Deserialize(keysFile) as dict;
        nestedDict parsedKey = new nestedDict();
        foreach (var key in keys)
        {
            var exchangeId = key.Key;
            var exchangeKeys = (dict)key.Value;
            parsedKey[exchangeId] = exchangeKeys;
        }
        exchanges = parsedKey;
    }

    static void CheckIfShouldSkip(Exchange exchange)
    {
        var exchangeSettings = exchanges[exchange.id] as dict;
        var skip = exchangeSettings["skip"] as bool?;
        Console.WriteLine("skip: " + skip);
        if (skip == true)
            Environment.Exit(0);
    }

    static void Main(string[] args)
    {

        ReadConfig();
        InitOptions(args);

        if (baseTests)
            RunBaseTests();
        // else
        //     // CheckIfShouldSkip(exchange);
        var baseInstance = new BaseTest();
        var instance = Exchange.MagicallyCreateInstance(exchangeId);
        var testClass = new testMainClass();
        // instance.verbose = true;
        testClass.init(instance, symbol).Wait();
    }

    static void RunBaseTests()
    {
        tests.PrecisionTests();
        Helper.Green(" [C#] Precision tests passed");
        tests.DateTimeTests();
        Helper.Green(" [C#] Precision tests passed");
        // tests.CryptoTests();
        // Helper.Green(" [C#] Crypto tests passed");
    }
}