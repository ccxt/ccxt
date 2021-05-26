import ccxtpro
import asyncio


def table(values):
    first = values[0]
    keys = list(first.keys()) if isinstance(first, dict) else range(0, len(first))
    widths = [max([len(str(v[k])) for v in values]) for k in keys]
    string = ' | '.join(['{:<' + str(w) + '}' for w in widths])
    return "\n".join([string.format(*[str(v[k]) for k in keys]) for v in values])


async def main():
    exchange = ccxtpro.bitmex({
        'enableRateLimit': True,
        # 'options': {
        #     'OHLCVLimit': 1000, # how many candles to store in memory by default
        # },
    })
    symbol = 'BTC/USD'
    timeframe = '1m'  # 5m, 1h, 1d
    limit = 10  # how many candles to return max
    method = 'watchOHLCV'
    if (method in exchange.has) and exchange.has[method]:
        max_iterations = 100  # how many times to repeat the loop before exiting
        for i in range(0, max_iterations):
            try:
                ohlcvs = await exchange.watch_ohlcv(symbol, timeframe, None, limit)
                now = exchange.milliseconds()
                print('\n===============================================================================')
                print('Loop iteration:', i, 'current time:', exchange.iso8601(now), symbol, timeframe)
                print('-------------------------------------------------------------------------------')
                print(table([[exchange.iso8601(o[0])] + o[1:] for o in ohlcvs]))
            except Exception as e:
                print(type(e).__name__, str(e))
                break
        await exchange.close()
    else:
        print(exchange.id, method, 'is not supported or not implemented yet')


asyncio.get_event_loop().run_until_complete(main())
