# -*- coding: utf-8 -*-

from asyncio import run
import ccxt.pro as ccxt
from pprint import pprint


# This example will run silent and will return your balance only when the balance is updated.

# 1. launch the example with your keys and keep it running
# 2. go to the margin trading on the website
# 3. place a margin order on a spot market
# 4. see your balance updated in the example


async def main():
    exchange = ccxt.pro.binance({
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET',
        'options': {
            'defaultType': 'margin',
        },
        # comment it out if you don't want debug output
        # this is for the demo purpose only (to show the communication)
        'verbose': True,
    })
    while True:
        try:
            balance = await exchange.watch_balance()
            # it will print the balance update when the balance changes
            # if the balance remains unchanged the exchange will not send it
            pprint(balance)
        except Exception as e:
            print('watch_balance() failed')
            print(e)
            break
    await exchange.close()


run(main())
