- [Bybit Trailling](./examples/py/)


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

# exchange.set_sandbox_mode(True)  # enable sandbox mode
# Example 1 :: Swap : open position and set trailing stop and close it 
async def example_2():
    exchange.options['defaultType'] = 'swap'; # very important set swap as default type
    markets = await exchange.load_markets()

    symbol = 'LTC/USDT:USDT'
    market = exchange.market(symbol) 

    # fetch swap balance
    balance = await exchange.fetch_balance()
    print(balance)
    
    # set trailing stop 

    # create market order and open position
    type = 'market'
    side = 'buy'
    amount = 0.1
    price = None
    create_order = await exchange.create_order(symbol, type, side, amount, price)
    print('Create order id:', create_order['id'])

    # set trailing stop
    trailing_stop = 30 # YOUR TRAILING STOP 
    rawSide = 'Buy' # or 'Sell'
    params = {
        'symbol': market['id'],
        'side':  rawSide,
        'trailing_stop': trailing_stop 
    }
    trailing_response = await exchange.privatePostPrivateLinearPositionTradingStop(params)
    print(trailing_response)

    # check opened position
    symbols = [ symbol ]
    positions = await exchange.fetch_positions(symbols)
    print(positions)

    # Close position by issuing a order in the opposite direction
    params = {
        'reduce_only': True
    }
    close_position_order = await exchange.createOrder(symbol, type, side, amount, price, params)
    print(close_position_order)

async def main():
    await example_2()

asyncio.run(main())


 
```