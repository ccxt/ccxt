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
        "apiKey": "YOUR_API_KEY",
        "secret": "YOUR_SECRET",
    })
    binance.load_markets()

    pprint(binance.transfer('USDT', 0.1, 'spot', 'future'))
    transfers = binance.fetch_transfers()
    pprint('there is ' + str(len(transfers)) + ' transfers')
    pprint(binance.transfer('USDT', 0.1, 'spot', 'cross'))  # For transfer to cross margin wallet
    pprint(binance.transfer('USDT', 0.1, 'spot', 'ADA/USDT'))  # For transfer to an isolated margin wallet


main()
