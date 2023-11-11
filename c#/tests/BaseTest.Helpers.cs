using ccxt;

using Newtonsoft.Json;

using System.Globalization;
using System.Reflection;
namespace Tests;
using dict = Dictionary<string, object>;

public partial class testMainClass : BaseTest
{
    public static SharedMethods testSharedMethods = new SharedMethods();
    public Exchange exchange = new Exchange();
    public string rootDir = Tests.ccxtBaseDir + "/";
    public string rootDirForSkips = Tests.ccxtBaseDir + "/";
    public object skipMethods = null;
    public object skippedMethods = null;
    public object publicTests = null;
    public object checkedPublicTests = null;
    public bool sandbox = false;
    public object envVars = null;
    public dict testFiles = new dict();
    public bool privateTestOnly = Tests.privateOnly;
    public bool privateTest = Tests.privateTests;
    public bool info = Tests.info;
    public bool verbose = Tests.verbose;
    public bool debug = Tests.debug;
    public static string httpsAgent = "";
    public static string ext = ".cs";
    public bool loadKeys = false;

    public bool staticTestsFailed = false;
    public bool staticTests = false;
    public bool idTests = false;

    public string lang = "C#";

    public static int TICK_SIZE = Exchange.TICK_SIZE;

    // public static object AuthenticationError = typeof(Exchange.AuthenticationError);
    public static Exchange initExchange(object exchangeId, object exchangeArgs = null)
    {
        var exchange = Exchange.MagicallyCreateInstance((string)exchangeId, exchangeArgs);
        return exchange;
    }

    public static bool getCliArgValue(string option)
    {
        if (Tests.args.Contains(option))
            return true;
        return false;
    }


    public testMainClass()
    {
        initEnv();

    }

    async Task setTestFiles(object exchange, object properties)
    {
        // var hasDict = properties as dict;
        // var hasKeys = hasDict.Keys;
        var hasKeys = properties as List<object>;
        foreach (var key2 in hasKeys)
        {
            var key = key2 as string;
            var testFilePath = rootDir + "c#/tests/Generated/Exchange/test." + key + ".cs";
            if (ioFileExists(testFilePath))
            {
                var methodName = "test" + key.Substring(0, 1).ToUpper() + key.Substring(1);
                var testMethod = this.GetType().GetMethod(methodName);
                testFiles[methodName] = testMethod;
            }
        }
    }

    public object jsonStringify(object a)
    {
        return JsonConvert.SerializeObject(a);
    }

    public object jsonParse(object a)
    {
        return JsonConvert.DeserializeObject<dict>((string)a);
    }

    void initEnv()
    {
        var vars = Environment.GetEnvironmentVariables();
        var parsedObject = new Dictionary<string, object>();
        for (var i = 0; i < vars.Count; i++)
        {
            var key = vars.Keys.Cast<string>().ElementAt(i);
            var value = vars[key];
            parsedObject[key] = value;
        }
        envVars = parsedObject;
    }

    async static Task close(object exchange)
    {
        // stub
    }

    public static void dump(params object[] values)
    {
        Console.WriteLine(string.Join(" ", values));
    }

    public static bool ioFileExists(object path2)
    {
        var path = path2 as string;
        var exists = System.IO.File.Exists(path);
        return exists;
    }

    public static object ioFileRead(object path2)
    {
        var path = path2 as string;
        var text = System.IO.File.ReadAllText(path);
        return JsonHelper.Deserialize(text);
    }

    public static object ioDirRead(object path2)
    {
        var path = path2 as string;
        var filesInDir = System.IO.Directory.GetFiles(path);
        return filesInDir;
    }

    public async Task<object> callMethod(object testFiles2, object methodName, object exchange, params object[] args)
    {
        var argsWithExchange = new List<object> { exchange };
        foreach (var arg in args)
        {
            // emulate ... spread operator in c#
            if (arg.GetType() == typeof(List<object>))
            {
                argsWithExchange.AddRange(arg as List<object>);
                continue;
            }
            argsWithExchange.Add(arg);
        }
        var testFiles = testFiles2 as dict;
        var method = testFiles[methodName as string] as MethodInfo;
        var res = method.Invoke(exchange, argsWithExchange.ToArray());
        await ((Task)res);
        return null;
    }

    public async Task<object> callExchangeMethodDynamically(object exchange, object methodName, params object[] args)
    {
        var res = exchange.GetType().GetMethod((string)methodName, BindingFlags.Static | BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic).Invoke(exchange, args);
        return await ((Task<object>)res);
    }

    public static void addProxy(object exchange, object proxy)
    {
        exchange.GetType().GetProperty("httpProxy").SetValue(exchange, proxy);
    }

    public static void exitScript(int exit = 0)
    {
        Environment.Exit(exit);
    }

    public static object getExchangeProp(object exchange, object prop, object defaultValue = null)
    {
        try
        {
            var value = exchange.GetType().GetProperty(prop as string).GetValue(exchange);
            if (value == null)
            {
                return defaultValue;
            }
            return value;
        }
        catch (Exception)
        {
            return defaultValue;
        }

    }

    public static void setExchangeProp(object exchange, object prop, object value)
    {
        try
        {
            exchange.GetType().GetProperty(prop as string).SetValue(exchange, value);
        }
        catch (Exception)
        {
            // do nothing
        }
    }

    public void add_proxy(Exchange exchange, object http_proxy)
    {
        exchange.proxy = http_proxy as string;
    }

    public string getTestName(object str2)
    {
        var str = (string)str2;
        return "test" + char.ToUpper(str[0]) + str.Substring(1);
    }

    public string exceptionMessage(object exc)
    {
        var e = exc as Exception;
        return e.Message;
    }

    public partial class SharedMethods
    {
        // stub, the actual content is generated inside Generated/Exchange
    }
}