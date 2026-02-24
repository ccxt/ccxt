- [Poloniex Fetch Ohlcv Continuously](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import asyncio
import os
import sys
from pprint import pprint


import ccxt.async_support as ccxt  # noqa: E402


# this example shows how to fetch OHLCVs continuously, see issue #7498
# https://github.com/ccxt/ccxt/issues/7498


async def fetch_ohlcvs_continuously(exchange, timeframe, symbol, fetching_time):
    print(exchange.id, timeframe, symbol, 'starting')
    all_ohlcvs = []
    limit = 1
    duration_in_seconds = exchange.parse_timeframe(timeframe)
    duration_in_milliseconds = duration_in_seconds * 1000
    now = exchange.milliseconds()
    end_time = now + fetching_time
    while now < end_time:
        since = int(now / duration_in_milliseconds) * duration_in_milliseconds
        time_to_wait = duration_in_milliseconds - now % duration_in_milliseconds + 10000  # +10 seconds buffer
        print(exchange.id, timeframe, symbol, 'time now is', exchange.iso8601(now))
        print(exchange.id, timeframe, symbol, 'time to wait is', time_to_wait / 1000, 'seconds')
        print(exchange.id, timeframe, symbol, 'sleeping till', exchange.iso8601(now + time_to_wait))
        await exchange.sleep(time_to_wait)
        print(exchange.id, timeframe, symbol, 'done sleeping at', exchange.iso8601(exchange.milliseconds()))
        while True:
            try:
                ohlcvs = await exchange.fetch_ohlcv(symbol, timeframe, since, limit)
                break
            except Exception as e:
                print(type(e).__name__, e.args, str(e))  # comment if not needed
                # break  # uncomment to break it
                # pass   # uncomment to do nothing and just retry again on next iteration
                # or add your own reaction according to the purpose of your app
        print(exchange.id, timeframe, symbol, 'fetched', len(ohlcvs), 'candle(s), time now is', exchange.iso8601(exchange.milliseconds()))
        print(exchange.id, timeframe, symbol, 'all candles:')
        all_ohlcvs += ohlcvs
        for ohlcv in all_ohlcvs:
            print('    ', exchange.iso8601(ohlcv[0]), ohlcv[1:])
        now = exchange.milliseconds()
    return {symbol: all_ohlcvs}

async def fetch_all_ohlcvs_continuously(exchange_id, timeframe, symbols, fetching_time):
    exchange_class = getattr(ccxt, exchange_id)
    exchange = exchange_class()
    input_coroutines = [fetch_ohlcvs_continuously(exchange, timeframe, symbol, fetching_time) for symbol in symbols]
    results = await asyncio.gather(*input_coroutines, return_exceptions=True)
    await exchange.close()
    return exchange.extend(*results)

print('CCXT version:', ccxt.__version__)

exchange_id = 'poloniex'
symbols = ['ETH/BTC', 'BTC/USDT']
timeframe = '5m'
fetching_time = 15 * 60 * 1000  # stop after 15 minutes (approximately 4 iterations)
coroutine = fetch_all_ohlcvs_continuously(exchange_id, timeframe, symbols, fetching_time)
results = asyncio.run(coroutine)
pprint(results)
# results  # if you run this code in Jupyter then uncomment thisline to see the output result
 
```