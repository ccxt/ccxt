using Newtonsoft.Json;

using System.Text.RegularExpressions;
using ccxt.pro;

namespace ccxt;

using dict = Dictionary<string, object>;

public partial class Exchange
{

    public ccxt.pro.Stream stream = new ccxt.pro.Stream();

    public ConsumerFunction streamToSymbol(string topic)
    {
        return (Message message) =>
        {
            var payload = message.payload as dict;
            if (payload.TryGetValue("symbol", out object symbolObj))
            {
                var symbol = symbolObj as string;
                if (!string.IsNullOrEmpty(symbol))
                {
                    var newTopic = $"{topic}::{symbol}";
                    this.streamProduce(newTopic, payload);
                }
            }
            return Task.CompletedTask;
        };
    }
}
