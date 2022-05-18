# -*- coding: utf-8 -*-

import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402

exchange = ccxt.phemex({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
})

# exchange.set_sandbox_mode(True)

# Example 1: Creating stop-market order
symbol = 'LTC/USDT'
type = 'market'
side = 'buy'
amount = 0.5

params = {
    'stopPrice': 50,
}

stop_market = exchange.create_order(symbol, type, side, amount, None, params)
print(stop_market)

# Example 2: Create stop-limit order
symbol = 'LTC/USDT'
type = 'limit'
side = 'buy'
amount = 0.5
price = 70

params = {
    'stopPrice': 50,
}

stop_limit = exchange.create_order(symbol, type, side, amount, price, params)
print(stop_limit)