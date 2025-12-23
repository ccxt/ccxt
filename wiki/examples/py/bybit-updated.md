- [Bybit Updated](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import asyncio
import os
from random import randint
import sys
from pprint import pprint


import ccxt.async_support as ccxt  # noqa: E402


print('CCXT Version:', ccxt.__version__)

exchange = ccxt.bybit({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET_KEY',
})


# Example 1: Spot : fetch balance, create order, cancel it and check canceled orders
async def example_1():
    exchange.options['defaultType'] = 'spot'; # very important set spot as default type
    markets = await exchange.load_markets(True)

    # fetch spot balance
    balance = await exchange.fetch_balance()
    print(balance)

    # create limit order
    symbol = 'LTC/USDT'
    type = 'limit'
    side = 'buy'
    amount = 0.1
    price = 50
    create_order = await exchange.create_order(symbol, type, side, amount, price)
    print('Create order id:', create_order['id'])

    # cancel created order
    canceled_order = await exchange.cancel_order(create_order['id'], symbol)
    print(canceled_order)

    # Check canceled orders (bybit does not have a single endpoint to check orders
    # we have to choose whether to check open or closed orders and call fetch_open_orders
    # or fetch_closed_orders respectively
    orders = await exchange.fetch_closed_orders(symbol)
    print(orders)
    await exchange.close()
# Example 2 :: Swap : fetch balance, open a position and close it
async def example_2():
    exchange.options['defaultType'] = 'swap'; # very important set swap as default type
    markets = await exchange.load_markets(True)

    # fetch swap balance
    balance = await exchange.fetch_balance()
    print(balance)

    # create market order and open position
    symbol = 'LTC/USDT:USDT'
    type = 'market'
    side = 'buy'
    amount = 0.1
    price = None
    create_order = await exchange.create_order(symbol, type, side, amount, price)
    print('Create order id:', create_order['id'])

    # check opened position
    symbols = [ symbol ]
    positions = await exchange.fetch_positions(symbols)
    print(positions)

    # Close position by issuing a order in the opposite direction
    side = 'sell'
    params = {
        'reduce_only': True
    }
    close_position_order = await exchange.createOrder(symbol, type, side, amount, price, params)
    print(close_position_order)
# Example 3 :: USDC Swap : fetch balance, open a position and close it
async def example_3():
    exchange.options['defaultType'] = 'swap'; # very important set swap as default type
    markets = await exchange.load_markets(True)

    # fetch USDC swap balance
    # when no symbol is available we can show our intent
    # of using USDC endpoints by either using defaultSettle in options or
    # settle in params
    # Using Options: exchange.options['defaultSettle'] = 'USDC';
    # Using params:
    balanceParams = {
        'settle': 'USDC'
    }
    balance = await exchange.fetch_balance(balanceParams)
    print(balance)

    # create order and open position
    # taking into consideration that USDC markets do not support
    # market orders
    symbol = 'BTC/USD:USDC'
    type = 'limit'
    side = 'buy'
    amount = 0.1
    price = 15000 # adjust this accordingly
    create_order = await exchange.create_order(symbol, type, side, amount, price)
    print('Create order id:', create_order['id'])

    # check if the order was filled and the position opened
    symbols = [ symbol ]
    positions = await exchange.fetch_positions(symbols)
    print(positions)

    # Close position (assuming it was already opened) by issuing an order in the opposite direction
    side = 'sell'
    params = {
        'reduce_only': True
    }
    close_position_order = await exchange.createOrder(symbol, type, side, amount, price, params)
    print(close_position_order)
# Example 4 :: Future : fetch balance, create stop-order and check open stop-orders
async def example_4():
    exchange.options['defaultType'] = 'future'; # very important set future as default type
    markets = await exchange.load_markets(True)

    # fetch future balance
    balance = await exchange.fetch_balance()
    print(balance)

    # create stop-order
    symbol = 'ETH/USD:ETH-220930'
    amount = 10  # in USD for inverse futures
    price = 1200
    side = 'buy'
    type = 'limit'
    stop_order_params = {
        'position_idx': 0, # 0 One-Way Mode, 1 Buy-side, 2 Sell-side, default = 0
        'stopPrice': 1000, # mandatory for stop orders
        'basePrice': 1100  # mandatory for stop orders
    }
    stop_order = await exchange.create_order(symbol, type, side, amount, price, stop_order_params)
    print('Create order id:', stop_order['id'])

    # check opened stop-order
    open_order_params = {
        'stop': True
    }
    openOrders = await exchange.fetch_open_orders(symbol, None, None, open_order_params)
    print(openOrders)

    # cancell all open stop-orders
    cancelOrder = await exchange.cancel_all_orders(symbol, open_order_params)
    print(cancelOrder)
async def main():
    try:
        await example_1()
        await example_2()
        await example_3()
        await example_4()
    except Exception as e:
        print(e)
    await exchange.close()
    
    


asyncio.run(main())


 
```