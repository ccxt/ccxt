- [Wazirx Create Cancel Orders](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import os
import sys
from pprint import pprint


import ccxt  # noqa: E402


print('CCXT Version:', ccxt.__version__)

exchange = ccxt.wazirx({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
    'options': {
        'defaultType': 'swap',
    },
})

markets = exchange.load_markets()

symbol = 'LTC/USDT'
amount = 0.1
price = 20

# Opening limit order
order = exchange.create_order(symbol, 'limit', 'buy', amount, price)
pprint(order)

# Opening stop-limit order
order2 = exchange.create_order(symbol, 'limit', 'buy', amount, price, {"stopPrice": 70})
pprint(order2)

# Opening second limit order
order3 = exchange.create_order(symbol, 'limit', 'buy', amount, price)
pprint(order3)

# Canceling first limit order
response = exchange.cancel_order(order['id'], symbol)
print(response)

# Canceling all open orders (second and third order)
response = exchange.cancel_all_orders(symbol)
print(response) 
```