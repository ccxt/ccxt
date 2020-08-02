# -*- coding: utf-8 -*-

import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402


exchange = ccxt.kraken({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_API_SECRET',
    'enableRateLimit': True,  # required by the Manual https://github.com/ccxt/ccxt/wiki/Manual#rate-limit
})

exchange.load_markets()

# exchange.verbose = True  # uncomment for verbose debug output

exchange.rateLimit = 10000  # set a higher value if you get rate-limiting errors

symbol = None
since = None
limit = 50
all_trades = []

i = 0
while True:
    offset = 0
    params = {'ofs': offset}
    trades = exchange.fetch_my_trades(symbol, since, limit, params)
    print('-----------------------------------------------------------------')
    print(exchange.iso8601(exchange.milliseconds()), 'Fetched', len(trades), 'trades')
    if len(trades) < 1:
        break
    else:
        first = exchange.safe_value(trades, 0)
        last = exchange.safe_value(trades, len(trades) - 1)
        print('From:', first['datetime'])
        print('To:', last['datetime'])
        all_trades = trades + all_trades
        offset += len(trades)
    print(len(all_trades), 'trades fetched in total')

print('-----------------------------------------------------------------')
print(len(all_trades), 'trades fetched')
first = exchange.safe_value(all_trades, 0)
last = exchange.safe_value(all_trades, len(all_trades) - 1)
print('First:', first['datetime'])
print('Last:', last['datetime'])