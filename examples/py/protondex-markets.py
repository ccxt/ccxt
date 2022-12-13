# -*- coding: utf-8 -*-

import os
import sys
from pprint import pprint

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402

exchange = ccxt.protondex({
    # 'verbose': True,  # uncomment for verbose output
})

# markets = exchange.load_markets()
# pprint(markets)
# print('\n', exchange.name, 'supports', len(markets), 'pairs')

# working - publicGetTradesDaily
# trades = exchange.fetch_trades()
# pprint(trades)

# working - publicGetTradesRecent
trades = exchange.fetch_recent_trades('XPR_XUSDC', 0, 100)
pprint(trades)

# working - publicGetOrdersHistory
# trades = exchange.fetch_orders_history('XPR_XUSDC', 'pbtest1', 0, 100)
# pprint(trades)

# working - publicGetMarketsAll
# trades = exchange.fetch_markets()
# pprint(trades)

# Working - fetch_order_book
# trades = exchange.fetch_order_book('XPR_XUSDC', 10, 100)
# pprint(trades)

# Working - publicGetOrdersOpen
# trades = exchange.fetch_open_orders('XPR_XUSDC', 'pbtest1', 0, 100)
# pprint(trades)

# Working: publicGetStatusSync
# trades = exchange.fetch_status_sync()
# pprint(trades)

# Working - publicGetChartOhlcv
# trades = exchange.fetch_ohlcv(60, 'XPR_XUSDC', '2022-10-12T17:20:13Z', '2022-11-12T17:20:13Z', 100)
# pprint(trades)
