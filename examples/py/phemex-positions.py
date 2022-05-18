# -*- coding: utf-8 -*-

import os
import sys
from pprint import pprint

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402


print('CCXT Version:', ccxt.__version__)

exchange = ccxt.phemex({
    'apiKey': 'YOUR_API_KEY',  # testnet keys if using the testnet sandbox
    'secret': 'YOUR_SECRET',  # testnet keys if using the testnet sandbox
    'options': {
        'defaultType': 'swap',
    },
})

# exchange.set_sandbox_mode(True)  # uncomment to use the testnet sandbox

markets = exchange.load_markets()

# example 1
positions = exchange.fetch_positions(None, {'code':'BTC'})
pprint(positions)

print('------------------------------------------------------------')

# example 2
positions = exchange.fetch_positions(None, {'currency':'BTC'})
pprint(positions)

print('------------------------------------------------------------')

# example 3
balance = exchange.fetch_balance({'code':'BTC'})
pprint(balance['info']['data']['positions'])

print('------------------------------------------------------------')

# example 4
balance = exchange.fetch_balance({'currency':'BTC'})
pprint(balance['info']['data']['positions'])

print('------------------------------------------------------------')

# example 5
# https://github.com/ccxt/ccxt/wiki/Manual#implicit-api-methods
response = exchange.private_get_accounts_accountpositions({'currency': 'BTC'})
pprint(response['data']['positions'])
