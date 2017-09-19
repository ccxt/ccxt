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

# -----------------------------------------------------------------------------

kraken = ccxt.kraken()

# -----------------------------------------------------------------------------

from_date = '2017-09-01 00:00:00'
from_timestamp = kraken.parse8601(from_date)

# -----------------------------------------------------------------------------

now = kraken.milliseconds()

# -----------------------------------------------------------------------------

while from_timestamp < now:

    print('Fetching candles starting from', kraken.iso8601 (from_timestamp))
    ohlcvs = kraken.fetch_ohlcv('BTC/USD', '1m', from_timestamp)
    time.sleep (kraken.rateLimit / 1000)
    from_timestamp += len(ohlcvs) * minute # kraken returns 720 candles at once

