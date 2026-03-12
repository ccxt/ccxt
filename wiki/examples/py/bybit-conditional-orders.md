- [Bybit Conditional Orders](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import os
import sys
from pprint import pprint


import ccxt  # noqa: E402

exchange = ccxt.bybit({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
})

markets = exchange.load_markets()

# exchange.verbose = True  # uncomment for debugging purposes

params = {'stop_px': 9750, 'base_price':11152}
order = exchange.create_order('BTC/USD', 'market', 'buy', 911, None, params)

pprint(order)
 
```