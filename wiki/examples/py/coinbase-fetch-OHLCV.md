- [Coinbase Fetch Ohlcv](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import os
import sys
from pprint import pprint


import ccxt  # noqa: E402
print('CCXT Version:', ccxt.__version__)
exchange = ccxt.coinbase({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_API_SECRET',
    # 'verbose': True,  # for debug output
})

symbol = 'BTC/USDT'
timeframe = '1m'
since = None
limit = None  # not used by coinbase

try:
    # Max 300 Candles
    candles = exchange.fetch_ohlcv(symbol, timeframe, since, limit)
    pprint(candles)
except Exception as err:
    print(err)
 
```