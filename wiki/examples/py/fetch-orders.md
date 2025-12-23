- [Fetch Orders](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import os
import sys


import ccxt  # noqa: E402

exchange = ccxt.bittrex({
    "apiKey": "YOUR_API_KEY",
    "secret": "YOUR_API_SECRET",
    "enableRateLimit": True,
})

orders = exchange.fetch_orders()
print(orders)

order = exchange.fetch_order(orders[0]['id'])
print(order)
 
```