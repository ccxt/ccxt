# -*- coding: utf-8 -*-

import os
import sys
from pprint import pprint

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402

print('CCXT Version:', ccxt.__version__)


exchange = ccxt.ftx({
    'enableRateLimit': True,
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
})

exchange.load_markets()

# exchange.verbose = True  # uncomment for debugging purposes if necessary

symbol = 'BTC-PERP'
type = 'stop'
side = 'sell'
amount = 1
# price = 50000  # stop limit price if uncommented, stop market if commented
params = {
    'stopPrice': 55000, # stop trigger price
}
order = exchange.create_order(symbol, type, side, amount, price, params)

pprint(order)
