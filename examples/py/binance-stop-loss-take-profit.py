# -*- coding: utf-8 -*-

import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402

exchange = ccxt.binanceusdm({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
})

markets = exchange.load_markets()
# exchange.verbose = True  # uncomment for debugging purposes

symbol = 'BTC/USDT'
side = 'buy'
amount = 0.01
price = None
stopLossPrice = 25000
takeProfitPrice = 35000

try:

    order = exchange.create_order(symbol, 'MARKET', side, amount)
    print(order)

    inverted_side = 'sell' if side == 'buy' else 'buy'

    stopLossParams = {'stopPrice': stopLossPrice}
    stopLossOrder = exchange.create_order(symbol, 'STOP_MARKET', inverted_side, amount, price, stopLossParams)
    print(stopLossOrder)

    takeProfitParams = {'stopPrice': takeProfitPrice}
    takeProfitOrder = exchange.create_order(symbol, 'TAKE_PROFIT_MARKET', inverted_side, amount, price, takeProfitParams)
    print(takeProfitOrder)

except Exception as e:
    print(type(e).__name__, str(e))
