- [Bitmex Create Order](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import os
import sys


import ccxt  # noqa: E402


exchange = ccxt.bitmex({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
})

symbol = 'BTC/USD:BTC-220624'  # bitcoin contract according to https://github.com/ccxt/ccxt/wiki/Manual#symbols-and-market-ids
type = 'StopLimit'  # or 'Market', or 'Stop' or 'StopLimit'
side = 'sell'  # or 'buy'
amount = 1.0
price = 6500.0  # or None

# extra params and overrides
params = {
    'stopPx': 6000.0,  # if needed
}

order = exchange.create_order(symbol, type, side, amount, price, params)
print(order)
 
```