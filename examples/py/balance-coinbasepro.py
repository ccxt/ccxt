# -*- coding: utf-8 -*-

import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402

exchange = ccxt.coinbasepro({
    'apiKey': "YOUR_API_KEY",
    'secret': "YOUR_SECRET",
    'password': 'zdmj8o7byla',
    'verbose': True,  # switch it to False if you don't want the HTTP log
})

# move to sandbox
exchange.urls['api'] = exchange.urls['test']

print(exchange.fetch_balance())
