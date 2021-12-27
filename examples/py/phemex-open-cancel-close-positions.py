# -*- coding: utf-8 -*-

import os
import sys
from pprint import pprint

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402


print('CCXT Version:', ccxt.__version__)

exchange = ccxt.phemex({
    'enableRateLimit': True,  # https://github.com/ccxt/ccxt/wiki/Manual#rate-limit
    'apiKey': 'YOUR_API_KEY',  # testnet keys if using the testnet sandbox
    'secret': 'YOUR_SECRET',  # testnet keys if using the testnet sandbox
    'options': {
        'defaultType': 'swap',
    },
})

# exchange.set_sandbox_mode(True)  # uncomment to use the testnet sandbox

markets = exchange.load_markets()

amount = 10
symbol = 'BTC/USD:USD'

# Opening and Canceling a pending contract order (unrealistic price)
order = exchange.create_order(symbol, 'limit', 'buy', amount, '20000')
exchange.cancel_order(order['id'], symbol)

# Opening and exiting a filled contract position by issuing the exact same order but in the opposite direction

# Opening a long position
order = exchange.create_order(symbol, 'market', 'buy', amount)

# closing the previous position by issuing the exact same order but in the opposite direction
# with reduceOnly option to prevent an unwanted exposure increase
orderClose = exchange.create_order(symbol, 'market', 'sell', amount, None, {'reduceOnly': True})