# -*- coding: utf-8 -*-

import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402


def table(values):
    first = values[0]
    keys = list(first.keys()) if isinstance(first, dict) else range(0, len(first))
    widths = [max([len(str(v[k])) for v in values]) for k in keys]
    string = ' | '.join(['{:<' + str(w) + '}' for w in widths])
    return "\n".join([string.format(*[str(v[k]) for k in keys]) for v in values])


exchange = ccxt.bittrex({
    'enableRateLimit': True,
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_API_SECRET',
})

exchange.load_markets()

symbol = 'ETH/BTC'
market = exchange.markets[symbol]
starting_date = '2017-01-01T00:00:00'
now = exchange.milliseconds()

print("\nFetching history for:", symbol, "\n")

all_orders = []
since = exchange.parse8601(starting_date)

while since < now:

    try:

        print('Fetching history for', symbol, 'since', exchange.iso8601(since))
        orders = exchange.fetch_closed_orders(symbol, since)
        print('Fetched', len(orders), 'orders')

        all_orders = all_orders + orders

        if len(orders):

            last_order = orders[-1]
            since = last_order['timestamp'] + 1

        else:

            break  # no more orders left for this symbol, move to next one

    except Exception as e:

            print(e)


# omit the following keys for a compact table output
# otherwise it won't fit into the screen width
omitted_keys = [
    'info',
    'timestamp',
    'lastTradeTimestamp',
    'fee',
]

print(table([exchange.omit(order, omitted_keys) for order in all_orders]))
print('Fetched', len(all_orders), symbol, 'orders in total')

# do whatever you want to do with them, calculate profit loss, etc...
