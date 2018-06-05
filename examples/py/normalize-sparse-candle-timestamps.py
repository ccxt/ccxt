# -*- coding: utf-8 -*-

import os
import sys
import datetime
from pprint import pprint

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402

exchange = ccxt.cryptopia({ 'enableRateLimit': True })

symbol = 'ETH/BTC'
timeframe = '1h'

candles = exchange.fetch_ohlcv(symbol, timeframe)

# timeframe duration in seconds
duration = exchange.parse_timeframe (timeframe)

# timeframe duration in milliseconds
duration *= 1000

pprint([[
    exchange.iso8601 (int(round(candle[0] / duration)) * duration),
    candle[1],
    candle[2],
    candle[3],
    candle[4],
    candle[5]
] for candle in candles])
