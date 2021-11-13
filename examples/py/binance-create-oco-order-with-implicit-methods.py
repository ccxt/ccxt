# -*- coding: utf-8 -*-

import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402


exchange = ccxt.binance({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
    'enableRateLimit': True,
    # 'options': {'adjustForTimeDifference': True}
})

symbol = 'SCRT/BTC'
market = exchange.market(symbol)
amount = 26
price = 0.00002
stop_price = 0.000016
stop_limit_price = 0.000015

response = exchange.private_post_order_oco({
    'symbol': market['id'],
    'side': 'SELL',  # SELL, BUY
    'quantity': exchange.amount_to_precision(symbol, amount),
    'price': exchange.price_to_precision(symbol, price),
    'stopPrice': exchange.price_to_precision(symbol, stop_price),
    'stopLimitPrice': exchange.price_to_precision(symbol, stop_limit_price),  # If provided, stopLimitTimeInForce is required
    'stopLimitTimeInForce': 'GTC',  # GTC, FOK, IOC
    # 'listClientOrderId': exchange.uuid(),  # A unique Id for the entire orderList
    # 'limitClientOrderId': exchange.uuid(),  # A unique Id for the limit order
    # 'limitIcebergQty': exchangea.amount_to_precision(symbol, limit_iceberg_quantity),
    # 'stopClientOrderId': exchange.uuid()  # A unique Id for the stop loss/stop loss limit leg
    # 'stopIcebergQty': exchange.amount_to_precision(symbol, stop_iceberg_quantity),
    # 'newOrderRespType': 'ACK',  # ACK, RESULT, FULL
})
print(response)