# -*- coding: utf-8 -*-

import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402


kraken = ccxt.kraken({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
})

kraken.load_markets()

for symbol in kraken.symbols:
    print(
        symbol,
        'Available leverage levels',
        'Buy:', kraken.markets[symbol]['info']['leverage_buy'],
        'Sell:', kraken.markets[symbol]['info']['leverage_sell']
    )

# THIS IS A KRAKEN-SPECIFIC EXAMPLE.
# THE LEVERAGE WILL NOT WORK WITH OTHER EXCHANGES THE SAME WAY.
# USE IMPLICIT METHODS FOR MARGIN/LEVERAGED ORDERS WITH OTHER EXCHANGES:
# https://github.com/ccxt/ccxt/wiki/Manual#implicit-api-methods

# with create_order all params (including the price=None) are needed!
# the extra param should be "leverage", not "leverage_sell" nor "leverage-sell"
kraken.create_order('BTC/USD', 'market', 'sell', 0.01, None, {'leverage': 3})

# or use a shorthand create_market_sell_order (no "price" param)
kraken.create_market_sell_order('BTC/USD', 0.01, {'leverage': 3})
