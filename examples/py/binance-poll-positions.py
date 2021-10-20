# -*- coding: utf-8 -*-

import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402


print('CCXT Version:', ccxt.__version__)


exchange = ccxt.binanceusdm({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
})
markets = exchange.load_markets()

# exchange.verbose = True  # uncomment for debugging purposes if necessary

while True:
    try:
        positions = exchange.fetch_positions ()
        print(exchange.iso8601(exchange.milliseconds()), len(positions), 'positions')
        print([ [position['symbol'], position['contracts']] for position in positions ])
    except Exception as e:
        print(type(e).__name__, str(e))

