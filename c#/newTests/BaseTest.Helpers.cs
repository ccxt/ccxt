using Main;
namespace Tests;

public partial class BaseTest
{
    public Exchange exchange = new Exchange();

    public partial class baseMainTestClass
    {
        public string rootDir = "./../../";
        public object skipMethods = null;
        public object skippedMethods = null;
        public object publicTests = null;
        public object checkedPublicTests = null;
        public bool sandbox = false;
        public object envVars = null;
        public object testFiles = null;
        public bool privateOnly = Tests.privateOnly;
        public bool privateTest = Tests.privateTests;
        public bool info = Tests.info;

        public class AuthenticationError : Exchange.AuthenticationError
        {

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

        public static async Task<object> callMethod(object methodName, object exchange, params object[] args)
        {
            var method = exchange.GetType().GetMethod(methodName as string);
            var result = await (Task<object>)method.Invoke(exchange, args);
            return result;
        }

        public static void addProxy(object exchange, object proxy)
        {
            // exchange.GetType().GetProperty("proxy").SetValue(exchange, proxy);
        }

        public static void exitScript()
        {
            Environment.Exit(0);
        }

        public static object getExchangeProp(object exchange, object prop, object defaultValue = null)
        {
            var value = exchange.GetType().GetProperty(prop as string).GetValue(exchange);
            if (value == null)
            {
                return defaultValue;
            }
            return value;
        }

        public static void setExchangeProp(object exchange, object prop, object value)
        {
            exchange.GetType().GetProperty(prop as string).SetValue(exchange, value);
        }

        public void add_proxy(Exchange exchange, object http_proxy)
        {
            exchange.proxy = http_proxy as string;
        }

        public string get_test_name(object str) => str as string;

        public string exceptionMessage(object exc) => exc as string;
    }
}