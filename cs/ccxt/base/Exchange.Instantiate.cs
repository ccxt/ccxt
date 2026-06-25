using System.Reflection;

namespace ccxt;

public partial class Exchange
{
    public static Exchange DynamicallyCreateInstance(string className, object args = null, bool isWs = false, bool forcePrediction = false)
    {
        var assembly = Assembly.GetExecutingAssembly();

        if (isWs)
        {
            className = "ccxt.pro." + className;
        }

        // prefer the regular ccxt namespace, then the prediction-markets namespace
        // (regular ccxt ids always win for ids present in both, e.g. hyperliquid) — unless
        // forcePrediction (the --prediction test flag) flips the preference to prediction first
        var types = assembly.GetTypes();
        Type type = null;
        if (forcePrediction)
        {
            type = types.FirstOrDefault(t => t.FullName == "ccxt.prediction." + className);
        }
        type ??= types.FirstOrDefault(t => t.FullName == "ccxt." + className)
            ?? types.FirstOrDefault(t => t.FullName == "ccxt.prediction." + className)
            ?? types.First(t => t.Name == className || t.FullName == className);


        // tmp check this, can't find constructor
        // if (args != null)
        // {
        args ??= new Dictionary<string, object>();
        // Type type2 = Type.GetType(className);
        ConstructorInfo constructor = type.GetConstructor(new Type[] { typeof(object) });
        object classInstance = constructor.Invoke(new object[] { args });
        return classInstance as Exchange;
        // }
        // return Activator.CreateInstance(type) as Exchange;
    }
    //     return Activator.CreateInstance(type) as Exchange;
    // }

    public static object DynamicallyCallMethod(Exchange instance, string methodName, object[] parameters)
    {
        var method = instance.GetType().GetMethod(methodName);
        var paramsLength = method.GetParameters().Count();
        if (parameters.Count() < paramsLength)
        {
            var appendedMissingArgs = new object[paramsLength];
            for (int i = 0; i < paramsLength; i++)
            {
                if (i < parameters.Count())
                {
                    appendedMissingArgs[i] = parameters[i];
                }
                else
                {
                    appendedMissingArgs[i] = null;
                }
            }
            return method.Invoke(instance, appendedMissingArgs);

        }
        return method.Invoke(instance, parameters);
    }
}
