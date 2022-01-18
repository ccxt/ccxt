# -*- coding: utf-8 -*-

import os
from random import randint
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402


print('CCXT Version:', ccxt.__version__)

exchange = ccxt.huobi({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET_KEY',
    'options': {
        'defaultType': 'future',
    },
})

markets = exchange.load_markets()


# exchange.verbose = True  # uncomment for debugging purposes if necessary


# Creating/canceling a linear future (limit) order 
symbol = 'ADA/USD:ADA-220121' # the last segment it's the date of expiration (can bee next week, next quarter,...) adjust it accordingly
order_type = 'limit'
side = 'buy'
offset = 'open'
cli_order_id = randint(0,1000)
leverage = 1 
amount = 1 # 1 contract = 10 ADA
price = 1

params = {'offset': offset, 'lever_rate': leverage, 'client_order_id': cli_order_id}

try:
    order = exchange.create_order(symbol, order_type, side, amount, price, params)
    print(order)
    cancelOrder = exchange.cancel_order(order['id'], symbol)
    print(cancelOrder)
except Exception as e:
    print(type(e).__name__, str(e))