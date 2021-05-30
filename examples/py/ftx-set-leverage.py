# -*- coding: utf-8 -*-

import os
import sys
from pprint import pprint

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402


print('CCXT Version:', ccxt.__version__)

exchange = ccxt.ftx({
    'enableRateLimit': True,
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
})

# pprint(dir(exchange))  # uncomment to print all available methods

markets = exchange.load_markets()

# exchange.verbose = True  # uncomment for debugging

# see https://docs.ftx.com/#change-account-leverage for more details
response = exchange.private_post_account_leverage({
    'leverage': 10,
})

pprint(response)
