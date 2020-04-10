# -*- coding: utf-8 -*-

import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402

exchange = ccxt.kucoin({
    "apiKey": "5c6ad928134ab726d08eff05",
    "secret": "b0987f7f-855e-415d-a44f-43b421abc2f9",
    "password": "cy7QE9fDDtc2LbrK"
})

symbol = 'ETH/USDT'
now = exchange.milliseconds()
day = 24 * 3600 * 1000
week = 7 * day
since = now - 365 * day  # start one year back
limit = 20

while since < now:

    end = since + week
    params = {'endAt': end}
    orders = exchange.fetch_closed_orders(symbol, since, limit, params)
    print(exchange.iso8601(since), '-', exchange.iso8601(end), len(orders), 'orders')
    if len(orders):
        since = orders[-1]['timestamp']
    else:
        since += week