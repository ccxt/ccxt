# -*- coding: utf-8 -*-

import os
import sys
import time

# -----------------------------------------------------------------------------

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root)

# -----------------------------------------------------------------------------

import ccxt  # noqa: E402

# -----------------------------------------------------------------------------
# common constants

msec = 1000
minute = 60 * msec
hold = 30

# -----------------------------------------------------------------------------

kraken = ccxt.kraken({'rateLimit': 500})

# -----------------------------------------------------------------------------

from_datetime = '2017-09-01 00:00:00'
from_timestamp = kraken.parse8601(from_datetime)

# -----------------------------------------------------------------------------

now = kraken.milliseconds()

# -----------------------------------------------------------------------------

data = []

while from_timestamp < now:

    print('Fetching candles starting from', kraken.iso8601(from_timestamp))

    try:

        ohlcvs = kraken.fetch_ohlcv('BTC/USD', '1m', from_timestamp)

        # don't hit the rateLimit or you will be banned
        time.sleep(kraken.rateLimit / msec)

        # Kraken returns 720 candles for 1m timeframe at once
        from_timestamp += len(ohlcvs) * minute

        data += ohlcvs

    except (ccxt.ExchangeError, ccxt.AuthenticationError, ccxt.ExchangeNotAvailable, ccxt.RequestTimeout) as error:

        print('Got an error', type(error).__name__, error.args, ', sleeping for', hold, 'seconds...')
        time.sleep(hold)
