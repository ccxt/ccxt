- [Binance Futures Set Leverage](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import os
import sys


import ccxt  # noqa: E402


exchange = ccxt.binanceusdm({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
})

exchange.load_markets()

response = exchange.set_leverage(10, 'ADA/USDT')

print(response)
 
```