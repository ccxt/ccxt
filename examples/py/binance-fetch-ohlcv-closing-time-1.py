# -*- coding: utf-8 -*-

import os
import sys

# -----------------------------------------------------------------------------

this_folder = os.path.dirname(os.path.abspath(__file__))
root_folder = os.path.dirname(os.path.dirname(this_folder))
sys.path.append(root_folder + '/python')
sys.path.append(this_folder)

# -----------------------------------------------------------------------------

import ccxt  # noqa: E402


exchange = ccxt.binance()
symbol = 'BTC/USDT'
timeframe = '1h'

timeframe_duration_in_seconds = exchange.parse_timeframe(timeframe)
timeframe_duration_in_milliseconds = timeframe_duration_in_seconds * 1000
ohlcvs = exchange.fetch_ohlcv(symbol, timeframe)
for ohlcv in ohlcvs:
    print([exchange.iso8601(ohlcv[0] + timeframe_duration_in_milliseconds - 1)] + ohlcv[1:])
