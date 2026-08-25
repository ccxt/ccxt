using ccxt;
using ccxt.pro;

using Newtonsoft.Json;

using System.Globalization;
using System.Reflection;
using System.Text.RegularExpressions;
using System.Runtime.InteropServices;

namespace Tests;

using dict = Dictionary<string, object>;

public partial class testMainClass : BaseTest
{
    public static SharedMethods testSharedMethods = new SharedMethods();
    // public Exchange exchange = new Exchange();
    // public dict testFiles = new dict();
    // consts to be accessed from transpiled tests
    public static string EXT = "cs";
    public static string LANG = "C#";
    public static bool IS_SYNCHRONOUS = false;
    public static string PROXY_TEST_FILE_NAME = "proxies";
    public static string ROOT_DIR = Tests.ccxtBaseDir + "/";
    public static dict ENV_VARS = null;
    public static string NEW_LINE = "\n";
    public int LOG_CHARS_LENGTH = 10000;

    //public bool info = Tests.info;
    //public bool verbose = Tests.verbose;
    //public bool debug = Tests.debug;
    public static string httpsAgent = "";
    //public bool loadKeys = false;
    public static int TICK_SIZE = Exchange.TICK_SIZE;

    // public static object AuthenticationError = typeof(Exchange.AuthenticationError);
    public static BaseExchange initExchange(object exchangeId, object exchangeArgs = null, object isWs2 = null)
    {
        var isWs = (isWs2 == null) ? false : (bool)isWs2;
        // the --prediction flag forces the prediction-markets namespace; prediction exchanges carry
        // their watch* methods on the main prediction class (no ccxt.pro variant), so keep the bare id
        var forcePrediction = getCliArgValue("--prediction");
        if (isWs && !forcePrediction)
        {
            exchangeId = "ccxt.pro." + (string)exchangeId;
        }
        // DynamicallyCreateInstance returns BaseExchange: a regular venue is an Exchange, a prediction
        // venue a PredictionExchange. The shared static harness types the variable as BaseExchange and
        // drives the tested method via reflection, so both run through the same path.
        return Exchange.DynamicallyCreateInstance((string)exchangeId, exchangeArgs, false, forcePrediction);
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

    dict getTestFilesSync(object properties, bool ws = false)
    {
        return null; // empty in c#
    }

    async Task<dict> getTestFiles(object properties, bool ws = false)
    {
        // var hasDict = properties as dict;
        // var hasKeys = hasDict.Keys;
        var testFiles = new dict();
        var hasKeys = properties as List<object>;
        hasKeys.Add("features");
        foreach (var key2 in hasKeys)
        {
            var key = key2 as string;
            var testFilePath = "";
            if (!ws)
            {
                testFilePath = ROOT_DIR + "cs/tests/Generated/Exchange/test." + key + ".cs";
            }
            else
            {
                testFilePath = ROOT_DIR + "cs/tests/Generated/Exchange/Ws/test." + key + ".cs";
            }
            if (ioFileExists(testFilePath))
            {
                var methodName = "test" + key.Substring(0, 1).ToUpper() + key.Substring(1);
                var testMethod = this.GetType().GetMethod(methodName);
                testFiles[key] = testMethod;
            }
        }
        return testFiles;
    }

    public object jsonStringify(object a)
    {
        return JsonConvert.SerializeObject(a);
    }

    public object jsonParse(object a)
    {
        // var jsonString = a.ToString();
        // if (jsonString.StartsWith("["))
        // {
        //     return JsonConvert.DeserializeObject<List<dict>>(jsonString);
        // }
        return JsonHelper.Deserialize((string)a);
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
        ENV_VARS = parsedObject;
    }

    async static Task close(object exchange)
    {
        // stub
    }

    public static void dump(params object[] values)
    {

        var parsedValues = new List<string> { };
        foreach (var value in values)
        {
            if (value == null)
            {
                // match the JS/Python/PHP dumps, which stringify a null/undefined arg instead of
                // throwing — e.g. exchange.json(undefined) is null in C# (ws tests have no eventId)
                parsedValues.Add("null");
                continue;
            }
            if (value is IList<object> || value is IDictionary<string, object>)
            {
                parsedValues.Add(JsonConvert.SerializeObject(value));
            }
            parsedValues.Add(value.ToString());
        }
        Console.WriteLine(string.Join(" ", parsedValues));
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
        // return filesInDir.ToList<string>();
        var fileNameOnly = new List<string>();
        foreach (string fileName in filesInDir)
        {
            fileNameOnly.Add(Path.GetFileName(fileName));
        }
        return fileNameOnly;
    }

    public object callMethodSync(object testFiles2, object methodName, object exchange, params object[] args)
    {
        return null; // empty in c#
    }

    public async Task<object> callMethod(object testFiles2, object methodName, object exchange, params object[] args)
    {
        var argsWithExchange = new List<object> { exchange };
        foreach (var arg in args)
        {
            if (arg == null) continue; // skip if no arguments passed into method
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

    // The REST tests call the unified methods on a `BaseExchange`-typed variable, so they
    // cannot bind statically (the prediction tier is a sibling type) and they cannot bind
    // through `dynamic` either: the DLR picks an overload from the arguments' STATIC type,
    // which is `object` here, so a `string symbol` / `Int64? limit` core is rejected with
    // RuntimeBinderException even though the runtime value fits. Go through the same
    // reflective path the runner already uses -- ResolveMethod handles the PascalCase
    // rename, coerceArgs converts each boxed scalar to its declared parameter type.
    public static async Task<object> invokeExchangeDynamically(object exchange, string methodName, params object[] args)
    {
        return await callExchangeMethodDynamicallyImpl(exchange, methodName, new List<object>(args ?? new object[] { }));
    }

    public async Task<object> callExchangeMethodDynamically(object exchange, object methodName, params object[] args)
    {
        var realArgs = (args.Length == 0) ? new List<object> { } : args[0] as List<object>;
        return await callExchangeMethodDynamicallyImpl(exchange, (string)methodName, realArgs);
    }

    private static async Task<object> callExchangeMethodDynamicallyImpl(object exchange, string methodName, List<object> realArgs)
    {
        realArgs ??= new List<object> { };
        var method = ccxt.BaseExchange.ResolveMethod(exchange.GetType(), methodName);
        var parameters = method.GetParameters();
        var newArgs = new object[parameters.Length];
        for (int i = 0; i < parameters.Length; i++)
        {
            if (i < realArgs.Count)
            {
                newArgs[i] = realArgs[i];
            }
            else
            {
                newArgs[i] = null;
            }
        }
        var res = method.Invoke(exchange, ccxt.BaseExchange.coerceArgs(method, newArgs));
        // Implicit API methods may return Task<Dictionary<…>> / Task<List<object>>
        // and typed cores return Task<Order> / Task<Tickers> / Task<List<Trade>>;
        // Task<T> is invariant, so a hard cast to Task<object> throws for all of them.
        // Await the task as-is and read its Result reflectively, then project the value
        // for comparison here in the TEST path -- deliberately NOT through the
        // production FromTyped reverse helpers, which rebuild a dictionary from the
        // struct constructor and therefore drop every key the constructor does not map.
        var awaited = await awaitAnyTask(res);
        return detypeForComparison(resolveLiveWsStructure(exchange, awaited));
    }

    // A watch* core returns a defensive `.Copy()` of the live order book (C# callers can
    // race the ws thread; JS cannot). The `parsedResponse` ws fixtures assert the state
    // after EVERY frame was replayed, so re-resolve the live book the copy came from.
    private static object resolveLiveWsStructure(object exchange, object value)
    {
        if (!(value is ccxt.pro.IOrderBook book) || !(exchange is BaseExchange ex))
        {
            return value;
        }
        var live = ccxt.BaseExchange.GetValue(ex.orderbooks, book.symbol);
        return (live != null) ? live : value;
    }

    // Await any Task / Task<T> and re-box its result as object.
    private static async Task<object> awaitAnyTask(object res)
    {
        var task = (Task)res;
        await task.ConfigureAwait(false);
        var resultProperty = task.GetType().GetProperty("Result");
        if (resultProperty == null)
        {
            return null; // a non-generic Task carries no result
        }
        return resultProperty.GetValue(task);
    }

    private static readonly System.Collections.Concurrent.ConcurrentDictionary<Type, FieldInfo[]> typedStructFields = new System.Collections.Concurrent.ConcurrentDictionary<Type, FieldInfo[]>();

    // A few unified structs project a ROW, not an object: the OHLCV shape is
    // [timestamp, open, high, low, close, volume]. Reflecting them into a dictionary
    // would be wrong, so they are listed explicitly and emitted in field order.
    private static readonly HashSet<string> rowShapedStructs = new HashSet<string> { "OHLCV", "OHLCVC" };

    private static bool isUnifiedStruct(Type type)
    {
        // the unified types (Order, Ticker, Tickers, Balances, ...) are all structs
        // declared in the `ccxt` namespace. ccxt.pro caches are classes and keep their
        // identity, so restricting to value types leaves the ws path untouched.
        return type.IsValueType
            && !type.IsPrimitive
            && !type.IsEnum
            && type.Namespace == "ccxt"
            && !type.IsGenericType;
    }

    // Is this a generic collection whose element type is a unified struct? Only those
    // are projected. Anything else -- Dictionary<string, object>, List<object>, and in
    // particular the live ccxt.pro caches (ArrayCache*, IOrderBook) whose identity the
    // ws tests depend on -- is handed back untouched.
    private static Type unifiedElementType(Type type)
    {
        foreach (var iface in type.GetInterfaces())
        {
            if (!iface.IsGenericType)
            {
                continue;
            }
            var def = iface.GetGenericTypeDefinition();
            if (def == typeof(IEnumerable<>))
            {
                var element = iface.GetGenericArguments()[0];
                if (isUnifiedStruct(element))
                {
                    return element;
                }
            }
        }
        return null;
    }

    // Turn a boxed unified struct back into the plain dictionary the static-response
    // comparator works on. Unlike the production From* helpers this reflects over the
    // public fields, so a field the exchange never populated is emitted as an explicit
    // null instead of vanishing -- which is exactly what the stored fixture holds.
    // Strictly type-driven: a value that is not a unified struct (or a collection of
    // them) is returned as-is, so nothing outside the typed-core surface is disturbed.
    public static object detypeForComparison(object value)
    {
        if (value == null)
        {
            return null;
        }
        var type = value.GetType();
        if (isUnifiedStruct(type))
        {
            return detypeStruct(value, type);
        }
        if (unifiedElementType(type) != null && value is System.Collections.IEnumerable rawList)
        {
            var outList = new List<object>();
            foreach (var item in rawList)
            {
                outList.Add(detypeForComparison(item));
            }
            return outList;
        }
        // Balances.free / used / total are Dictionary<string, double>. The comparator's
        // isDictionary() only recognises Dictionary<string, object>, so anything else
        // falls through to the scalar branch and Convert blows up on it. Re-key the
        // narrow generic dictionaries the structs hold to the shape it understands.
        if (type.IsGenericType
            && type.GetGenericTypeDefinition() == typeof(Dictionary<,>)
            && type.GetGenericArguments()[0] == typeof(string)
            && type.GetGenericArguments()[1] != typeof(object)
            && value is System.Collections.IDictionary narrowDict)
        {
            var outDict = new dict();
            foreach (System.Collections.DictionaryEntry entry in narrowDict)
            {
                outDict[Convert.ToString(entry.Key)] = detypeForComparison(entry.Value);
            }
            return outDict;
        }
        return value;
    }

    private static object detypeStruct(object value, Type type)
    {
        var fields = typedStructFields.GetOrAdd(type, t => t.GetFields(BindingFlags.Public | BindingFlags.Instance));
        if (rowShapedStructs.Contains(type.Name))
        {
            var row = new List<object>();
            foreach (var field in fields)
            {
                row.Add(field.GetValue(value));
            }
            return row;
        }
        var result = new dict();
        foreach (var field in fields)
        {
            var fieldValue = field.GetValue(value);
            var fieldType = field.FieldType;
            // container structs (Tickers, Balances, TradingFees, OpenInterests,
            // LeverageTiers, ...) hold a Dictionary<string, T> where T is a unified
            // struct or a list of them; the unified shape is that dictionary itself,
            // keyed by symbol/currency, so splat its entries instead of nesting them.
            if (fieldType.IsGenericType
                && fieldType.GetGenericTypeDefinition() == typeof(Dictionary<,>)
                && fieldType.GetGenericArguments()[0] == typeof(string)
                && isProjectable(fieldType.GetGenericArguments()[1]))
            {
                if (fieldValue is System.Collections.IDictionary inner)
                {
                    foreach (System.Collections.DictionaryEntry entry in inner)
                    {
                        result[Convert.ToString(entry.Key)] = detypeForComparison(entry.Value);
                    }
                }
                continue;
            }
            // `info` is the raw venue payload; the constructors set it to null when the
            // source had no `info` key, and the fixture then has no `info` key either.
            if (field.Name == "info" && fieldValue == null)
            {
                continue;
            }
            if (field.Name == "info")
            {
                fieldValue = unwrapListInfo(fieldValue);
            }
            result[unifiedKeyOf(field.Name)] = detypeForComparison(fieldValue);
        }
        return result;
    }

    // Two struct fields are spelled differently from the unified key they carry, because
    // `event` and `base` are reserved words in C#. Project them back under the unified
    // name so the comparator sees the key the fixture stores.
    private static string unifiedKeyOf(string fieldName)
    {
        if (fieldName == "eventId")
        {
            return "event";
        }
        if (fieldName == "baseCurrency")
        {
            return "base";
        }
        return fieldName;
    }

    private static bool isProjectable(Type type)
    {
        return isUnifiedStruct(type) || unifiedElementType(type) != null;
    }

    // Helper.GetInfo wraps a LIST payload as { "response": [...] } because the struct field
    // is typed Dictionary<string, object> and a bare list will not fit. The fixture holds the
    // list. Undo the wrap so the comparison sees what the venue actually returned.
    private static object unwrapListInfo(object value)
    {
        var asDict = value as IDictionary<string, object>;
        if (asDict != null && asDict.Count == 1 && asDict.ContainsKey("response") && asDict["response"] is System.Collections.IList)
        {
            return asDict["response"];
        }
        return value;
    }

    public object callExchangeMethodDynamicallySync(object exchange, object methodName, params object[] args)
    {
        throw new Exception("This functions shouldn't be used in C#");
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
            var propertyInfo = exchange.GetType().GetProperty(prop as string);
            if (propertyInfo != null)
            {
                var value = propertyInfo.GetValue(exchange);
                return value != null ? value : defaultValue;
            }
            else
            {
                return defaultValue;
            }
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
        var message = e.StackTrace;
        // if (e is AggregateException) {
        //     foreach (var innerExc in e.InnerExceptions) {
        //         message += innerExc.Message + '\n';
        //     }
        // }
        // "[" + e.GetType().Name + "] " + message
        return e?.ToString().Substring(0, Math.Min(LOG_CHARS_LENGTH, e.ToString().Length)) ?? "Exception occurred, but no message available.";
    }

    public System.Exception getRootException(Exception exc)
    {
        if (exc is System.AggregateException)
        {
            var inner = exc.InnerException;
            if (inner != null)
            {
                return inner;
            }
        }
        return exc;
    }

    public BaseExchange setFetchResponse(object exchange2, object response)
    {
        var exchange = exchange2 as BaseExchange;

        exchange.fetchResponse = response;
        return exchange;

    }

    public object setupWsMockTransport(object exchange2, object url)
    {
        // put the ws client for the given url into an "already connected" state
        // with a transport stub, so watch* methods never open a real socket;
        // everything above the socket (subscriptions, futures, caches, message
        // routing) runs unmodified
        var exchange = exchange2 as BaseExchange;
        var client = exchange.client((string)url);
        client.startedConnecting = true;
        client.isConnected = true;
        client.isMock = true;
        client.connected.TrySetResult(true);
        return exchange;
    }

    public void injectWsMessage(object exchange2, object url, object message)
    {
        // feed one already-json-parsed frame into the exchange's ws message
        // handler - the same entry point the real transport invokes
        var exchange = exchange2 as BaseExchange;
        var client = exchange.client((string)url);
        client.handleMessage(client, message);
    }

    public object getWsSentMessages(object exchange2, object url)
    {
        // the frames the exchange sent over the mocked transport, already parsed
        var exchange = exchange2 as BaseExchange;
        var client = exchange.client((string)url);
        return client.mockSentMessages;
    }

    public bool wsClientHasPendingFutures(object exchange2, object url)
    {
        // whether the watch flow is currently awaiting a message - the frame
        // injector polls this instead of relying on a fixed head-start sleep
        var exchange = exchange2 as BaseExchange;
        var client = exchange.client((string)url);
        return client.futures.Count > 0;
    }

    private static readonly HashSet<object> wsCompletedClients = new HashSet<object>();

    public void markWsTestCompleted(object exchange2, object url)
    {
        // the watch side of a static ws test flags completion here so the
        // frame injector's rejection loop knows it can stop
        var exchange = exchange2 as BaseExchange;
        var client = exchange.client((string)url);
        lock (wsCompletedClients)
        {
            wsCompletedClients.Add(client);
        }
    }

    public bool isWsTestCompleted(object exchange2, object url)
    {
        var exchange = exchange2 as BaseExchange;
        var client = exchange.client((string)url);
        lock (wsCompletedClients)
        {
            return wsCompletedClients.Contains(client);
        }
    }

    public void rejectPendingWsFutures(object exchange2, object url)
    {
        // reject any futures the injected frames did not resolve, so a broken
        // fixture fails the test instead of hanging it; resolved futures are
        // already removed from the futures dict, so only pending ones remain
        var exchange = exchange2 as BaseExchange;
        var client = exchange.client((string)url);
        var messageHashes = new List<string>(client.futures.Keys);
        foreach (var messageHash in messageHashes)
        {
            client.reject(new ccxt.ExchangeError("static ws test: the injected messages did not resolve the watch future"), messageHash);
        }
    }

    public bool isNullValue(object value)
    {
        return value == null;
    }

    public bool isSync()
    {
        return false;
    }

    public string getExt()
    {
        return EXT;
    }

    public string getLang()
    {
        return LANG;
    }

    public object getEnvVars()
    {
        return ENV_VARS;
    }

    public string getRootDir()
    {
        return ROOT_DIR;
    }

    public bool isWindows()
    {
        return RuntimeInformation.IsOSPlatform(OSPlatform.Windows);
    }

    public bool isLinux()
    {
        return RuntimeInformation.IsOSPlatform(OSPlatform.Linux);
    }

    public bool isAmd64()
    {
        return RuntimeInformation.ProcessArchitecture == Architecture.X64;
    }

    public object convertAscii(object input)
    {
        // tmp fix the issue inside ascii-encoded json values
        // "[{\"symbol\":\"BTC-USDT\",\"type\":\"LIMIT\",\"side\":\"BUY\",\"quantity\":0.0002,\"price\":25000.0},{\"symbol\":\"BTC-USDT\",\"type\":\"LIMIT\",\"side\":\"BUY\",\"quantity\":0.0002,\"price\":27000.0}]"
        // "[{\"symbol\":\"BTC-USDT\",\"type\":\"LIMIT\",\"side\":\"BUY\",\"quantity\":0.0002,\"price\":25000},{\"symbol\":\"BTC-USDT\",\"type\":\"LIMIT\",\"side\":\"BUY\",\"quantity\":0.0002,\"price\":27000}]"
        // as you can see the numeric values might be 25 or 25.0
        // so we need to convert them to the same format
        // this is done when the message is a regular json-string or url-encoded string
        var decodedString = System.Web.HttpUtility.UrlDecode(input as string);
        // decodedString = decodedString.Replace(".0}", "}");
        // decodedString = decodedString.Replace(".0,", ",");
        // string pattern = @"(?<=\.\d*)0+(?!\d)|(?<=\d)\.0+$";
        // string pattern = @"(?<=\.\d*[1-9])0+|(?<=[0-9])\.0+$";
        // string pattern = @"(?<=\d)\.0+$|(\.\d*?[1-9])0+$";
        string pattern = @"(?<=\.[0-9]*[1-9])0+\b|(?<=\d)\.0+\b";


        string result1 = Regex.Replace(decodedString, pattern, "");
        return result1;

    }

    public partial class SharedMethods
    {
        // ast-transpiler uses "json()" method in transpiled C# content,
        // which should pre-exist in the language-specific helpers for project
        // string (not object) so generated `string x = json(...)` locals compile
        public string json(object a)
        {
            return Exchange.Json(a);
        }
    }
}