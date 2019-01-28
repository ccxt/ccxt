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


exchange = ccxt.tokenomy({
    "apiKey": "your-key-here",
    "secret": "your-secret-here",
    "enableRateLimit": True,
})


trading_balance = exchange.create_order('TEN/BTC', 'limit', 'buy', 0.00001, None)


pprint('Trading balance:')
pprint(trading_balance)
