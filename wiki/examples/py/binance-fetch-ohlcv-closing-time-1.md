- [Binance Fetch Ohlcv Closing Time 1](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import os
import sys

import ccxt  # noqa: E402


exchange = ccxt.binance()
symbol = 'BTC/USDT'
timeframe = '1h'

timeframe_duration_in_seconds = exchange.parse_timeframe(timeframe)
timeframe_duration_in_milliseconds = timeframe_duration_in_seconds * 1000
ohlcvs = exchange.fetch_ohlcv(symbol, timeframe)
for ohlcv in ohlcvs:
    print([exchange.iso8601(ohlcv[0] + timeframe_duration_in_milliseconds - 1)] + ohlcv[1:])
 
```