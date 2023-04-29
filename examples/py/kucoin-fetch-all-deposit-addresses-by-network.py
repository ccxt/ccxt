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
    # 'verbose': True,  # for debug output
})

code = 'USDT'

try:
    depositAddresses = exchange.fetch_deposit_addresses_by_network(code)
    pprint(depositAddresses)
except Exception as err:
    print(err)
