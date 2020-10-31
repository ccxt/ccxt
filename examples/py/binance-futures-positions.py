# -*- coding: utf-8 -*-

import os
import sys
from pprint import pprint

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402

print('CCXT Version:', ccxt.__version__)

exchange = ccxt.binance({
    'apiKey': 'YOUR_TESTNET_API_KEY',
    'secret': 'YOUR_TESTNET_API_SECRET',
    'enableRateLimit': True,  # https://github.com/ccxt/ccxt/wiki/Manual#rate-limit
    'options': {
        'defaultType': 'future',
    },
})

exchange.set_sandbox_mode(True)  # comment if you're not using the testnet
markets = exchange.load_markets()
exchange.verbose = True  # debug output

def table(values):
    first = values[0]
    keys = list(first.keys()) if isinstance(first, dict) else range(0, len(first))
    widths = [max([len(str(v[k])) for v in values]) for k in keys]
    string = ' | '.join(['{:<' + str(w) + '}' for w in widths])
    return "\n".join([string.format(*[str(v[k]) for k in keys]) for v in values])


balance = exchange.fetch_balance()


positions = balance['info']['positions']
pprint(positions)
print(table(positions))