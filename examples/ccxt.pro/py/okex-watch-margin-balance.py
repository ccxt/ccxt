# -*- coding: utf-8 -*-

import asyncio
import ccxt.pro as ccxt
from pprint import pprint


async def main():
    exchange = ccxt.pro.okex({
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET',
        # okex requires this: https://github.com/ccxt/ccxt/wiki/Manual#authentication
        'password': 'YOUR_API_PASSWORD',
        'options': {
            'watchBalance': 'margin',
        },
        # comment it out if you don't want debug output
        # this is for the demo purpose only (to show the communication)
        'verbose': True,
    })
    while True:
        try:
            balance = await exchange.watch_balance({
                # okex watch_balance requires a symbol or an instrument_id
                'symbol': 'BTC/USDT',
            })
            # it will print the balance update when the balance changes
            # if the balance remains unchanged the exchange will not send it
            pprint(balance)
        except Exception as e:
            print('watch_balance() failed')
            print(e)
            break
    await exchange.close()


asyncio.run(main())
