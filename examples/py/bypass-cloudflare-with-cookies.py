# -*- coding: utf-8 -*-

import cfscrape
import os
import sys
from pprint import pprint

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402


def print_supported_exchanges():
    print('Supported exchanges:')
    print(', '.join(ccxt.exchanges))


try:

    id = sys.argv[1]  # get exchange id from command line arguments

    # check if the exchange is supported by ccxt
    exchange_found = id in ccxt.exchanges

    if exchange_found:

        print('Instantiating ' + id + ' exchange')

        # instantiate the exchange by id
        exchange = getattr(ccxt, id)({
            'timeout': 20000,
        })

        print('Cfscraping...')

        url = exchange.urls['www']
        tokens, user_agent = cfscrape.get_tokens(url)
        exchange.headers = {
            'cookie': '; '.join([key + '=' + tokens[key] for key in tokens]),
            'user-agent': user_agent,
        }

        pprint(exchange.headers)

        try:

            # load all markets from the exchange
            markets = exchange.load_markets()

            # output a list of all market symbols
            print(id + ' has ' + str(len(exchange.symbols)) + ' symbols: ' + ', '.join(exchange.symbols))
            print('Succeeded.')

        except ccxt.BaseError as e:

            print(type(e).__name__, str(e))
            print('Failed.')

    else:

        print('Exchange ' + id + ' not found')
        print_supported_exchanges()

except Exception as e:
    print('[' + type(e).__name__ + ']', str(e))
    print('Usage: python ' + sys.argv[0] + ' id')
    print_supported_exchanges()
