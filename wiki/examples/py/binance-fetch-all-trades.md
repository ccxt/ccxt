- [Binance Fetch All Trades](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import os
import sys
import csv


import ccxt  # noqa: E402

exchange = ccxt.binance()

markets = exchange.load_markets()
symbol = 'ETH/BTC'
market = exchange.market(symbol)
one_hour = 3600 * 1000
since = exchange.parse8601('2018-12-12T00:00:00')
now = exchange.milliseconds()
end = exchange.parse8601(exchange.ymd(now) + 'T00:00:00')
previous_trade_id = None
filename = exchange.id + '_' + market['id'] + '.csv'
with open(filename, mode="w") as csv_f:
    csv_writer = csv.DictWriter(csv_f, delimiter=",", fieldnames=["timestamp", "size", "price", "side"])
    csv_writer.writeheader()
    while since < end:
        try:
            trades = exchange.fetch_trades(symbol, since)
            print(exchange.iso8601(since), len(trades), 'trades')
            if len(trades):
                last_trade = trades[-1]
                if previous_trade_id != last_trade['id']:
                    since = last_trade['timestamp']
                    previous_trade_id = last_trade['id']
                    for trade in trades:
                        csv_writer.writerow({
                            'timestamp': trade['timestamp'],
                            'size': trade['amount'],
                            'price': trade['price'],
                            'side': trade['side'],
                        })
                else:
                    since += one_hour
            else:
                since += one_hour
        except ccxt.NetworkError as e:
            print(type(e).__name__, str(e))
            exchange.sleep(60000)
 
```