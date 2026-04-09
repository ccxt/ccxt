# -*- coding: utf-8 -*-

import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import pandas_ta as ta
import pandas as pd
import ccxt

# -----------------------------------------------------------------------------

print('CCXT Version:', ccxt.__version__)

# -----------------------------------------------------------------------------


exchange = ccxt.binance()
symbol = 'BTC/USDT'
timeframe = '1m'
limit = 500
rsi_length = 100
while True:
    try:
        ohlcv = exchange.fetch_ohlcv(symbol, timeframe)
        print('--------------------------------------------------------------')
        if len(ohlcv):
            df = pd.DataFrame(ohlcv, columns=['time', 'open', 'high', 'low', 'close', 'volume'])
            df['time'] = pd.to_datetime(df['time'], unit='ms')
            df = pd.concat([df, df.ta.rsi(length=rsi_length)], axis=1)
            print(df[-20:])
            print(exchange.iso8601 (exchange.milliseconds()))
    except Exception as e:
        print(type(e).__name__, str(e))


