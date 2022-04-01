# -*- coding: utf-8 -*-

import os
from random import randint
import sys
from pprint import pprint

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402


print('CCXT Version:', ccxt.__version__)

exchange = ccxt.gateio({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
    'options': {
        'defaultType': 'swap',
    },
})

# exchange.set_sandbox_mode(True) 

markets = exchange.load_markets()

exchange.verbose = True  # uncomment for debugging purposes if necessary


# Example: creating and closing a contract
symbol = 'LTC/USDT:USDT'
order_type = 'market'
side = 'buy'
amount = 1

try:
    # fetching current balance
    balance = exchange.fetch_balance()
    # print(balance)

    # placing an order/ opening contract position
    order = exchange.create_order(symbol, order_type, side, amount)
    # print(order)

    # closing it by issuing an oposite contract 
    # and therefore close our previous position
    side = 'sell'
    type = 'market'
    reduce_only = True
    params = {'reduce_only': reduce_only}
    opositeOrder = exchange.create_order(symbol, order_type, side, amount, None, params)
    print(opositeOrder)
except Exception as e:
    print(type(e).__name__, str(e))
