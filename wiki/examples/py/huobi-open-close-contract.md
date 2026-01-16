- [Huobi Open Close Contract](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import os
from random import randint
import sys
from pprint import pprint


import ccxt  # noqa: E402


print('CCXT Version:', ccxt.__version__)

exchange = ccxt.huobi({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
    'options': {
        'defaultType': 'swap',
        'marginType': 'cross'
    },
})

markets = exchange.load_markets()


exchange.verbose = True  # uncomment for debugging purposes if necessary


# Example: creating and closing a contract
symbol = 'ADA/USDT:USDT'
order_type = 'limit' # market positions for contracts not available
side = 'buy'
offset = 'open'
leverage = 1
amount = 1
price = 1.14615 # adjust this accordingly
client_order_id = 1

params = {'offset': offset, 'lever_rate': leverage, 'client_order_id': client_order_id}

try:
    # fetching current balance
    balance = exchange.fetch_balance()
    # print(balance)

    # # placing an order
    order = exchange.create_order(symbol, order_type, side, amount, price, params)
    # print(order)

    # # list open position
    position = exchange.fetch_position(symbol)
    # print(position)

    # closing it by issuing an oposite contract 
    # warning: since we can only place limit orders
    # it might take a while (depending on the price we choose and market fluctuations) 
    # to the order be fulfilled
    # and therefore close our previous position
    side = 'sell'
    type = 'limit'
    offset = 'close'
    reduce_only = 1 # 1 : yes, 0: no
    client_order_id = 5
    price = 1.11 # adjust this accordingly
    params = {'offset': offset, 'reduce_only': reduce_only, 'client_order_id': client_order_id}
    opositeOrder = exchange.create_order(symbol, order_type, side, amount, price, params)
    print(opositeOrder)
except Exception as e:
    print(type(e).__name__, str(e))
 
```