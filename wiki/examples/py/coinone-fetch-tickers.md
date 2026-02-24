- [Coinone Fetch Tickers](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import os
import sys
from pprint import pprint


import ccxt  # noqa: E402

exchange = ccxt.coinone({
    # 'verbose': True,  # uncomment for verbose output
})

# fetch all
tickers = exchange.fetch_tickers()
for symbol, ticker in tickers.items():
    print(ticker)

print("\n")

# fetch one by one
markets = exchange.load_markets()
for symbol in markets.keys():
    ticker = exchange.fetch_ticker(symbol)
    print(ticker)
 
```