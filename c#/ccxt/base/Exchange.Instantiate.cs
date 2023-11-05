using System.Reflection;

namespace ccxt;

public partial class Exchange
{
    public static Exchange MagicallyCreateInstance(string className, Dictionary<string, object> args = null)
    {
        var assembly = Assembly.GetExecutingAssembly();

        var type = assembly.GetTypes()
            .First(t => t.Name == className);

        object[] constructorArgs = new object[] { args };
        return Activator.CreateInstance(type, constructorArgs) as Exchange;
    }

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
