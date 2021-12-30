# -*- coding: utf-8 -*-

import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402




# exchange = ccxt.bitmex({
#     'apiKey': 'YOUR_API_KEY',
#     'secret': 'YOUR_SECRET',
#     'enableRateLimit': True,
# })

exchange.set_sandbox_mode(True)  # uncomment to use the testnet sandbox

symbol = 'BTC/USD'  
type = 'limit'
side = 'buy'  
amount = 100
price = 15000

## Creating multiple orders and cancel them
## https://github.com/ccxt/ccxt/issues/10112

# create first order
order1 = exchange.create_order(symbol, type, side, amount, price, {'clientOrderId': 'order001'})
print(order1)

# create second order
price = 10000
order2 = exchange.create_order(symbol, type, side, amount, price, {'clientOrderId': 'order002'})
print(order2)

# create third order
price = 10000
order2 = exchange.create_order(symbol, type, side, amount, price, {'clientOrderId': 'order002'})
print(order2)

# canceling first order 
cancelResponse = exchange.cancel_order(None, None, {'clientOrderId': 'order001'})
# print(cancelResponse)