import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
sys.path.append(root)

import asyncio
import ccxt.pro
import os

async def sleep(seconds):
    await asyncio.sleep(seconds)

async def main():
    # Configure the API and secret keys
    api_key = ''
    secret = ''

    # Initialize the exchange
    exchange = ccxt.pro.binanceusdm({
        'apiKey': api_key,
        'secret': secret
    })

    # Set to use the sandbox (testnet) environment
    exchange.set_sandbox_mode(True)
    symbol = 'XRP/USDT:USDT'

    # Watch orders (not directly translatable to Python; need to handle asynchronously)
    asyncio.create_task(exchange.watch_orders(symbol))

    # Simulate asynchronous order creation
    await sleep(10)
    order = await exchange.create_order(symbol, 'limit', 'buy', 10, 0.5)
    print('createOrder:', order['id'])

    await exchange.create_order(symbol, 'limit', 'buy', 11, 0.49)
    print('createOrder:', order['id'])

    await exchange.create_order(symbol, 'limit', 'buy', 11, 0.48)
    print('createOrder:', order['id'])

    # Watch orders for the symbol
    orders = await exchange.watch_orders('XRP/USDT')
    print('orders:', len(orders))

    # Use assertion to validate the number of orders
    assert len(orders) == 2, 'expecting 2 orders to be returned'

    # Close the connection
    await exchange.close()

# Run the main function
asyncio.run(main())
