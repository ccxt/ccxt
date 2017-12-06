# -*- coding: utf-8 -*-

import os
import sys
import time
import json

# ------------------------------------------------------------------------------

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

# ------------------------------------------------------------------------------

from python import ccxt  # noqa: E402

# import ccxt.async as ccxt

# ------------------------------------------------------------------------------

fileName = 'key.json'
path = os.path.abspath(os.path.dirname(__file__))
fileName = os.path.join(path, fileName)
# 解析json文件
with open(fileName) as data_file:
    setting = json.load(data_file)
    data_file.close()
apikey = str(setting['apiKey'])
secretkey = str(setting['secretKey'])
okcoinRESTURL = 'www.okex.com'
exchange = ccxt.okex({
    'apiKey': apikey,
    'secret': secretkey,
})
exchange.load_markets()

for symbol in exchange.markets:
    market = exchange.markets[symbol]
    if market['future'] and symbol == 'ETC/USD':
        print('----------------------------------------------------')
        print(symbol, exchange.fetchTicker(symbol))
        balance = exchange.fetch_balance()
        # exchange.create_order()
        time.sleep(exchange.rateLimit / 1000)
