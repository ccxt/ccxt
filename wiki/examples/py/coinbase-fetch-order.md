- [Coinbase Fetch Order](./examples/py/)


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

order_id = '04204eaf-94d6-444a-b9b7-2f8a485311f6'
symbol = 'BTC/USDT'
since = None
limit = 3

try:
    fetch_order = exchange.fetch_order(order_id, symbol)
    # fetch_orders = exchange.fetch_orders(symbol, since, limit)
    # fetch_open_orders = exchange.fetch_open_orders(symbol, since, limit)
    pprint(fetch_order)
    # pprint(fetch_orders)
    # pprint(fetch_open_orders)
except Exception as err:
    print(err)
 
```