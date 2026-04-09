- [Coinex Futures](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import asyncio
import os
from random import randint
import sys
from pprint import pprint


import ccxt.async_support as ccxt  # noqa: E402


print('CCXT Version:', ccxt.__version__)

exchange = ccxt.coinex({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET_KEY',
})

# Example 1 :: Swap : fetch balance, create a limit swap order with leverage
async def example_1():
    exchange.options['defaultType'] = 'swap'
    exchange.options['defaultMarginMode'] = 'cross' # or isolated
    markets = await exchange.load_markets()

    # fetch swap balance
    balance = await exchange.fetch_balance()
    print(balance)
    
    # set the desired leverage (has to be made before placing the order and for a specific symbol)
    leverage = 8
    symbol = 'ADA/USDT:USDT'
    leverage_response = await exchange.set_leverage(leverage, symbol)

    # create limit order
    symbol = 'ADA/USDT:USDT'
    type = 'limit'
    side = 'buy'
    amount = 50
    price = 0.3
    create_order = await exchange.create_order(symbol, type, side, amount, price)
    print('Create order id:', create_order['id'])
# Example 2 :: Swap :: open a position and close it
async def example_2():
    exchange.options['defaultType'] = 'swap'; # very important set swap as default type
    exchange.options['defaultMarginMode'] = 'cross' # or isolated
    markets = await exchange.load_markets()


    # set the desired leverage (has to be made before placing the order and for a specific symbol)
    leverage = 3
    symbol = 'ADA/USDT:USDT'
    leverage_response = await exchange.set_leverage(leverage, symbol)

    # create market order and open position
    symbol = 'ADA/USDT:USDT'
    type = 'market'
    side = 'buy'
    amount = 55
    price = None
    create_order = await exchange.create_order(symbol, type, side, amount, price)
    print('Create order id:', create_order['id'])

    # check opened position
    position = await exchange.fetch_position(symbol)
    print(position)

    # Close position by issuing a market order in the opposite direction
    side = 'sell'
    params = {
        'reduce_only': True
    }
    close_position_order = await exchange.createOrder(symbol, type, side, amount, price, params)
    print(close_position_order)
async def main():
    await example_1()
    await example_2()

asyncio.run(main())


 
```