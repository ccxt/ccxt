```python
# -*- coding: utf-8 -*-

import os
import sys
from importlib import import_module
from importlib.util import find_spec

run = import_module(next(filter(find_spec, ('uvloop', 'winloop', 'asyncio')))).run


import ccxt.async_support as ccxt  # noqa: E402


print('CCXT Version:', ccxt.__version__)


async def main():
    exchange = ccxt.kucoin()
    markets = await exchange.load_markets()
    i = 0
    while True:
        try:
            symbol = 'BTC/USDT'
            timeframe = '5m'
            since = None
            limit = 1000
            ohlcvs = await exchange.fetch_ohlcv(symbol, timeframe, since, limit)
            now = exchange.milliseconds()
            datetime = exchange.iso8601(now)
            print(datetime, i, 'fetched', len(ohlcvs), symbol, timeframe, 'candles',
                'from', exchange.iso8601(ohlcvs[0][0]),
                'to', exchange.iso8601(ohlcvs[len(ohlcvs)-1][0]))
        except ccxt.RateLimitExceeded as e:
            now = exchange.milliseconds()
            datetime = exchange.iso8601(now)
            print(datetime, i, type(e).__name__, str(e))
            await exchange.sleep(10000)
        except Exception as e:
            print(type(e).__name__, str(e))
            raise e
        i += 1


run (main())

```
