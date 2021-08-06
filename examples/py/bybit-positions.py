# -*- coding: utf-8 -*-

import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402

from pprint import pprint

print('CCXT Version:', ccxt.__version__)

exchange = ccxt.bybit ({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
    'enableRateLimit': True,  # https://github.com/ccxt/ccxt/wiki/Manual#rate-limit
})

# https://github.com/ccxt/ccxt/wiki/Manual#loading-markets

markets = exchange.load_markets()

# exchange.verbose = True  # uncomment for debugging

# https://github.com/ccxt/ccxt/wiki/Manual#implicit-api-methods

# -----------------------------------------------------------------------------

symbol = 'BTC/USDT'
market = exchange.market(symbol)

response = exchange.private_linear_get_position_list({'symbol':market['id']})
linear_positions = response['result']
pprint(linear_positions)

# -----------------------------------------------------------------------------

symbol = 'BTC/USD'
market = exchange.market(symbol)

response = exchange.v2_private_get_position_list({'symbol':market['id']})
inverse_positions = response['result']
pprint(inverse_positions)
