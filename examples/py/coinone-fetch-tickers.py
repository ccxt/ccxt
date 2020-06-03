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

tickers = exchange.fetch_tickers()
for symbol, ticker in tickers.items():
    print(
        symbol,
        'high:', str(ticker['high']),
        'low:', str(ticker['low']),
        'prevClose:', str(ticker['previousClose']),
        'price:', str(ticker['close']),
        'baseVolume:', str(ticker['baseVolume']),
        'change:', str(ticker['change']),
        'percentage:', str(ticker['percentage']),
        'average:', str(ticker['average'])
    )
