# -*- coding: utf-8 -*-

import os
import sys
from pprint import pprint

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402


exchange = ccxt.kucoin({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_API_SECRET',
    'password': 'YOUR_API_PASSWORD',
})

markets = exchange.load_markets()

exchange.verbose = True  # uncomment for debugging purposes if necessary

for code in ['TLOS']:  # exchange.currencies.keys():
    response = exchange.public_get_currencies_currency({'currency': code})
    currency = exchange.safe_value(response, 'data')
    if currency:
        # pprint(currency)
        chains = exchange.safe_value(currency, 'chains')
        for chain in chains:
            chainName = exchange.safe_string(chain, 'chainName')
            try:
                response = exchange.fetch_deposit_address(code, {'chain': chainName})
                if response['address'] is not None and response['address'] != '':
                    print(code, 'has a', chainName, 'address', response['address'], ':' + response['tag'] if response['tag'] is not None and len(response['tag']) else '')
                else:
                    print(code, 'has no', chainName, 'address')
            except ccxt.BaseError as e:
                print(code, 'has no', chainName, 'address')
    else:
        print(code, 'has no addresses')
