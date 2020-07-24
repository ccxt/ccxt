# -*- coding: utf-8 -*-

import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402


exchange = ccxt.bitmex({
    'enableRateLimit': True
})

markets = exchange.load_markets()
symbol = 'XBTU20'
market = exchange.market(symbol)

units = {
    'XBT':  { 'decimals': 4, 'multiplier': 1, 'name': 'bitcoin' },
    'mXBT': { 'decimals': 3, 'multiplier': 1000, 'name': 'milli-bitcoin'  },
    'μXBT': { 'decimals': 1, 'multiplier': 1000000, 'name': 'micro-bitcoin' },
    'XBt':  { 'decimals': 0, 'multiplier': 100000000, 'name': 'satoshi' },
}

# the following calculation depends on contract specifications
# one XBTU20 contract = 1 USD in Bitcoin

num_contracts = 1

while True:
    try:
        ticker = exchange.fetch_ticker(symbol)
        last_price = ticker['last']
        value = num_contracts / last_price
        print('---------------------------------------------------------------')
        print(exchange.iso8601(exchange.milliseconds()))
        for unit in units:
            multiplier = units[unit]['multiplier']
            decimals = units[unit]['decimals']
            name = units[unit]['name']
            rounded_value = exchange.decimal_to_precision(value * multiplier, ccxt.ROUND, decimals)  # alternatively, use ccxt.TRUNCATE here
            print(num_contracts, symbol, 'contracts =', rounded_value, unit, '(' + name + ')')
    except Exception as e:
        pass
