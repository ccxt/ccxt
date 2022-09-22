# -*- coding: utf-8 -*-

import os
import sys
import ccxt  # noqa: E402
import numpy as np
from datetime import datetime

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

print('CCXT Version:', ccxt.__version__)

# data
exchange_name = 'ftx'
symbol = "BTC/USD"
max_candles = 5000
timeframe = '1h'
start = 1609459200000  # Jan 1, 2021
ms_per_candle = {
    '1m': 60000,
    '5m': 300000,
    '15m': 900000,
    '30m': 1800000,
    '1h': 3600000,
    '2h': 7200000,
    '4h': 14400000,
    '8h': 28800000,
    '12h': 57600000,
    '1d': 86400000,
}

now = int(datetime.now().timestamp() * 1000)
outfile = f"{symbol.replace('/', '-')}_{timeframe}_{exchange_name}_{start}-{now}.csv"

# setup
exchange = ccxt.ftx()
exchange.load_markets()
ohlcv = []

# make requests for candle data
while start < now:
    candles = exchange.fetch_ohlcv(symbol, timeframe, start, max_candles)
    ohlcv += candles
    start = start + (ms_per_candle[timeframe] * max_candles)

# write to csv
np.savetxt(
    outfile,
    ohlcv,
    delimiter=",",
    fmt='%d,%s,%s,%s,%s,%s'
)
