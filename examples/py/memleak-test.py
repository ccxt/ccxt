# -*- coding: utf-8 -*-

import os
import sys
import psutil


# -----------------------------------------------------------------------------

this_folder = os.path.dirname(os.path.abspath(__file__))
root_folder = os.path.dirname(os.path.dirname(this_folder))
sys.path.append(root_folder + '/python')
sys.path.append(this_folder)

# -----------------------------------------------------------------------------

import ccxt  # noqa: E402

# -----------------------------------------------------------------------------

exchange = ccxt.poloniex()

while True:
    orderbook = exchange.fetch_order_book('ETH/BTC')
    process = psutil.Process(os.getpid())
    print(exchange.iso8601(exchange.milliseconds()), process.memory_info().rss)
