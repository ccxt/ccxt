# -*- coding: utf-8 -*-

import os
import sys
from pprint import pprint

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402


exchange = ccxt.bitmart({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
    'uid': 'YOUR_UID',
    # at least some rate-limiting is required
    # https://github.com/ccxt/ccxt/wiki/Manual#rate-limit
    'enableRateLimit': True,  # ←- REQUIRED
})

while True:
    try:
        print('---------------------------------------------------------------')
        datetime = exchange.iso8601 (exchange.milliseconds ())
        print(datetime)
        balance = exchange.fetch_balance()  # this will trigger a sign_in when needed
        pprint(balance)
        # handle the response how you want or do other calls...
    except ccxt.AuthenticationError as e:
        error_message = str(e)
        if 'accessToken' in error_message:
            exchange.sign_in()
        else:
            print(str(e))
            sys.exit()
