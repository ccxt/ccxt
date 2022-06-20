# -*- coding: utf-8 -*-

import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402


# make sure your version is 1.51+
print('CCXT Version:', ccxt.__version__)

exchange = ccxt.ftx({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
    # "headers": {
    #     "FTX-SUBACCOUNT": "YOUR_SUBACCOUNT"
    # }
})


markets = exchange.load_markets ()

# exchange.verbose = True  # uncomment for debugging

all_results = {}
symbol = None
since = None
limit = 200
end_time = exchange.milliseconds()

while True:
    print('------------------------------------------------------------------')
    params = {
        'end_time': int(end_time / 1000),
    }
    results = exchange.fetch_my_trades(symbol, since, limit, params)
    if len(results):
        first = results[0]
        last = results[len(results) - 1]
        end_time = first['timestamp']
        print('Fetched', len(results), 'trades from', first['datetime'], 'till', last['datetime'])
        fetched_new_results = False
        for result in results:
            if result['id'] not in all_results:
                fetched_new_results = True
                all_results[result['id']] = result
        if not fetched_new_results:
            print('Done')
            break
    else:
        print('Done')
        break


all_results = list(all_results.values())
all_results = exchange.sort_by(all_results, 'timestamp')

print('Fetched', len(all_results), 'trades')
for i in range(0, len(all_results)):
    result = all_results[i]
    print(i, result['id'], result['symbol'], result['datetime'], result['amount'])
