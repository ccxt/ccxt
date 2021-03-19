# -*- coding: utf-8 -*-

import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402

exchange = ccxt.kucoin({
    "apiKey": "YOUR_API_KEY",
    "secret": "YOUR_SECRET",
    "password": "YOUR_PASSWORD"
})

symbol = 'ETH/USDT'
now = exchange.milliseconds()
day = 24 * 3600 * 1000
week = 7 * day
since = now - 365 * day  # start one year back
limit = 20

while since < now:

    end = min(since + week, now)
    params = {'endAt': end}
    orders = exchange.fetch_closed_orders(symbol, since, limit, params)
    print(exchange.iso8601(since), '-', exchange.iso8601(end), len(orders), 'orders')
    if len(orders) == limit:
        since = orders[-1]['timestamp']
    else:
        since += week
