# -*- coding: utf-8 -*-

import os
import sys
import time

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402

bitmex = ccxt.bitmex()

# params:
symbol = 'BTC/USD'
timeframe = '1m'
limit = 100
params = {'partial': False}  # ←--------  no reversal

while True:

    # pay attention to since with respect to limit if you're doing it in a loop
    since = bitmex.milliseconds() - limit * 60 * 1000

    candles = bitmex.fetch_ohlcv(symbol, timeframe, since, limit, params)
    num_candles = len(candles)
    print('{}: O: {} H: {} L:{} C:{}'.format(
        bitmex.iso8601(candles[num_candles - 1][0]),
        candles[num_candles - 1][1],
        candles[num_candles - 1][2],
        candles[num_candles - 1][3],
        candles[num_candles - 1][4]))
    # * 5 to make distinct delay and to avoid too much load
    # / 1000 to convert milliseconds to fractional seconds
    time.sleep(bitmex.rateLimit * 5 / 1000)
