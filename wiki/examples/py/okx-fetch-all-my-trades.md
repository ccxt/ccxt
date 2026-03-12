- [Okx Fetch All My Trades](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import os
import sys


import ccxt  # noqa: E402


# make sure your version is the latest
print('CCXT Version:', ccxt.__version__)

exchange = ccxt.okx({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_API_SECRET',
    'password': 'YOUR_API_PASSWORD',
})


markets = exchange.load_markets ()

exchange.verbose = True  # uncomment for debugging

all_trades = {}
symbol = None
since = None
limit = 200
after = None

while True:
    print('------------------------------------------------------------------')
    params = {}
    if after:
        params['after'] = after
    trades = exchange.fetch_my_trades(symbol, since, limit, params)
    if len(trades):
        first_trade = trades[0]
        last_trade = trades[len(trades) - 1]
        after = first_trade['info']['billId']
        print('Fetched', len(trades), 'trades from', first_trade['datetime'], 'till', last_trade['datetime'])
        fetched_new_trades = False
        for trade in trades:
            trade_id = trade['id']
            if trade_id not in all_trades:
                fetched_new_trades = True
                all_trades[trade_id] = trade
        if not fetched_new_trades:
            print('Done')
            break
    else:
        print('Done')
        break


all_trades = list(all_trades.values())
all_trades = exchange.sort_by(all_trades, 'timestamp')

print('Fetched', len(all_trades), 'trades')
for i in range(0, len(all_trades)):
    trade = all_trades[i]
    print(i, trade['id'], trade['datetime'], trade['amount'])
 
```