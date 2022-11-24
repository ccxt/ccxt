# -*- coding: utf-8 -*-

from pprint import pprint

import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402


symbol = 'ETH/BTC'

exchange = ccxt.poloniex({
    'enableRateLimit': True,  # enabled by default
})

# print 10 times with appropriate delay
for i in range(0, 10):
    print('--------------------------------------------------------------------')
    ticker = exchange.fetch_ticker(symbol)
    ticker = exchange.omit(ticker, 'info')
    pprint(ticker)
