- [Huobi Futures](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import os
from random import randint
import sys


import ccxt  # noqa: E402


print('CCXT Version:', ccxt.__version__)

exchange = ccxt.huobi({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
    'options': {
        'defaultType': 'future',
    },
})

markets = exchange.load_markets()


# exchange.verbose = True  # uncomment for debugging purposes if necessary

# creating and canceling a linear future (limit) order
symbol = 'ETH/USDT:USDT-220121' # the last segment is the date of expiration (can be next week, next quarter, ...) adjust it accordingly
order_type = 'limit'
side = 'buy'
offset = 'open'
leverage = 1
amount = 1
price = 1

params = {'offset': offset, 'lever_rate': leverage}

try:
    # fetching current balance
    balance = exchange.fetch_balance()
    print(balance)

    # placing an order
    order = exchange.create_order(symbol, order_type, side, amount, price, params)
    print(order)

    # listing open orders
    open_orders = exchange.fetch_open_orders(symbol)
    # print(open_orders)

    # canceling an order
    cancelOrder = exchange.cancel_order(order['id'], symbol)
    print(cancelOrder)
except Exception as e:
    print(type(e).__name__, str(e))


# creating and canceling a inverse future (limit) order
symbol = 'ADA/USD:ADA-220121' # the last segment is the date of expiration (can be next week, next quarter, ...) adjust it accordingly
order_type = 'limit'
side = 'buy'
offset = 'open'
leverage = 1
amount = 1 # 1 contract = 10 ADA
price = 1

params = {'offset': offset, 'lever_rate': leverage}

try:
    # fetching current balance
    balance = exchange.fetch_balance()
    # print(balance)

    # placing an order
    order = exchange.create_order(symbol, order_type, side, amount, price, params)
    print(order)

    # listing open orders
    open_orders = exchange.fetch_open_orders(symbol)
    # print(open_orders)

    # canceling an order
    cancelOrder = exchange.cancel_order(order['id'], symbol)
    print(cancelOrder)
except Exception as e:
    print(type(e).__name__, str(e)) 
```