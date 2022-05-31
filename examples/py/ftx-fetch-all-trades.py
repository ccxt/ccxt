# -*- coding: utf-8 -*-

import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402


# make sure your version is 1.51+
print('CCXT Version:', ccxt.__version__)


exchange = ccxt.ftx()

markets = exchange.load_markets ()

# exchange.verbose = True  # uncomment for debugging

all_trades = {}
symbol = 'BTC/USD'
since = None
limit = 200
end_time = exchange.milliseconds()
start_time = end_time - 1 * 60 * 60 * 1000  # 1 hour of history for example

while end_time > start_time:
    print('------------------------------------------------------------------')
    params = {
        'end_time': int(end_time / 1000),
    }
    trades = exchange.fetch_trades(symbol, since, limit, params)
    if len(trades):
        first_trade = trades[0]
        last_trade = trades[len(trades) - 1]
        end_time = first_trade['timestamp']
        print('Fetched', len(trades), 'trades from', first_trade['datetime'], 'till', last_trade['datetime'])
        fetched_new_trades = False
        for trade in trades:
            trade_id = trade['id']
            if trade_id not in all_trades:
                fetched_new_trades = True
                all_trades[trade_id] = trade
        print(len(list(all_trades.keys())), 'trades in total')
        if not fetched_new_trades:
            print('Done')
            break
    else:
        print('Done')
        break


all_trades = list(all_trades.values())
all_trades = exchange.sort_by(all_trades, 'timestamp')
all_trades = exchange.filter_by_since_limit(all_trades, start_time)

print('Fetched', len(all_trades), 'trades')
for i in range(0, len(all_trades)):
    trade = all_trades[i]
    print(i, trade['id'], trade['datetime'], trade['amount'])
