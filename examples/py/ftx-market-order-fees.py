# -*- coding: utf-8 -*-

import os
import sys
from pprint import pprint

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402


print('CCXT Version:', ccxt.__version__)


def table(values):
    first = values[0]
    keys = list(first.keys()) if isinstance(first, dict) else range(0, len(first))
    widths = [max([len(str(v[k])) for v in values]) for k in keys]
    string = ' | '.join(['{:<' + str(w) + '}' for w in widths])
    return "\n".join([string.format(*[str(v[k]) for k in keys]) for v in values])


exchange = ccxt.ftx({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
    # "headers": {
    #     "FTX-SUBACCOUNT": "YOUR_SUBACCOUNT_HERE"
    # }
})

markets = exchange.load_markets()

# exchange.verbose = True

print('----------------------------------------------------------------------')
print('All recent orders:')
orders = exchange.fetch_orders()
print(table(orders))

market_orders = [order for order in orders if order['type'] == 'market']

if not len(market_orders):
    print('You have no market orders yet')
    exit()

print('----------------------------------------------------------------------')
print('Last market order:')
last_order = orders[-1]
pprint(last_order)

print('----------------------------------------------------------------------')
trades = exchange.fetch_order_trades(last_order['id'])
print('Total', len(trades), 'trades for', last_order['symbol'], 'order', last_order['id'])
print(table(trades))

print('----------------------------------------------------------------------')
fees = [trade['fee'] for trade in trades]
fees = exchange.reduce_fees_by_currency(fees)
print('Total fees for', last_order['symbol'], 'order', last_order['id'])
pprint(fees)
