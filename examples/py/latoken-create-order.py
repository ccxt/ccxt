# -*- coding: utf-8 -*-

import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402


exchange = ccxt.latoken({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
    'enableRateLimit': True, # this is required, as documented in the Manual!
})

symbol = 'ETH/BTC'
type = 'limit'  # only support limit
side = 'buy'  # or 'sell'
amount = 0.01
price = 0.015881  # or None

order = exchange.create_order(symbol, type, side, amount, price)

print(order)
