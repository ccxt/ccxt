# -*- coding: utf-8 -*-

import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402

exchange = ccxt.bittrex({
    "apiKey": "YOUR_API_KEY",
    "secret": "YOUR_API_SECRET",
    "enableRateLimit": True,
})

orders = exchange.fetch_orders()
print(orders)

order = exchange.fetch_order(orders[0]['id'])
print(order)
