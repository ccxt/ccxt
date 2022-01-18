# -*- coding: utf-8 -*-

import os
from random import randint
import sys
from pprint import pprint

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402


print('CCXT Version:', ccxt.__version__)

exchange = ccxt.huobi({
    'apiKey': 'ez2xc4vb6n-da8c4c7d-76cbde5b-7cc77',
    'secret': '03454cfd-cf15e71b-fe87eadf-16a79',
    'options': {
        'defaultType': 'future',
    },
})

markets = exchange.load_markets()


# exchange.verbose = True  # uncomment for debugging purposes if necessary


## Create a inverse future order that will 
symbol = 'ADA/USD:ADA-220121'
order_type = 'limit'
side = 'buy'
offset = 'open'
# contract_type = 'this_week'
cli_order_id = randint(0,1000)
leverage = 1 
amount = 1
price = 1

params = {'offset': offset, 'lever_rate': leverage, 'client_order_id': cli_order_id}

try:
    order = exchange.create_order(symbol, order_type, side, amount, price, params)
    print(order)
except Exception as e:
    print(type(e).__name__, str(e))
