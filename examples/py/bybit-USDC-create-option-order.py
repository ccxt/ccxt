# -*- coding: utf-8 -*-

import os
import sys
from pprint import pprint

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402


exchange = ccxt.bybit ({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_API_SECRET',
    'defaultType': 'option',
    # 'verbose': True,  # for debug output
})

# BTC/USD:USDC-YYMMDD-STRIKE-C
symbol = 'BTC/USD:USDC-221209-18000-C'
amount = 0.01
price = 280.0

try:
    order = exchange.create_order(symbol, 'limit', 'buy', amount, price)
    pprint(order)
except Exception as err:
    print(err)
