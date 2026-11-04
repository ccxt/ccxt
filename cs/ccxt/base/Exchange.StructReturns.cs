namespace ccxt;

// Support for the struct-returning row builders (build/csharp-struct-returns.js).
public partial class BaseExchange
{
    // field writes on a struct local: the same conversion the struct constructor applies to the key
    public static string? StructString(string? value) => value;
    public static string? StructString(object value) => (value == null) ? null : SafeString(new Dictionary<string, object> { { "v", value } }, "v");
    public static Int64? StructInt64(Int64? value) => value;
    public static Int64? StructInt64(object value) => (value == null) ? null : SafeInteger(new Dictionary<string, object> { { "v", value } }, "v");
    public static double? StructDouble(double? value) => value;
    public static double? StructDouble(object value) => (value == null) ? null : SafeFloat(new Dictionary<string, object> { { "v", value } }, "v");
    public static bool? StructBool(bool? value) => value;
    public static bool? StructBool(object value) => value as bool?;

    // symbol -> Ticker rows (parseTickers) at the untyped and Tickers boundaries
    public static Tickers ToTickers(Dictionary<string, Ticker> value)
    {
        var result = new Tickers();
        result.tickers = (value == null) ? new Dictionary<string, Ticker>() : new Dictionary<string, Ticker>(value);
        return result;
    }

    public static Dictionary<string, object> FromTickerMap(Dictionary<string, Ticker> value)
    {
        if (value == null)
        {
            return null;
        }
        var result = new Dictionary<string, object>();
        foreach (var pair in value)
        {
            result[pair.Key] = FromTicker(pair.Value);
        }
        return result;
    }
}
