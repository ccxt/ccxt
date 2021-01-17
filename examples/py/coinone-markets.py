# -*- coding: utf-8 -*-

import os
import sys
from pprint import pprint

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402

exchange = ccxt.coinone({
    'enableRateLimit': True,
    # 'verbose': True,  # uncomment for verbose output
})

markets = exchange.load_markets()
pprint(markets)
print('\n', exchange.name, 'supports', len(markets), 'pairs')
