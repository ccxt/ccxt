# -*- coding: utf-8 -*-

import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402

print('CCXT Version:', ccxt.__version__)

exchange = ccxt.ftx()


markets = exchange.load_markets ()

# exchange.verbose = True  # uncomment for debugging

all_results = []
symbol = 'BTC/USD:USD'
since = exchange.parse8601 ('2022-01-01T00:00:00.000Z')
limit = None
end_time = exchange.milliseconds()

while True:
    print('------------------------------------------------------------------')
    params = {
        'end_time': int(end_time / 1000),
    }
    results = exchange.fetch_funding_rate_history(symbol, since, limit, params)
    if len(results):
        first = results[0]
        last = results[len(results) - 1]
        end_time = first['timestamp'] - 1
        print('Fetched', len(results), 'funding rates from', first['datetime'], 'till', last['datetime'])
        all_results = results + all_results
        if end_time < since:
            print('Done')
            break
    else:
        print('Done')
        break


all_results = exchange.sort_by(all_results, 'timestamp')

print('Fetched', len(all_results), 'funding rates')
for i in range(0, len(all_results)):
    result = all_results[i]
    print(i + 1, result['symbol'], result['datetime'], result['fundingRate'])
