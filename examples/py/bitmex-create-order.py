# -*- coding: utf-8 -*-

import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402


exchange = ccxt.bitmex({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
    'enableRateLimit': True,
})

symbol = 'XBTM18'  # bitcoin contract according to bitmex futures coding
type = 'StopLimit'  # or 'market', or 'Stop' or 'StopLimit'
side = 'sell'  # or 'buy'
amount = 1.0
price = 6500.0  # or None

# extra params and overrides
params = {
    'stopPx': 6000.0,  # if needed
}

order = exchange.create_order(symbol, type, side, amount, price, params)
print(order)
