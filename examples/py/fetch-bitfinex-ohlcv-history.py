# -*- coding: utf-8 -*-

import os
import sys
import time

# -----------------------------------------------------------------------------

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

# -----------------------------------------------------------------------------

import ccxt  # noqa: E402

# -----------------------------------------------------------------------------
# common constants

msec = 1000
minute = 60 * msec
hold = 30

# -----------------------------------------------------------------------------

exchange = ccxt.bitfinex()

# -----------------------------------------------------------------------------

from_datetime = '2017-01-01 00:00:00'
from_timestamp = exchange.parse8601(from_datetime)

# -----------------------------------------------------------------------------

now = exchange.milliseconds()

# -----------------------------------------------------------------------------

data = []

while from_timestamp < now:

    try:

        print(exchange.milliseconds(), 'Fetching candles starting from', exchange.iso8601(from_timestamp))
        ohlcvs = exchange.fetch_ohlcv('BTC/USD', '5m', from_timestamp)
        print(exchange.milliseconds(), 'Fetched', len(ohlcvs), 'candles')
        if len(ohlcvs) > 0:
            first = ohlcvs[0][0]
            last = ohlcvs[-1][0]
            print('First candle epoch', first, exchange.iso8601(first))
            print('Last candle epoch', last, exchange.iso8601(last))
            # from_timestamp += len(ohlcvs) * minute * 5  # very bad
            from_timestamp = ohlcvs[-1][0] + minute * 5  # good
            data += ohlcvs

    except (ccxt.ExchangeError, ccxt.AuthenticationError, ccxt.ExchangeNotAvailable, ccxt.RequestTimeout) as error:

        print('Got an error', type(error).__name__, error.args, ', retrying in', hold, 'seconds...')
        time.sleep(hold)
