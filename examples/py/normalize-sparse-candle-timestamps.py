# -*- coding: utf-8 -*-

import os
import sys
from pprint import pprint

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402

exchange = ccxt.binance({'enableRateLimit': True})

symbol = 'ETH/BTC'
timeframe = '1h'

candles = exchange.fetch_ohlcv(symbol, timeframe)

# timeframe duration in seconds
duration = exchange.parse_timeframe(timeframe)

# timeframe duration in milliseconds
duration *= 1000

pprint([[
    exchange.iso8601(int(round(candle[0] / duration)) * duration),
    candle[1],  # o
    candle[2],  # h
    candle[3],  # l
    candle[4],  # c
    candle[5]   # v
] for candle in candles])
