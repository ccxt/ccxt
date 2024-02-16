- [Binance Spot Trailing](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import asyncio
import os
from random import randint
import sys
from pprint import pprint


import ccxt.async_support as ccxt  # noqa: E402


print('CCXT Version:', ccxt.__version__)

exchange = ccxt.binance({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET_KEY',
})

exchange = ccxt.binance({
    'apiKey': os.environ['BINANCE_APIKEY'],
    'secret': os.environ['BINANCE_SECRET'],
})

# You can read more about spot trailing orders here:
# https://github.com/binance/binance-spot-api-docs/blob/master/faqs/trailing-stop-faq.md

# Example 1: Spot : trailing spot loss
async def example_1():
    markets = await exchange.load_markets(True)

    # create STOP_LOSS_LIMIT BUY with a trailing stop of 5%.
    symbol = 'LTC/USDT'
    type = 'STOP_LOSS_LIMIT'
    side = 'buy'
    amount = 0.4
    price = 25
    params = {
        'trailingDelta':  500, # 5% in BIPS
    }
    exchange.verbose = True
    create_order = await exchange.create_order(symbol, type, side, amount, price, params)
    print('Create order id:', create_order['id'])

    # cancel created order
    canceled_order = await exchange.cancel_order(create_order['id'], symbol)
    print(canceled_order)

    await exchange.close()
# Example 2: Spot : TAKE_PROFIT_LIMIT BUY order
async def example_2():
    markets = await exchange.load_markets(True)

    # create TAKE_PROFIT_LIMIT BUY with a trailing stop of 5%.
    symbol = 'LTC/USDT'
    type = 'TAKE_PROFIT_LIMIT'
    side = 'buy'
    amount = 0.2
    price = 70
    params = {
        'trailingDelta':  250 # 2.5% in BIPS
    }
    exchange.verbose = True
    create_order = await exchange.create_order(symbol, type, side, amount, price, params)
    print('Create order id:', create_order['id'])

    # cancel created order
    canceled_order = await exchange.cancel_order(create_order['id'], symbol)
    print(canceled_order)

    await exchange.close()
async def main():
    try:
        # await example_1()
        await example_2()
    except Exception as e:
        print(e)
    await exchange.close()
    
    


asyncio.run(main())
 
```