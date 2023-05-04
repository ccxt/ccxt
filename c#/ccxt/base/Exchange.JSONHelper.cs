using Newtonsoft.Json.Linq;

namespace ccxt;

using dict = Dictionary<string, object>;

public partial class Exchange
{

    public string stringifyObject(object d2)
    {
        var output = "";

        if (d2 == null)
            return output;

        if (d2.GetType() == typeof(dict))
        {
            var d = (dict)d2;
            if (d == null)
                return output;

            foreach (var key in d.Keys)
            {
                output += key + ", " + d[key] + "\n";
            }
            return output;
        }
        else if (d2.GetType() == typeof(List<object>))
        {
            var d = (List<object>)d2;
            if (d == null)
                return output;

            foreach (var key in d)
            {
                output += key + "\n";
            }
            return output;
        }
        return (string)output;
    }
}

public static class JsonHelper
{
    public static object Deserialize(string json)
    {
        return ToObject(JToken.Parse(json));
    }

    public static object ToObject(JToken token)
    {
        switch (token.Type)
        {
            case JTokenType.Object:
                return token.Children<JProperty>()
                            .ToDictionary(prop => prop.Name,
                                          prop => ToObject(prop.Value));

            case JTokenType.Array:
                return token.Select(ToObject).ToList();

            default:
                return ((JValue)token).Value;
        }
    }
}