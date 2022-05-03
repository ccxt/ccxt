# -*- coding: utf-8 -*-

import os
import sys
from pprint import pprint

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402


def main():

    # apiKey must have universal transfer permissions
    binance = ccxt.binance({
        "apiKey": "...",
        "secret": "...",
    })
    binance.load_markets()

    pprint(binance.transfer('USDT', 0.1, 'spot', 'future'))
    transfers = binance.fetchTransfers()
    pprint('got ' + str(len(transfers)) + ' transfers')
    pprint(binance.transfer('USDT', 0.1, 'spot', 'margin'))

    # binance requires from and to in the params
    pprint(binance.fetchTransfers(None, None, None, {'from': 'spot', 'to': 'margin'}))

    # alternatively the same effect as above
    pprint(binance.fetchTransfers(None, None, None, {'type': 'MAIN_MARGIN'}))  # defaults to MAIN_UMFUTURE


main()
