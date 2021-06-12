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
})


markets = exchange.load_markets ()

# exchange.verbose = True  # uncomment for debugging

all_trades = []
symbol = None
since = None
limit = 200
end_time = exchange.milliseconds()

while True:
    print('------------------------------------------------------------------')
    params = {
        'end_time': int(end_time / 1000),
    }
    trades = exchange.fetch_my_trades(symbol, since, limit, params)
    if len(trades):
        first_trade = trades[0]
        last_trade = trades[len(trades) - 1]
        end_time = first_trade['timestamp']
        all_trades = trades + all_trades
        print('Fetched', len(trades), 'trades from', first_trade['datetime'], 'till', last_trade['datetime'])
    else:
        print('Done')
        break


print('Fetched', len(all_trades), 'trades')
for i in range(0, len(all_trades)):
    trade = all_trades[i]
    print(i, trade['id'], trade['datetime'], trade['amount'])
