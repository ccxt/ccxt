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
    public static bool isWs = false;
    public static bool isBaseTests = false;
    public static bool isExchangeTests = false;
    public static bool isReqResTests = false;
    public static bool isAllTest = false;
    public static bool info = false;
    public static bool debug = false;
    public static bool raceCondition = false;

    public static string[] args;

    public static BaseTest tests = new BaseTest();

    static void InitOptions(string[] args)
    {
        isWs = args.Contains("--ws");
        isBaseTests = args.Contains("--baseTests");
        isExchangeTests = args.Contains("--exchangeTests");
        isReqResTests = args.Contains("--requestTests") || args.Contains("--request") || args.Contains("--responseTests") || args.Contains("--response");
        isAllTest = !isReqResTests && !isBaseTests && !isExchangeTests; // if neither was chosen

        raceCondition = args.Contains("--race");
        var argsWithoutOptions = args.Where(arg => !arg.StartsWith("--")).ToList();
        if (argsWithoutOptions.Count > 0)
        {
            exchangeId = argsWithoutOptions[0];
        }
        else if (false && !isBaseTests)
        {
            throw new Exception("Exchange name is required");
        }
        if (argsWithoutOptions.Count > 1)
        {
            string value = argsWithoutOptions[1];
            // similar to PYTHON version arguments, we check method & symbol though same argument
            if (value.Contains("/"))
            {
                symbol = value;
            }
            else
            {
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

        if (isBaseTests)
        {
            if (isWs)
            {
                WsCacheTests();
                WsOrderBookTests();
                Helper.Green("[C#] base WS tests passed");
            }
            else 
            {
                RestBaseTests();
                Helper.Green("[C#] base REST tests passed");
            }
        }

        if (raceCondition)
        {
            RaceConditionTests();
            return;
        }

        if (isExchangeTests || isReqResTests || isAllTest) {
            var testClass = new testMainClass();
            testClass.init(exchangeId, symbol, methodName).Wait();
        }
    }

    static void RestBaseTests()
    {
        tests.testCryptography();
        Helper.Green(" [C#] Crypto tests passed");
        // run auto-transpiled tests (all of them start by 'testFunction')
        RunAutoTranspiledBaseTests (tests);
    }

    static void RunAutoTranspiledBaseTests(object testsInstance) {
        MethodInfo[] methods = testsInstance.GetType()
                        .GetMethods(BindingFlags.Instance | BindingFlags.Public)
                        .Where(m => m.Name.StartsWith("test") && m.ReturnType == typeof(void))
                        .ToArray();
        // 2. Invoke Each Method
        foreach (MethodInfo method in methods)
        {
            method.Invoke(testsInstance, null); 
            Helper.Green(" [C#] " + method.ToString() + " tests passed");
        }
    }

    static void WsCacheTests()
    {
        tests.testWsCache();
        Helper.Green(" [C#] ArrayCache tests passed");
    }

    static void WsOrderBookTests()
    {
        tests.testWsOrderBook();
        Helper.Green(" [C#] OrderBook tests passed");
    }

    static void RaceConditionTests()
    {
        var res = tests.RaceTest();
        res.Wait();
        Helper.Green(" [C#] RaceCondition tests passed");
    }
}
