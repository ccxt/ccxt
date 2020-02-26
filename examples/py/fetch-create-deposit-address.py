# -*- coding: utf-8 -*-

import os
import sys
from pprint import pprint

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402


# -----------------------------------------------------------------------------
# setup

currency_code = 'DASH'  # change me
exchange_id = 'poloniex'  # change me

exchange = getattr(ccxt, exchange_id)({

    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',

    'enableRateLimit': True,  # ←- required! https://github.com/ccxt/ccxt/wiki/Manual#rate-limit

    # 'verbose': True, // ←- uncomment this for verbose output

    # additional credentials might be required in exchange-specific cases:
    # uid or password for coinbasepro, etc...
})

# -----------------------------------------------------------------------------

if not exchange.has['fetchDepositAddress']:
    print('The exchange does not support fetchDepositAddress() yet')
    sys.exit()

# -----------------------------------------------------------------------------

try:

    print('Trying to fetch deposit address for ' + currency_code + ' from ' + exchange_id + '...')

    fetch_result = exchange.fetch_deposit_address(currency_code)

    print('Successfully fetched deposit address for ' + currency_code)
    pprint(fetch_result)

except ccxt.InvalidAddress as e:

    # never skip proper error handling, whatever it is you're building
    # actually, with crypto error handling should be the largest part of your code

    print('The address for ' + currency_code + ' does not exist yet')

    if exchange.has['createDepositAddress']:

        print('Attempting to create a deposit address for ' + currency_code + '...')

        try:

            create_result = exchange.create_deposit_address(currency_code)

            # pprint(create_result)  # for debugging

            print('Successfully created a deposit address for ' + currency_code + ', fetching the deposit address now...')

            try:

                fetch_result = exchange.fetch_deposit_address(currency_code)

                print('Successfully fetched deposit address for ' + currency_code)
                pprint(fetch_result)

            except Exception as e:

                print('Failed to fetch deposit address for ' + currency_code, type(e).__name__, str(e))

        except Exception as e:

                print('Failed to create deposit address for ' + currency_code, type(e).__name__, str(e))

    else:

        print('The exchange does not support createDepositAddress()')

except Exception as e:

    print('There was an error while fetching deposit address for ' + currency_code, type(e).__name__, str(e))
