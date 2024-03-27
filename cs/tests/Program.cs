using System;
using System.Reflection;

using ccxt;
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
    public static string methodName = null;
    public static bool verbose = false;
    public static bool sandbox = false;
    public static bool privateTests = false;
    public static bool privateOnly = false;
    public static bool baseTests = false;
    public static bool cacheTests = false;
    public static bool orderBookTests = false;
    public static bool info = false;
    public static bool debug = false;
    public static bool raceCondition = false;

    public static string[] args;

    public static BaseTest tests = new BaseTest();

    static void InitOptions(string[] args)
    {
        var isBase = args.Contains("--base");
        baseTests = isBase;
        cacheTests = args.Contains("--cache");
        orderBookTests = args.Contains("--orderbook");
        raceCondition = args.Contains("--race");
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
            string value = argsWithoutOptions[1];
            // similar to PYTHON version arguments, we check method & symbol though same argument
            if (value.Contains("/")) {
                symbol = value;
            } else {
                methodName = value;
            }
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

    static void Main(string[] args)
    {

        Console.WriteLine("C# version: " + Environment.Version.ToString());
        Tests.args = args;
        ReadConfig();
        InitOptions(args);

        if (baseTests)
        {
            RunBaseTests();
            return;
        }


        if (cacheTests)
        {
            RunCacheTests();
            return;
        }

        if (orderBookTests)
        {
            OrderBookTests();
            return;
        }

        if (raceCondition)
        {
            RaceConditionTests();
            return;
        }

        var testClass = new testMainClass();
        testClass.init(exchangeId, symbol, methodName).Wait();
    }

    static void RunBaseTests()
    {
        tests.PrecisionTests();
        Helper.Green(" [C#] Precision tests passed");
        tests.DateTimeTests();
        Helper.Green(" [C#] Precision tests passed");
        tests.CryptoTests();
        Helper.Green(" [C#] Crypto tests passed");
    }

    static void RunCacheTests()
    {
        tests.CacheTests();
        Helper.Green(" [C#] ArrayCache tests passed");
    }

    static void OrderBookTests()
    {
        tests.OrderBookTests();
        Helper.Green(" [C#] OrderBook tests passed");
    }

    static void RaceConditionTests()
    {
        var res = tests.RaceTest();
        res.Wait();
        Helper.Green(" [C#] RaceCondition tests passed");
    }
}