# -*- coding: utf-8 -*-

import os
import sys
from pprint import pprint

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402

exchange = ccxt.coinone({
    'verbose': True,  # switch it to False if you don't want the HTTP log
})

markets = exchange.load_markets()
pprint(markets)
print('\n', exchange.name, 'supports', len(markets), 'pairs')