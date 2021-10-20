# -*- coding: utf-8 -*-

import os
import sys
from pprint import pprint

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402


print('CCXT Version:', ccxt.__version__)


exchange = ccxt.binance({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
})

markets = exchange.load_markets()

# exchange.verbose = True  # uncomment for debugging purposes if necessary

symbol = 'ETH/USDT'

try:

    print('--------------------------------------------------------------')

    # option 1 – specify price * amount
    amount = 1
    price = 4000
    # cost = amount * price
    # this line will use the amount * price to calculate the total cost-to-spend (4000)
    order = exchange.create_order(symbol, 'market', 'buy', amount, price)
    pprint(order)

    print('--------------------------------------------------------------')

    # option 2 – specify
    # this line does the same, but you override the cost via extra params
    params = {
        'quoteOrderQty': 4000,  # binance-specific
    }
    amount = None
    price = None
    order = exchange.create_order(symbol, 'market', 'buy', amount, price, params)
    pprint(order)

except Exception as e:
    print(type(e).__name__, str(e))


