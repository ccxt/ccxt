# -*- coding: utf-8 -*-

# THIS IS A MOCKUP FILE IN PROGRESS

# import argparse
import os
import sys
# import json
# import time

# ------------------------------------------------------------------------------

root = os.path.dirname(os.path.abspath(__file__))
sys.path.append(root)

# ------------------------------------------------------------------------------

import ccxt  # noqa: E402

# ------------------------------------------------------------------------------

taker = 0.0025
maker = 0.0010
price = 100.00
amount = 10.00

market = {
    'id': 'foobar',
    'symbol': 'FOO/BAR',
    'base': 'FOO',
    'quote': 'BAR',
    'taker': taker,
    'maker': maker,
    'precision': {
        'price': 8,
        'amount': 8,
    }
}

exchange = ccxt.Exchange({
    'id': 'mock',
    'markets': {'FOO/BAR': market},
})

exchange.calculate_fee(market['symbol'], 'limit', 'sell', amount, price, 'taker', {})

# {'rate': {'quote': 0.0025, 'base': 0.0}, 'cost': {'quote': 2.5, 'base': 0.0}}

exchange.calculate_fee(market['symbol'], 'limit', 'sell', amount, price, 'maker', {})

# {'rate': {'quote': 0.001, 'base': 0.0}, 'cost': {'quote': 1.0, 'base': 0.0}}
