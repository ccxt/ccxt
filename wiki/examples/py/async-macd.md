- [Async Macd](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

from asyncio import gather, run
import pandas_ta as ta
import pandas as pd
import os
import sys


import ccxt.async_support as ccxt  # noqa: E402
print('CCXT Version:', ccxt.__version__)

async def run_ohlcv_loop(exchange, symbol, timeframe, limit):
    since = None
    fast = 12
    slow = 26
    signal = 9
    while True:
        try:
            ohlcv = await exchange.fetch_ohlcv(symbol, timeframe, since, limit)
            if len(ohlcv):
                df = pd.DataFrame(ohlcv, columns=['time', 'open', 'high', 'low', 'close', 'volume'])

                macd = df.ta.macd(fast=fast, slow=slow, signal=signal)
                df = pd.concat([df, macd], axis=1)
                print('----------------------------------------------------------')
                print(exchange.iso8601(exchange.milliseconds()), symbol, timeframe)
                print(df[-signal:])
        except Exception as e:
            print(type(e).__name__, str(e))


async def main():
    exchange = ccxt.binance()
    timeframe = '1m'
    limit = 50
    symbols = [
        'BTC/USDT',
        'ETH/USDT',
    ]
    loops = [run_ohlcv_loop(exchange, symbol, timeframe, limit) for symbol in symbols]
    await gather(*loops)
    await exchange.close()


run(main())
 
```