# -*- coding: utf-8 -*-

import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402

exchange = ccxt.bittrex({
    "apiKey": "471b47a06c384e81b24072e9a8739064",
    "secret": "694025686e9445589787e8ca212b4cff",
    "enableRateLimit": True,
})

orders = exchange.fetch_orders()
print(orders)

order = exchange.fetch_order(orders[0]['id'])
print(order)
