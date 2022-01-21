# -*- coding: utf-8 -*-

import os
from random import randint
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402


print('CCXT Version:', ccxt.__version__)

exchange = ccxt.huobi({

    'options': {
        'defaultType': 'spot',
    },
})

markets = exchange.load_markets()


# exchange.verbose = True  # uncomment for debugging purposes if necessary

# Example 1: Creating/canceling a stop limit order
symbol = 'ADA/USDT'
order_type = 'buy-limit'
side = 'buy'
offset = 'open'
cli_order_id = randint(0,1000)
amount = 10
price = 0.5
stopPrice = 0.6
operator='lte'

params = {'offset': offset, 'client_order_id': cli_order_id, 'stopPrice': stopPrice, 'operator': operator}

try:

    # Order creation
    order = exchange.create_order(symbol, order_type, side, amount, price, params)
    print(order)

    # List open positions
    open_orders = exchange.fetch_open_orders(symbol, params={"side": "buy"})
    # print(open_orders)

    #Order cancelation
    cancelOrder = exchange.cancel_order(order['id'], symbol)
    print(cancelOrder)
except Exception as e:
    print(type(e).__name__, str(e))