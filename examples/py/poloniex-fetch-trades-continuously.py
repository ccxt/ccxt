# -*- coding: utf-8 -*-

import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402


exchange = ccxt.poloniex()

symbol = 'BTC/USDT'

end_time = exchange.milliseconds() + 30 * 60 * 1000

all_trades = {}

while end_time > exchange.milliseconds():
    try:
        print('---------------------------------------------------------------')
        trades = exchange.fetch_trades(symbol)
        trades_by_id = exchange.index_by(trades, 'id')
        all_trades = exchange.extend(all_trades, trades_by_id)
        total_length = len(all_trades.keys())
        time_remaining = int((end_time - exchange.milliseconds()) / 1000)
        print(time_remaining, 'seconds left, fetched', total_length, symbol, 'trades in total')
    except ccxt.NetworkError as e:
        print(e)  # retry on next iteration
    except ccxt.ExchangeError as e:
        print(e)
        break

all_trades = exchange.sort_by(all_trades.values(), 'id')
print('Fetched', len(all_trades), 'trades since', all_trades[0]['datetime'], 'till', all_trades[-1]['datetime'])
