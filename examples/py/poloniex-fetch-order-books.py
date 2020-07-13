# -*- coding: utf-8 -*-

import os
import sys
from pprint import pprint

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402

id = 'poloniex'

# instantiate the exchange by id
exchange = getattr(ccxt, id)({
    # 'proxy':'https://cors-anywhere.herokuapp.com/',
})

# load all markets from the exchange
markets = exchange.load_markets()

# this will work (a limited number of symbols)
result = exchange.fetch_order_books(['ETH/BTC', 'LTC/BTC'])
pprint(result)

# this will also work (a limited number of symbols)
result = exchange.fetch_order_books(exchange.symbols[0:10])
pprint(result)

# this will not work (too many symbols)
result = exchange.fetch_order_books(exchange.symbols)
pprint(result)
