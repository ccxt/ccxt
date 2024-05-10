# -*- coding: utf-8 -*-

import os
import sys
from pprint import pprint

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402

print("CCXT Version:", ccxt.__version__)


exchange = ccxt.krakenfutures()
markets = exchange.load_markets()
# exchange.verbose = True  # uncomment for debugging purposes if necessary
print(exchange.name, "supports the following methods:")
pprint(exchange.has)
print(exchange.name, "supports the following trading symbols:")
for symbol in exchange.symbols:
    print(symbol)
symbol = 'BTC/USD:USD'
orderbook = exchange.fetch_order_book(symbol)
pprint(orderbook)