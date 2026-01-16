- [Fetch Ohlcv Mark Index Price](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import os
import sys
from pprint import pprint

import ccxt  # noqa: E402

print('CCXT Version:', ccxt.__version__)
exchange = ccxt.binanceusdm()

response = exchange.fetchOHLCV(
    symbol='ADA/USDT',
    timeframe='1h',
    params={"price": 'index'}
)

pprint(response)

# Convenience methods --------------------------------------------------------

markKlines = exchange.fetchMarkOHLCV(
    symbol='ADA/USDT',
    timeframe='1h',
    params={"price": 'mark'}
)

indexKlines = exchange.fetchIndexOHLCV(
    symbol='ADA/USDT',
    timeframe='1h',
    params={"price": 'mark'}
)

pprint(markKlines)
pprint(indexKlines)
 
```