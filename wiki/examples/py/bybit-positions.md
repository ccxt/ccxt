- [Bybit Positions](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import os
import sys


import ccxt  # noqa: E402

from pprint import pprint

print('CCXT Version:', ccxt.__version__)

exchange = ccxt.bybit ({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
})

markets = exchange.load_markets() # https://github.com/ccxt/ccxt/wiki/Manual#loading-markets

exchange.verbose = True  # uncomment for debugging
symbol = 'BTC/USDT:USDT'  # https://github.com/ccxt/ccxt/wiki/Manual#contract-naming-conventions
market = exchange.market(symbol)
params = {'subType':'linear' if market['linear'] else 'inverse'}
linear_positions = exchange.fetch_positions([ symbol ], params)
pprint(linear_positions)
symbol = 'BTC/USD:BTC'
market = exchange.market(symbol)
params = {'subType':'linear' if market['linear'] else 'inverse'}
inverse_positions = exchange.fetch_positions([ symbol ], params)
pprint(inverse_positions)
 
```