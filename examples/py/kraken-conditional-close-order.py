# -*- coding: utf-8 -*-

import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402


exchange = ccxt.kraken({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
})

# extra params and overrides
custom_params = {
    'close': {
        'ordertype': 'limit',
        'price': 290.33,
    }
}  
order = exchange.create_order(symbol = 'XMR/USD', type = 'limit', side = 'buy', amount = 0.05, price = 210.88, params = custom_params)
print('create_order:', order)

fetched_order = exchange.fetch_order(order['id'])
print('fetch_order:', fetched_order)
# exchange.cancel_order(order['id'])
