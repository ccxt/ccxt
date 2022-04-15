# -*- coding: utf-8 -*-

import os
from random import randint
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402


print('CCXT Version:', ccxt.__version__)

exchange = ccxt.gateio({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
    'options': {
        'defaultType': 'future',
    },
})

markets = exchange.load_markets()

# exchange.verbose = True  # uncomment for debugging purposes if necessary

# Example 1: Creating and canceling a linear future (limit) order
symbol = 'LTC/USDT:USDT'
type = 'limit'
side = 'buy'
amount = 1
price = 55

try:
    # placing an order
    order = exchange.create_order(symbol, type, side, amount, price)
    print(order)

    # listing open orders
    open_orders = exchange.fetch_open_orders(symbol)
    print(open_orders)

    # canceling an order
    cancelOrder = exchange.cancel_order(order['id'], symbol)
    print(cancelOrder)
except Exception as e:
    print(type(e).__name__, str(e))


# Example 2: Creating and canceling a linear future (stop-limit) order with leverage
symbol = 'LTC/USDT:USDT'
type = 'limit'
side = 'buy'
amount = 1
price = 55
stop_price = 140
params = {'stopPrice': stop_price }

try:
    # set leverage
    leverage = exchange.set_leverage(3, symbol)
    print(leverage)

    # placing an order
    order = exchange.create_order(symbol, type, side, amount, price, params)
    print(order)

    # listing open orders
    open_orders = exchange.fetch_open_orders(symbol)
    print(open_orders)

    # canceling an order
    cancelParams = {'isStop': True }
    cancelOrder = exchange.cancel_order(order['id'], symbol, cancelParams)
    print(cancelOrder)

    # reset leverage
    exchange.set_leverage(1, symbol)
except Exception as e:
    print(type(e).__name__, str(e))