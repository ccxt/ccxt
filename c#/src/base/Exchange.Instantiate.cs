using System.Reflection;

namespace Main;

public partial class Exchange
{
    public static Exchange MagicallyCreateInstance(string className)
    {
        var assembly = Assembly.GetExecutingAssembly();

        var type = assembly.GetTypes()
            .First(t => t.Name == className);

        return Activator.CreateInstance(type) as Exchange;
    }
}
