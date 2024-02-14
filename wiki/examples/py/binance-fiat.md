- [Binance Fiat](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import os
import sys


import ccxt  # noqa: E402


exchange = ccxt.binance({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
})

markets = exchange.load_markets()

fiat_currencies = [currency['code'] for currency in exchange.currencies.values() if currency['info']['isLegalMoney']]

fiat_markets = [market for market in exchange.markets.values() if ((market['base'] in fiat_currencies) or (market['quote'] in fiat_currencies))]

for market in fiat_markets:
    print(market['symbol'])
 
```