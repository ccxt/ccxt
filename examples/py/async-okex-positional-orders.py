# -*- coding: utf-8 -*-

from asyncio import get_event_loop
from pprint import pprint
import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt.async_support as ccxt  # noqa: E402
# or
# import ccxtpro as ccxt


async def main(exchange):
    try:
        markets = await exchange.load_markets()
        exchange.verbose = True  # uncomment for debugging
        print('---------------------------------------------------------------')
        print('Futures balance:')
        futures_balance = await exchange.fetch_balance()
        pprint(futures_balance)
        print('---------------------------------------------------------------')
        print('Futures symbols:')
        print([market['symbol'] for market in markets.values() if market['futures']])
        print('---------------------------------------------------------------')
        symbol = 'BTC-USDT-201225'  # a futures symbol
        market = exchange.market(symbol)
        pprint(market)
        print('---------------------------------------------------------------')
        type = '1'  # 1:open long 2:open short 3:close long 4:close short for futures
        side = None  # irrelevant for futures
        amount = 1  # how many contracts you want to buy or sell
        price = 17000  # limit price
        params = {
            # 'order_type': '4',  # uncomment for a market order, makes limit price irrelevant
            # 'leverage': '10',  # or '20'
        }
        order = await exchange.create_order(symbol, type, side, amount, price, params)
        print('Order:')
        pprint(order)
        print('---------------------------------------------------------------')
    except Exception as e:
        print(type(e).__name__, str(e))
    await exchange.close()


print('CCXT Version:', ccxt.__version__)

loop = get_event_loop()
exchange = ccxt.okex({
    'asyncio_loop': loop,
    'enableRateLimit': True,  # https://github.com/ccxt/ccxt/wiki/Manual#rate-limit
    'apiKey': 'YOUR_API_KEY',  # https://github.com/ccxt/ccxt/wiki/Manual#authentication
    'secret': 'YOUR_API_SECRET',
    'password': 'YOUR_API_PASSWORD',
    'options': {
        'defaultType': 'futures',
    },
})
loop.run_until_complete(main(exchange))
