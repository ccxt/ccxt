```python
# -*- coding: utf-8 -*-

# Prefer watchOHLCV over polling fetchOHLCV in a loop: the candles WebSocket
# channel streams the forming candle and closed buckets instead of repeatedly
# re-fetching the candles endpoint over REST.
#
# Note: coinbase watchOHLCV currently supports only the 5m timeframe.

import ccxt.pro
from importlib import import_module
from importlib.util import find_spec

run = import_module(next(filter(find_spec, ('uvloop', 'winloop', 'asyncio')))).run

async def main():
    exchange = ccxt.pro.coinbase()
    method = 'watchOHLCV'
    symbol = 'BTC/USD'
    timeframe = '5m'
    print('CCXT Pro version', ccxt.pro.__version__)
    if exchange.has[method]:
        while True:
            try:
                candles = await exchange.watch_ohlcv(symbol, timeframe)
                candle = candles[-1]
                print(exchange.iso8601(candle[0]), symbol, timeframe, 'O', candle[1], 'H', candle[2], 'L', candle[3], 'C', candle[4], 'V', candle[5])
            except Exception as e:
                # stop
                await exchange.close()
                raise e
                # or retry
                # pass
    else:
        raise Exception(exchange.id + ' ' + method + ' is not supported or not implemented yet')


run(main())

```
