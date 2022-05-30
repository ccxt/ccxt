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

# fetch all
tickers = exchange.fetch_tickers()
for symbol, ticker in tickers.items():
    print(ticker)

print("\n")

# fetch one by one
markets = exchange.load_markets()
for symbol in markets.keys():
    ticker = exchange.fetch_ticker(symbol)
    print(ticker)
