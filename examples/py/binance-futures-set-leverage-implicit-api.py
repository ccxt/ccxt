# -*- coding: utf-8 -*-

import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402


exchange = ccxt.binance({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
    'options': {
        'defaultType': 'future',
    }
})

exchange.load_markets()

symbol = 'ADA/USDT'
market = exchange.market(symbol)
leverage =  10

response = exchange.fapiprivate_post_leverage({
    'symbol': market['id'],
    'leverage': leverage,
})

print(response)
