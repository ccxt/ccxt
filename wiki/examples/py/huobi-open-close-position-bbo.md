- [Huobi Open Close Position Bbo](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import asyncio
import os
from random import randint
import sys
from pprint import pprint


import ccxt.async_support as ccxt  # noqa: E402


print('CCXT Version:', ccxt.__version__)

exchange = ccxt.huobi({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET_KEY',
})

# Example 1 :: Swap : fetch balance, open a position and close it using BBO price
async def example_1():
    markets = await exchange.load_markets(True)

    # fetch swap balance
    balance = await exchange.fetch_balance()
    print(balance)

    # create market order and open position
    symbol = 'ADA/USDT:USDT'
    # type = 'opponent' means it will use BB0 (the best bid or offer on the Exchange) as the price, huobi does not support "market"
    # other types available are: opponent_fok, optimal_5, optimal_10, optimal_20, etc, etc
    # you can check all the types available in the docs: https://huobiapi.github.io/docs/usdt_swap/v1/en/#cross-place-an-order
    type = 'opponent' 
    side = 'buy'
    amount = 1
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
        'reduceOnly': True
    }
    close_position_order = await exchange.createOrder(symbol, type, side, amount, price, params)
    print(close_position_order)
async def main():
    try:
        await example_1()
    except Exception as e:
        print(e)
    await exchange.close()
    

asyncio.run(main())


 
```