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
            var error = message.error as dict;
            if (error != null) {
                await this.streamReconnect();
            }
        };
    }
    public ConsumerFunction streamOHLCVS()
    {
        return async (Message message) =>
        {
            var payload = message.payload;
            var err = message.error;
            var symbol = this.safeString (payload, 'symbol');
            var ohlcv = this.safeList (payload, 'ohlcv');
            if (symbol !== undefined) {
                this.streamProduce ('ohlcvs::' + symbol, ohlcv, err);
                const timeframe = this.safeString (payload, 'timeframe');
                if (timeframe !== undefined) {
                    this.streamProduce ('ohlcvs::' + symbol + '::' + timeframe, ohlcv, err);
                }
            }
        };
    }
}
