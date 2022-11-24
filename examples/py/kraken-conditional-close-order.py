# -*- coding: utf-8 -*-

import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402
from pprint import pprint


exchange = ccxt.kraken({
    # 'apiKey': 'YOUR_API_KEY',
    # 'secret': 'YOUR_SECRET',
})

markets = exchange.load_markets()

exchange.verbose = True

symbol = 'XMR/USD'
ticker = exchange.fetch_ticker(symbol)
last_price = ticker['last']

# extra params and overrides
params = {
    'close': {
        'ordertype': 'limit',
        'price': last_price * 1.3,
    }
}
amount = 0.05
price = last_price * 0.7
order = exchange.create_order(symbol, 'limit', 'buy', amount, price, params)
print('Created order:')
pprint(order)

fetched_order = exchange.fetch_order(order['id'])
print('Fetched order:')
pprint(fetched_order)

canceled_order = exchange.cancel_order(order['id'])
print('Canceled order:')
pprint(canceled_order)