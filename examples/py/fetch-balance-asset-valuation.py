# -*- coding: utf-8 -*-

import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402


print('CCXT Version:', ccxt.__version__)


exchange = ccxt.binance({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
})


markets = exchange.load_markets()
# exchange.verbose = True  # uncomment for debugging purposes if necessary
balance = exchange.fetch_balance()
tickers = exchange.fetch_tickers()
destination_code = 'USDT'
total_destination_value = 0
for code, amount in balance['total'].items():
    symbol = code + '/' + destination_code
    ticker = tickers.get(symbol, None)
    if ticker is not None:
        valuation = amount * ticker['last']
        total_destination_value += valuation
        print(amount, code, '=', valuation, destination_code)


print('Total', total_destination_value, destination_code)