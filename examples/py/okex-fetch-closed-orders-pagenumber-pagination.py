# -*- coding: utf-8 -*-

import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402

'''
This is an example of pagenumber-based pagination as described here:
https://github.com/ccxt/ccxt/wiki/Manual#pagenumber-based-cursor-pagination
'''

symbol = 'ETH/BTC'

exchange = ccxt.okex({

    'apiKey': 'YOUR_API_KEY',  # put your values here
    'secret': 'YOUR_SECRET',

    'enableRateLimit': True,  # or add .enableRateLimit = True later
})


def get_all_closed_orders_since_to(exchange, symbol, since, to):
    result = []
    page = 1
    min_timestamp = to
    print('Fetching all orders since', exchange.iso8601(since), since)
    while min_timestamp > since:
        try:
            print('Fetching page', page)
            params = {'current_page': page}
            orders = exchange.fetch_closed_orders(symbol, since, None, params)
            if len(orders):
                min_timestamp = orders[0]['timestamp']
                print('Fetched', len(orders), 'orders, the oldest order as of', exchange.iso8601(min_timestamp), min_timestamp)
                result += orders
                page += 1
            else:
                min_timestamp = since
        except ccxt.ExchangeNotAvailable as e:
            pass  # retry
    return result


one_day = 24 * 60 * 60 * 1000  # in milliseconds
since = exchange.parse8601('2018-11-25T00:00:00')  # 0:00 AM UTC in milliseconds
# or
since = exchange.milliseconds() - one_day  # last 24 hours in milliseconds

to = since + one_day

all_orders = get_all_closed_orders_since_to(exchange, symbol, since, to)

all_orders = exchange.sort_by(all_orders, 'timestamp')

print('Fetched all', len(all_orders), 'orders')
print('The oldest order as of', exchange.iso8601(all_orders[0]['timestamp']))
print('The youngest order as of', exchange.iso8601(all_orders[-1]['timestamp']))
print('Done.')
