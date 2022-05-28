# -*- coding: utf-8 -*-

import os
from random import randint
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402


print('CCXT Version:', ccxt.__version__)

exchange = ccxt.huobi({
    'apiKey': 'bewr5drtmh-7c525142-31c0f170-2480a',
    'secret': '50e6444d-a5b0d419-43747234-10ee0',
    'options': {
        'defaultType': 'swap',
    },
})

markets = exchange.load_markets()


# exchange.verbose = True  # uncomment for debugging purposes if necessary

# creating and closing usdt margined contract
symbol = 'LTC/USDT:USDT'
market = exchange.market(symbol)
order_type = 'limit'
side = 'buy'
offset = 'open'
leverage = 1
amount = 1
params = {'offset': offset, 'lever_rate': leverage}

try:

    # placing an order
    # order = exchange.create_order(symbol, order_type, side, amount, price, params)
    # print(order)

    # listing open orders
    # open_orders = exchange.fetch_open_orders(symbol)
    # print(open_orders)

    # closing it by issuing an oposite contract 
    # warning: since we can only place limit orders
    # it might take a while (depending on the price we choose and market fluctuations) 
    # to the order be fulfilled
    reduce_only = 1 # 1 : yes, 0: no
    offset = 'close'
    side = 'sell'
    params = {'offset': offset, 'reduce_only': reduce_only}
    price = None
    order_type = 'lightning'
    opositeOrder = exchange.create_order(symbol, order_type, side, amount, price, params)
    print(opositeOrder)
except Exception as e:
    print(type(e).__name__, str(e))
