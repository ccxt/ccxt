using System.Reflection;

namespace ccxt;

public partial class Exchange
{
    public static Exchange DynamicallyCreateInstance(string className, object args = null, bool isWs = false)
    {
        var assembly = Assembly.GetExecutingAssembly();

        if (isWs)
        {
            className = "ccxt.pro." + className;
        }

        var type = assembly.GetTypes()
            .First(t => t.Name == className || t.FullName == className);


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
