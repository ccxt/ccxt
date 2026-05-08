- [Coinbase Fetch Ticker](./examples/py/)


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
    # some markets are not supported with v2 like BTC/USDT
    'options': {'fetchTicker': 'fetchTickerV3', 'fetchTickers': 'fetchTickersV3'}  # for selecting previous versions
    # 'verbose': True,  # for debug output
})

symbols = ['BTC/USDT', 'ETH/USDT']
symbol = 'BTC/USDT'

try:
    tickers = exchange.fetch_tickers(symbols)
    ticker = exchange.fetch_ticker(symbol)
    pprint(tickers)
    pprint(ticker)
except Exception as err:
    print(err)
 
```