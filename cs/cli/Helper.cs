using Newtonsoft.Json;

namespace Example;

public class Helper
{
    public static void Green(string message)
    {
        System.Console.ForegroundColor = System.ConsoleColor.Green;
        System.Console.WriteLine(message);
        System.Console.ResetColor();
    }

    public static void Red(string message)
    {
        System.Console.ForegroundColor = System.ConsoleColor.Red;
        System.Console.WriteLine(message);
        System.Console.ResetColor();
    }

    public static void Warn(string message)
    {
        System.Console.ForegroundColor = System.ConsoleColor.Yellow;
        System.Console.WriteLine(message);
        System.Console.ResetColor();
    }

    public static void print(object message)
    {
        Console.WriteLine(JsonConvert.SerializeObject(message, Formatting.Indented));
    }
}
