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
            if (message != null && message.payload != null)
            {
                var payload = message.payload as dict;
                if (payload != null && payload.TryGetValue("symbol", out object symbolObj))
                {
                    var symbol = symbolObj as string;
                    if (!string.IsNullOrEmpty(symbol))
                    {
                        var newTopic = $"{topic}::{symbol}";
                        this.streamProduce(newTopic, payload);
                    }
                }
            }
            return Task.CompletedTask;
        };
    }
    public ConsumerFunction streamReconnectOnError()
    {
        return async (Message message) =>
        {
            var error = message.payload;
            if (error != null && !(message.error is ExchangeClosedByUser) && !(message.error is ConsumerFunctionError))
            {
                try
                {
                    await this.streamReconnect();
                }
                catch (Exception e)
                {
                    this.log(add("Failed to reconnect to stream: ", ((object)e).ToString()));
                }
            }
        };
    }
    public ConsumerFunction streamOHLCVS()
    {
        return async (Message message) =>
        {
            var payload = message.payload;
            var err = message.error;
            var symbol = this.safeString (payload, "symbol");
            var ohlcv = this.safeList (payload, "ohlcv");
            if (symbol != null) {
                this.streamProduce ("ohlcvs::" + symbol, ohlcv, err);
                var timeframe = this.safeString (payload, "timeframe");
                if (timeframe != null) {
                    this.streamProduce ("ohlcvs::" + symbol + "::" + timeframe, ohlcv, err);
                }
            }
        };
    }
}
