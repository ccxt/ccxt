# -*- coding: utf-8 -*-

import ccxt.pro
from asyncio import run


print('CCXT Version:', ccxt.__version__)


# This example will run silent and will return your balance only when the balance is updated.
#
# 1. launch the example with your keys and keep it running
# 2. go to the trading section on the website
# 3. place a order on a spot market
# 4. see your balance updated in the example
#
# Warning! This example might produce a lot of output to your screen


async def watch_balance(exchange):
    await exchange.load_markets()
    # exchange.verbose = True  # uncomment for debugging purposes if necessary
    balance = await exchange.fetch_balance()
    print('---------------------------------------------------------')
    print(exchange.iso8601(exchange.milliseconds()))
    print(balance)
    print('')
    while True:
        try:
            update = await exchange.watch_balance()
            balance = exchange.deep_extend(balance, update)
            # it will print the balance update when the balance changes
            # if the balance remains unchanged the exchange will not send it
            print('---------------------------------------------------------')
            print(exchange.iso8601(exchange.milliseconds()))
            print(balance)
            print('')
        except Exception as e:
            print('watch_balance() failed')
            print(type(e).__name__, str(e))
            break


async def main():
    exchange = ccxt.pro.binance({
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET',
    })
    await watch_balance(exchange)
    await exchange.close()


run(main())
