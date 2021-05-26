# -*- coding: utf-8 -*-

from pprint import pprint

import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402


def get_positive_accounts(balance):
    result = {}
    currencies = list(balance.keys())
    for currency in currencies:
        if balance[currency] and balance[currency] > 0:
            result[currency] = balance[currency]
    return result


exchange = ccxt.hitbtc2({
    "apiKey": "a34ca826b430bdfcca969241b0f7bd2d",
    "secret": "7b28d6b17aea18ae39903add0dae048a",
    "enableRateLimit": True,
})


trading_balance = exchange.fetch_balance()
account_balance = exchange.fetch_balance({'type': 'account'})

pprint('Trading balance:')
pprint(get_positive_accounts(trading_balance['total']))
pprint('Account balance:')
pprint(get_positive_accounts(account_balance['total']))


withdraw = exchange.withdraw('ETH', 0.01, '0x811DCfeb6dC0b9ed825808B6B060Ca469b83fB81')


pprint('Withdraw:')
pprint(withdraw)
