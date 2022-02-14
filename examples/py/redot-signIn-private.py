# -*- coding: utf-8 -*-

import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402

exchange = ccxt.redot({
    "apiKey": "YOUR_API_KEY",
    "secret": "YOUR_API_SECRET",
    "enableRateLimit": True,
})

# Create token (mandatory step)
exchange.sign_in()

balances = exchange.fetch_balance()
print("Balance BTC", balances['BTC'])

orders = exchange.fetch_closed_orders()
print("Number of closed orders:", len(orders))