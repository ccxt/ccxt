- [Latoken Create Order](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import os
import sys


import ccxt  # noqa: E402


exchange = ccxt.latoken({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
})

symbol = 'ETH/BTC'
type = 'limit'  # only support limit
side = 'buy'  # or 'sell'
amount = 0.01
price = 0.015881  # or None

order = exchange.create_order(symbol, type, side, amount, price)

print(order)
 
```