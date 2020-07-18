# -*- coding: utf-8 -*-

import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402

exchange = ccxt.poloniex({'enableRateLimit': True})
exchange.load_markets()

symbol = 'BTC/USDT'
timeframe = '5m'
since = exchange.parse8601('2019-01-01T00:00:00Z')
previous_length = 0
all_candles = []
limit = 1000
duration = exchange.parse_timeframe(timeframe) * 1000
now = exchange.milliseconds()

while since < now:
    try:
        print('---------------------------------------------------------------')
        print('Fetching ohlcvs since', exchange.iso8601(since))
        candles = exchange.fetch_ohlcv(symbol, timeframe, since, limit)
        print('Fetched', len(candles), 'candles')
        print('From', exchange.iso8601(candles[0][0]), 'to', exchange.iso8601(candles[-1][0]))
        since = candles[-1][0] + duration
        all_candles += candles
        total_length = len(all_candles)
        print('Fetched', total_length, 'candles in total')
    except ccxt.NetworkError as e:
        print(e)  # retry on next iteration
    except ccxt.ExchangeError as e:
        print(e)
        break

print('Fetched', len(all_candles), 'candles since', exchange.iso8601(all_candles[0][0]), 'till', exchange.iso8601(all_candles[-1][0]))
