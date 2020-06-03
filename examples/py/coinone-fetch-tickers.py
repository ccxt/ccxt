# -*- coding: utf-8 -*-

import os
import sys
from pprint import pprint

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402

exchange = ccxt.coinone({
    'enableRateLimit': True,
    'verbose': False,  # switch it to False if you don't want the HTTP log
})

def printTicker(symbol, ticker):
    print(
        str(ticker['timestamp']),
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

# fetch all
tickers = exchange.fetch_tickers()
for symbol, ticker in tickers.items():
    printTicker(symbol, ticker)

print()

# fetch one by one
markets = exchange.load_markets()
for symbol in markets.keys():
    printTicker(symbol, exchange.fetch_ticker(symbol))
